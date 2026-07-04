"""AI Check-In Agent — produces a coach-ready weekly report before human review."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status

from ..ai_provider import analyze_json
from ..deps import AuthUser, require_coach_or_athlete
from ..schemas import CheckInReportResponse
from ..supabase_service import get_service_client, is_assigned_coach

router = APIRouter()

SYSTEM = (
    "You are the Ada2Physique Check-In Agent. Given a week of athlete data "
    "(bodyweight, measurements, training logs, nutrition adherence, sleep, energy), "
    "produce a concise coach-ready report: trend read, adherence, red flags, and "
    "recommended adjustments (volume, calories, cardio, recovery). Be specific and "
    "quantitative. Flag anything needing human-coach review. Return JSON only."
)
SCHEMA = (
    '{"title": string, "summary": string, '
    '"details": {"weight_trend": string, "adherence": number, "red_flags": [string], '
    '"recommendations": [string], "needs_coach_review": boolean}}'
)


@router.post("/checkins/{check_in_id}/report", response_model=CheckInReportResponse)
def checkin_report(check_in_id: str, user: AuthUser = Depends(require_coach_or_athlete)) -> CheckInReportResponse:
    client = get_service_client()
    ci = client.table("physique_check_ins").select("*").eq("id", check_in_id).limit(1).execute()
    if not ci.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Check-in not found")
    check_in = ci.data[0]
    athlete_id = check_in["athlete_id"]

    # Authorization: athlete owns it; coach must be assigned.
    if user.role == "athlete" and athlete_id != user.uid:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your check-in")
    if user.role == "coach" and not is_assigned_coach(user.uid, athlete_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to this athlete")

    # Gather the week's context (service-role; mirrors what RLS would expose).
    logs = client.table("physique_workout_logs").select("exercise_name,weight_kg,reps,rpe,logged_at").eq(
        "athlete_id", athlete_id
    ).order("logged_at", desc=True).limit(50).execute().data
    bw = client.table("physique_bodyweight").select("weighed_at,weight_kg").eq(
        "athlete_id", athlete_id
    ).order("weighed_at", desc=True).limit(14).execute().data
    sleep = client.table("physique_sleep_logs").select("slept_on,duration_hours,quality_score").eq(
        "athlete_id", athlete_id
    ).order("slept_on", desc=True).limit(7).execute().data

    prompt = (
        f"Check-in date: {check_in.get('check_in_date')}. "
        f"bodyweight_kg={check_in.get('bodyweight_kg')}, bodyfat_pct={check_in.get('bodyfat_pct')}, "
        f"measurements={check_in.get('measurements')}, energy={check_in.get('energy_level')}/10, "
        f"hunger={check_in.get('hunger_level')}/10, sleep_hours={check_in.get('sleep_hours')}, "
        f"athlete_notes={check_in.get('athlete_notes')}. "
        f"recent bodyweight: {bw}. recent workouts: {logs}. recent sleep: {sleep}."
    )
    try:
        parsed, result = analyze_json(prompt, SYSTEM, SCHEMA)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"AI provider unavailable: {exc}")

    # Persist the AI check-in report and link it back to the check-in.
    report_row = client.table("physique_ai_reports").insert({
        "athlete_id": athlete_id,
        "report_kind": "check_in",
        "source_ref": check_in["id"],
        "title": parsed.get("title", "Weekly check-in report"),
        "summary": parsed.get("summary", "")[:560],
        "details": parsed.get("details", {}),
        "model_used": result.model,
        "tokens_used": result.tokens,
    }).execute().data
    report_id = report_row[0]["id"] if report_row else None
    if report_id:
        client.table("physique_check_ins").update({"ai_report_id": report_id, "status": "submitted"}).eq("id", check_in["id"]).execute()

    return CheckInReportResponse(
        report_id=report_id,
        title=parsed.get("title", "Weekly check-in report"),
        summary=parsed.get("summary", ""),
        details=parsed.get("details", {}),
        model=result.model,
    )

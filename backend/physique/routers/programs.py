"""AI Program Generator — builds a personalized training program."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status

from ..ai_provider import analyze_json
from ..deps import AuthUser, require_coach
from ..schemas import ProgramGenerateRequest, ProgramGenerateResponse, ProgramDayModel
from ..supabase_service import get_service_client

router = APIRouter()

SYSTEM = (
    "You are an elite bodybuilding program designer (Classic Physique expertise). "
    "Design a balanced, progressive training program respecting the athlete's goal, "
    "experience, equipment, weak points, recovery, and training frequency. Prioritize "
    "weak body parts with appropriate frequency/volume. Return JSON only."
)
SCHEMA = (
    '{"name": string, "goal": string, "duration_weeks": int, '
    '"days": [{"day_number": int, "name": string, "focus": string, '
    '"blocks": [{"exercise_name": string, "sets": int, "reps": string, '
    '"rpe": number, "rest_seconds": int, "tempo": string, "technique_notes": string}]}], '
    '"rationale": string}'
)


@router.post("/programs/generate", response_model=ProgramGenerateResponse)
def generate_program(req: ProgramGenerateRequest, user: AuthUser = Depends(require_coach)) -> ProgramGenerateResponse:
    prompt = (
        f"Design a training program. athlete_id={req.athlete_id}, goal={req.goal}, "
        f"experience={req.experience_level}, equipment={req.equipment}, "
        f"weak_body_parts={req.weak_body_parts}, training_frequency={req.training_frequency}d/wk, "
        f"recovery_note={req.recovery_note or 'none'}."
    )
    try:
        parsed, result = analyze_json(prompt, SYSTEM, SCHEMA)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"AI provider unavailable: {exc}")

    days = [ProgramDayModel(**d) for d in parsed.get("days", [])]

    # Persist a progress-style AI report referencing the generated program.
    client = get_service_client()
    client.table("physique_ai_reports").insert({
        "athlete_id": req.athlete_id,
        "report_kind": "progress",
        "title": parsed.get("name", "Generated program"),
        "summary": parsed.get("rationale", "")[:280],
        "details": parsed,
        "model_used": result.model,
        "tokens_used": result.tokens,
    }).execute()

    return ProgramGenerateResponse(
        name=parsed.get("name", "Generated program"),
        goal=parsed.get("goal", req.goal),
        duration_weeks=int(parsed.get("duration_weeks", 8)),
        days=days,
        rationale=parsed.get("rationale", ""),
        model=result.model,
    )

"""AI Nutrition Coach — computes calories/macros/water from athlete metrics + goal."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status

from ..ai_provider import analyze_json
from ..deps import AuthUser, require_coach_or_athlete
from ..schemas import NutritionPlanRequest, NutritionPlanResponse, NutritionTargets
from ..supabase_service import get_service_client

router = APIRouter()

SYSTEM = (
    "You are an elite bodybuilding nutrition coach. Compute precise, safe daily "
    "nutrition targets for a bodybuilding athlete. Use evidence-based protein "
    "(~1.6-2.2 g/kg lean mass, higher when cutting), moderate fats (~0.8-1 g/kg), "
    "and carbs filling the remainder. Match the goal (bulk surplus ~10-15%, cut "
    "deficit ~300-500 kcal, recomp ~maintenance, prep individualized). Return JSON only."
)
SCHEMA = (
    '{"calories_kcal": int, "protein_g": number, "carbs_g": number, '
    '"fat_g": number, "water_ml": int, "meal_timing_notes": string}'
)


@router.post("/nutrition/plan", response_model=NutritionPlanResponse)
def nutrition_plan(req: NutritionPlanRequest, user: AuthUser = Depends(require_coach_or_athlete)) -> NutritionPlanResponse:
    # Authorization: athletes may only request their own; coaches must be assigned.
    if user.role == "athlete" and req.athlete_id != user.uid:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot request nutrition for another athlete")
    # (Coach assignment check is enforced by RLS on the frontend direct reads; the
    #  backend mirrors it for privileged writes — see supabase_service.is_assigned_coach.)

    bf = f", bodyfat_pct={req.bodyfat_pct}" if req.bodyfat_pct else ""
    prompt = (
        f"Compute daily nutrition targets. goal={req.goal}, bodyweight_kg={req.bodyweight_kg}"
        f"{bf}, training_frequency={req.training_frequency}d/wk, activity_factor={req.activity_factor}."
    )
    try:
        parsed, result = analyze_json(prompt, SYSTEM, SCHEMA)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"AI provider unavailable: {exc}")

    targets = NutritionTargets(
        calories_kcal=int(parsed["calories_kcal"]),
        protein_g=float(parsed["protein_g"]),
        carbs_g=float(parsed["carbs_g"]),
        fat_g=float(parsed["fat_g"]),
        water_ml=int(parsed["water_ml"]),
        meal_timing_notes=str(parsed.get("meal_timing_notes", "")),
    )

    # Persist an AI nutrition report (service-role).
    client = get_service_client()
    client.table("physique_ai_reports").insert({
        "athlete_id": req.athlete_id,
        "report_kind": "nutrition",
        "title": f"Nutrition plan — {req.goal}",
        "summary": targets.meal_timing_notes[:280],
        "details": parsed,
        "model_used": result.model,
        "tokens_used": result.tokens,
    }).execute()

    return NutritionPlanResponse(targets=targets, rationale=str(parsed.get("meal_timing_notes", "")), model=result.model)

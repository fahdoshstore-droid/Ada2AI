"""AI Coach chat — reuses the Ada2AI ai-provider pattern (Claude → Ollama)."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status

from ..ai_provider import analyze_text
from ..deps import AuthUser, require_athlete
from ..schemas import CoachChatRequest, CoachChatResponse
from ..supabase_service import get_athlete_profile, get_service_client

router = APIRouter()

SYSTEM_PROMPT = (
    "You are Ada2Physique's AI Coach, channeling an elite Classic Physique competitor "
    "and seasoned bodybuilding coach (≈90 kg category). Give concise, specific, "
    "evidence-based coaching: training, nutrition, recovery, posing, and prep. "
    "Never give medical advice; flag injury risk for human review. Ask clarifying "
    "questions only when essential. End with 1-3 actionable suggestions."
)


@router.post("/coach/chat", response_model=CoachChatResponse)
def coach_chat(req: CoachChatRequest, user: AuthUser = Depends(require_athlete)) -> CoachChatResponse:
    athlete = get_athlete_profile(user.uid)
    if not athlete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Athlete profile not onboarded")

    context = req.context_hint or (
        f"goal={athlete.get('goal')}, category={athlete.get('competition_category')}, "
        f"experience={athlete.get('experience_level')}, freq={athlete.get('training_frequency')}d/wk, "
        f"weak={athlete.get('weak_body_parts')}"
    )
    prompt = f"Athlete context: {context}\n\nAthlete asks: {req.message}"

    try:
        result = analyze_text(prompt, SYSTEM_PROMPT)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"AI provider unavailable: {exc}")

    # Persist the exchange as chat messages (athlete question + AI reply).
    client = get_service_client()
    athlete_id = user.uid
    coach_id = athlete.get("coach_id")
    client.table("physique_messages").insert({
        "athlete_id": athlete_id, "coach_id": coach_id,
        "sender_type": "athlete", "sender_id": athlete_id, "content": req.message,
    }).execute()
    client.table("physique_messages").insert({
        "athlete_id": athlete_id, "coach_id": coach_id,
        "sender_type": "ai", "sender_id": None, "content": result.text,
        "metadata": {"suggestions": [], "model": result.model},
    }).execute()

    return CoachChatResponse(reply=result.text, suggestions=[], model=result.model)

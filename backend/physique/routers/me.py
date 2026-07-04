"""Identity endpoint — current user + Ada2Physique onboarding status."""
from __future__ import annotations
from fastapi import APIRouter, Depends

from ..deps import AuthUser, get_current_user
from ..schemas import MeResponse
from ..supabase_service import get_athlete_profile, get_coach_profile

router = APIRouter()


@router.get("/me", response_model=MeResponse)
def me(user: AuthUser = Depends(get_current_user)) -> MeResponse:
    profile = None
    if user.role == "athlete":
        profile = get_athlete_profile(user.uid)
    elif user.role == "coach":
        profile = get_coach_profile(user.uid)
    return MeResponse(
        uid=user.uid,
        email=user.email,
        user_type=user.user_type,
        role=user.role,
        onboarded=bool(profile),
        profile=profile,
    )

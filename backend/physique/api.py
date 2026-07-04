"""Ada2Physique API router — aggregates all Phase 1 endpoints under /physique/v1.

Import and include into the Ada2AI FastAPI app:
    from backend.physique.api import router as physique_router
    app.include_router(physique_router)
"""
from __future__ import annotations
from fastapi import APIRouter

from .ai_provider import get_provider_status
from .routers.admin import router as admin_router
from .routers.checkins import router as checkins_router
from .routers.coach import router as coach_router
from .routers.me import router as me_router
from .routers.nutrition import router as nutrition_router
from .routers.programs import router as programs_router
from .routers.uploads import router as uploads_router

router = APIRouter(prefix="/physique/v1", tags=["ada2physique"])
router.include_router(me_router)
router.include_router(coach_router)
router.include_router(nutrition_router)
router.include_router(programs_router)
router.include_router(checkins_router)
router.include_router(uploads_router)
router.include_router(admin_router)


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ada2physique", "version": "1.0.0", "ai": get_provider_status()}

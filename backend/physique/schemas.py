"""Pydantic v2 request/response models for Ada2Physique AI endpoints."""
from __future__ import annotations
from typing import Optional, Any
from pydantic import BaseModel, Field


# ── Identity ────────────────────────────────────────────────────────
class MeResponse(BaseModel):
    uid: str
    email: Optional[str] = None
    user_type: Optional[str] = None
    role: Optional[str] = None
    onboarded: bool = False
    profile: Optional[dict[str, Any]] = None


# ── AI Coach chat ───────────────────────────────────────────────────
class CoachChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    thread_athlete_id: Optional[str] = None  # defaults to the caller's athlete id
    context_hint: Optional[str] = None  # e.g. "prep week 4, 88kg, cutting"


class CoachChatResponse(BaseModel):
    reply: str
    suggestions: list[str] = Field(default_factory=list)
    report_id: Optional[str] = None
    model: str


# ── AI Nutrition Coach ──────────────────────────────────────────────
class NutritionPlanRequest(BaseModel):
    athlete_id: str
    goal: str = Field(..., description="bulk|cut|recomp|prep|maintain")
    bodyweight_kg: float
    bodyfat_pct: Optional[float] = None
    training_frequency: int = Field(5, ge=1, le=7)
    activity_factor: float = Field(1.55, ge=1.2, le=2.0)


class NutritionTargets(BaseModel):
    calories_kcal: int
    protein_g: float
    carbs_g: float
    fat_g: float
    water_ml: int
    meal_timing_notes: str


class NutritionPlanResponse(BaseModel):
    targets: NutritionTargets
    rationale: str
    model: str


# ── AI Program Generator ────────────────────────────────────────────
class ProgramGenerateRequest(BaseModel):
    athlete_id: str
    goal: str
    experience_level: str
    equipment: list[str] = Field(default_factory=lambda: ["gym"])
    weak_body_parts: list[str] = Field(default_factory=list)
    training_frequency: int = Field(5, ge=2, le=7)
    recovery_note: Optional[str] = None


class ProgramDayModel(BaseModel):
    day_number: int
    name: str
    focus: str
    blocks: list[dict[str, Any]] = Field(default_factory=list)


class ProgramGenerateResponse(BaseModel):
    name: str
    goal: str
    duration_weeks: int
    days: list[ProgramDayModel]
    rationale: str
    model: str


# ── AI Check-In Agent ───────────────────────────────────────────────
class CheckInReportResponse(BaseModel):
    report_id: str
    title: str
    summary: str
    details: dict[str, Any]
    model: str


# ── Signed uploads ──────────────────────────────────────────────────
class SignUploadRequest(BaseModel):
    bucket: str = Field(..., description="physique-videos | physique-photos")
    content_type: str = "application/octet-stream"
    ext: str = "mp4"
    label: Optional[str] = Field(None, description="Optional filename prefix, e.g. front|side|back")


class SignUploadResponse(BaseModel):
    path: str
    signed_url: str
    expires_in: int


class SignedUrlRequest(BaseModel):
    bucket: str = Field(..., description="physique-videos | physique-photos")
    path: str = Field(..., description="Object path inside the bucket (<uid>/...)")


class SignedUrlResponse(BaseModel):
    signed_url: str
    expires_in: int


# ── Admin stats ─────────────────────────────────────────────────────
class AdminStatsResponse(BaseModel):
    athletes: int
    coaches: int
    active_assignments: int
    programs: int
    nutrition_plans: int
    check_ins_30d: int
    ai_reports_30d: int

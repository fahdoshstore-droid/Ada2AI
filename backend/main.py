"""
Ada2AI Vision API — Sports Intelligence Infrastructure

FastAPI server backed by unified VisionPipeline.
All analysis routes through a single pipeline: detect → track → pose → events → graph.
"""

import os
import tempfile
from pathlib import Path
from typing import Optional, List, Dict
import json

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth_middleware import AuthMiddleware

from vision_core import VisionConfig, VisionPipeline
from vision_core.config import COCOClasses
from sportid_routes import router as sportid_router


app = FastAPI(
    title="Ada2AI Vision API",
    description="Sports Intelligence Infrastructure — Unified Vision Pipeline",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("CORS_ORIGIN", "http://localhost:3000"),
        "http://localhost:3000",
        "http://localhost:3001",
        "https://ada2ai.com",
        "https://www.ada2ai.com",
        os.getenv("VERCEL_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# ── Auth Middleware (Closed Pilot Mode) ─────────────
app.add_middleware(AuthMiddleware)

# Include SportID routes
app.include_router(sportid_router)


# ── Pipeline Initialization ──────────────────────────
_pipeline: Optional[VisionPipeline] = None


def get_pipeline() -> VisionPipeline:
    """Get or create the unified VisionPipeline."""
    global _pipeline
    if _pipeline is None:
        config = VisionConfig(
            model_name="yolo11",
            model_size="n",
            confidence_threshold=0.4,
            pose_enabled=False,
            tracking_backend="bytetrack",
        )
        _pipeline = VisionPipeline(config)
    return _pipeline


@app.on_event("startup")
async def startup_event():
    """Pre-warm models on startup."""
    print("[Startup] Initializing VisionPipeline...")
    pipeline = get_pipeline()
    # Force model load
    _ = pipeline.detector.model
    print("[Startup] Initializing SportID database...")
    from sportid_routes import init_db
    init_db()
    print("[Startup] Initialization complete.")


# ── Health ─────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "ok", "message": "Ada2AI Vision API v3.0", "pipeline": "unified"}


@app.get("/health")
async def health():
    return {"status": "healthy", "pipeline": "vision_core"}


# ── Pydantic Models ───────────────────────────────────
class AnalysisConfig(BaseModel):
    conf_threshold: float = 0.4
    frame_interval: int = 5
    max_frames: Optional[int] = None
    pixels_per_meter: float = 100.0
    pose_enabled: bool = False
    tracking_backend: str = "bytetrack"


class SinglePlayerResponse(BaseModel):
    track_id: int
    total_distance_meters: float
    average_speed_mps: float
    max_speed_mps: float
    positions: List[Dict]
    frames_analyzed: int


class TeamAnalysisResponse(BaseModel):
    total_players_detected: int
    team1_count: int
    team2_count: int
    formation: Dict
    tracks: Dict


# ── Single Player Analysis ────────────────────────────
@app.post("/analyze/single")
async def analyze_single_player(
    video: UploadFile = File(...),
    conf_threshold: float = Form(0.4),
    frame_interval: int = Form(5),
    max_frames: Optional[int] = Form(None),
    pixels_per_meter: float = Form(100.0),
    pose_enabled: bool = Form(False),
):
    """
    Analyze dominant player movement in video.

    Uses unified VisionPipeline: detect → track → speed → distance.
    """
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
        tmp.write(await video.read())
        tmp_path = tmp.name

    try:
        # Create a config for this request
        config = VisionConfig(
            model_name="yolo11",
            model_size="n",
            confidence_threshold=conf_threshold,
            frame_stride=frame_interval,
            max_frames=max_frames,
            pixels_per_meter=pixels_per_meter,
            pose_enabled=pose_enabled,
            tracking_backend="bytetrack",
        )
        pipeline = VisionPipeline(config)
        result = pipeline.analyze_single_player(tmp_path)

        if result.get("status") == "failed":
            raise HTTPException(status_code=400, detail=result.get("error", "Analysis failed"))

        return JSONResponse(result)
    finally:
        os.unlink(tmp_path)


# ── Team Analysis ─────────────────────────────────────
@app.post("/analyze/team")
async def analyze_team(
    video: UploadFile = File(...),
    conf_threshold: float = Form(0.4),
    frame_interval: int = Form(5),
    max_frames: Optional[int] = Form(None),
    pose_enabled: bool = Form(False),
):
    """
    Analyze team formations and coordination.

    Uses unified VisionPipeline: detect → track → team assignment → formation.
    """
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
        tmp.write(await video.read())
        tmp_path = tmp.name

    try:
        config = VisionConfig(
            model_name="yolo11",
            model_size="n",
            confidence_threshold=conf_threshold,
            frame_stride=frame_interval,
            max_frames=max_frames,
            pose_enabled=pose_enabled,
        )
        pipeline = VisionPipeline(config)
        result = pipeline.analyze_team(tmp_path)

        if result.get("status") == "failed":
            raise HTTPException(status_code=400, detail=result.get("error", "Analysis failed"))

        return JSONResponse(result)
    finally:
        os.unlink(tmp_path)


# ── Single Frame Detection ────────────────────────────
@app.post("/detect/frame")
async def detect_frame(file: UploadFile = File(...)):
    """
    Detect players in a single image frame.
    """
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        import cv2
        pipeline = get_pipeline()
        frame = cv2.imread(tmp_path)
        if frame is None:
            raise HTTPException(status_code=400, detail="Could not read image")

        result = pipeline.analyze_frame(frame)

        return JSONResponse({
            "player_count": len(result.get("detections", [])),
            "players": result.get("detections", []),
            "tracked_players": result.get("tracked_players", []),
        })
    finally:
        os.unlink(tmp_path)


# ── Full Video Analysis (NEW — Phase 4-6) ────────────
@app.post("/analyze/full")
async def analyze_full_video(
    video: UploadFile = File(...),
    conf_threshold: float = Form(0.4),
    frame_stride: int = Form(1),
    pose_enabled: bool = Form(False),
    pixels_per_meter: float = Form(100.0),
):
    """
    Full video analysis: detect → track → pose → events → graph.

    Returns complete intelligence output including:
    - Player tracking with velocity/acceleration
    - Formation analysis
    - Semantic events (pass, sprint, shot, pressure, transition, possession)
    - Graph-ready player and event nodes
    - Tactical zone analysis
    """
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
        tmp.write(await video.read())
        tmp_path = tmp.name

    try:
        config = VisionConfig(
            model_name="yolo11",
            model_size="n",
            confidence_threshold=conf_threshold,
            frame_stride=frame_stride,
            pixels_per_meter=pixels_per_meter,
            pose_enabled=pose_enabled,
            tracking_backend="bytetrack",
        )
        pipeline = VisionPipeline(config)
        result = pipeline.analyze_video(tmp_path)

        if result.get("status") == "failed":
            raise HTTPException(status_code=400, detail=result.get("error", "Analysis failed"))

        # ── Enrich Intelligence Bridge with REAL data ──
        enrichment = _bridge.enrich(result)

        # Strip raw frames from response to keep it lean
        result.pop("frames", None)

        # Attach enrichment summary so frontend knows intelligence is ready
        result["intelligence_enrichment"] = enrichment

        return JSONResponse(result)
    finally:
        os.unlink(tmp_path)


# ── Vision Config ─────────────────────────────────────
@app.get("/config")
async def get_current_config():
    """Get current vision pipeline configuration."""
    pipeline = get_pipeline()
    config = pipeline.config
    return {
        "model": config.detection_model_path,
        "device": config.device,
        "confidence_threshold": config.confidence_threshold,
        "tracking_backend": config.tracking_backend,
        "pose_enabled": config.pose_enabled,
        "segmentation_enabled": config.segmentation_enabled,
        "frame_stride": config.frame_stride,
        "sports_ball_class": COCOClasses.SPORTS_BALL,
        "detect_classes": config.detect_classes,
    }


# ── Intelligence Layer Routes ─────────────────────────
from intelligence.ontology import FootballOntology
from intelligence.bridge import IntelligenceBridge
from intelligence.schemas import GRAPH_SCHEMA
from copilot import ScoutCopilot
from feedback import FeedbackStore, ScoutFeedback

_ontology = FootballOntology()
_bridge = IntelligenceBridge(_ontology)
_feedback_store = FeedbackStore()

# Legacy copilot V1 (kept for backward compat)
_copilot = ScoutCopilot(
    _ontology,
    _bridge.role_engine,
    _bridge.dna_engine,
    _bridge.similarity_engine,
    _bridge.scout_engine,
)


# ── Ontology ──────────────────────────────────────────
@app.get("/intelligence/ontology")
async def get_ontology():
    """Get full football ontology (roles, concepts, events)."""
    return _ontology.to_dict()


@app.get("/intelligence/ontology/roles")
async def get_ontology_roles():
    """Get all tactical role definitions."""
    return {rid: {"ar": r.name_ar, "en": r.name_en, "traits": r.key_traits, "zones": r.zone_tendency}
            for rid, r in _ontology.get_all_roles().items()}


@app.get("/intelligence/ontology/concepts")
async def get_ontology_concepts():
    """Get all tactical concept definitions."""
    return {cid: {"ar": c.name_ar, "en": c.name_en, "triggers": c.event_triggers}
            for cid, c in _ontology.get_all_concepts().items()}


@app.get("/intelligence/ontology/events")
async def get_ontology_events():
    """Get all event category definitions."""
    return {eid: {"ar": e.name_ar, "en": e.name_en, "derived_from": e.derived_from}
            for eid, e in _ontology.get_all_event_categories().items()}


# ── Role Evaluation ───────────────────────────────────
class RoleEvalRequest(BaseModel):
    target_role: str


@app.post("/intelligence/roles/evaluate/{track_id}")
async def evaluate_player_role(track_id: int, request: RoleEvalRequest):
    """
    Evaluate a specific player (from latest full analysis) against a role.
    Data source: IntelligenceBridge — populated by /analyze/full → enrich()
    """
    if not _bridge.has_data():
        raise HTTPException(status_code=404, detail="Run /analyze/full first. No analysis data available.")

    result = _bridge.evaluate_role(track_id, request.target_role)
    if result is None:
        raise HTTPException(status_code=400, detail=f"Player {track_id} not found or role '{request.target_role}' invalid.")

    return result


# ── DNA Profiles ──────────────────────────────────────
@app.get("/intelligence/dna")
async def get_dna_traits():
    """Get all available DNA trait definitions."""
    from intelligence.dna import DNA_TRAITS
    return DNA_TRAITS

# ── Player Intelligence Summary ──────────────────────
@app.get("/intelligence/player/{track_id}")
async def get_player_intelligence(track_id: int):
    """
    Get complete intelligence summary for a player.
    Combines DNA, role fit, temporal profile, and recommendations.
    Data source: IntelligenceBridge — populated by /analyze/full.
    """
    if not _bridge.has_data():
        raise HTTPException(status_code=404, detail="No analysis data available. Run /analyze/full first.")

    # Gather all intelligence for this player
    dna_profiles = _bridge._dna_profiles
    dna = dna_profiles.get(track_id)
    if dna is None:
        raise HTTPException(status_code=404, detail=f"Player {track_id} not found in analysis data.")

    # Role evaluations for all roles
    roles = {}
    for rid, r in _ontology.get_all_roles().items():
        try:
            result = _bridge.evaluate_role(track_id, rid)
            if result:
                roles[rid] = result
        except Exception:
            pass

    # Temporal profile
    temporal = _bridge.get_temporal_profile(track_id)

    # Explanation
    try:
        explain = _bridge.explain("role_fit", {"track_id": track_id, "role": list(roles.keys())[0] if roles else "unknown"})
    except Exception:
        explain = None

    return {
        "track_id": track_id,
        "dna": {
            "team": dna.team,
            "traits": dna.traits,
            "labels": dna.labels,
            "consistency_score": dna.consistency_score,
        },
        "role_fits": roles,
        "temporal_profile": temporal,
        "explanation": explain,
    }

@app.get("/intelligence/players")
async def get_all_players_intelligence():
    """
    Get intelligence summary for ALL players from latest analysis.
    Returns list of {track_id, team, labels, consistency, best_role, role_score}.
    """
    if not _bridge.has_data():
        raise HTTPException(status_code=404, detail="No analysis data available. Run /analyze/full first.")

    players = []
    for track_id, dna in _bridge._dna_profiles.items():
        # Find best role fit
        best_role = None
        best_score = 0
        for rid, r in _ontology.get_all_roles().items():
            try:
                result = _bridge.evaluate_role(track_id, rid)
                if result and result.get("score", 0) > best_score:
                    best_score = result["score"]
                    best_role = rid
            except Exception:
                pass

        players.append({
            "track_id": track_id,
            "team": dna.team,
            "labels": dna.labels,
            "consistency_score": dna.consistency_score,
            "best_role": best_role,
            "best_role_score": round(best_score, 3) if best_score else None,
        })

    return {"players": players}


# ── Similarity ────────────────────────────────────────
class SimilarityRequest(BaseModel):
    source_id: int
    top_n: int = 5


@app.post("/intelligence/similarity")
async def find_similar_players(request: SimilarityRequest):
    """Find stylistically similar players from latest analysis.
    Data source: IntelligenceBridge — REAL DNA profiles only."""
    if not _bridge.has_data():
        raise HTTPException(status_code=404, detail="Run /analyze/full first. No DNA profiles available.")

    result = _bridge.find_similar(request.source_id, top_n=request.top_n)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Player {request.source_id} not found or no candidates available.")

    return result


# ── Scout Recommendations ─────────────────────────────
class ScoutRecRequest(BaseModel):
    club_id: str
    target_role: str
    top_n: int = 5


@app.post("/intelligence/recommend")
async def scout_recommend(request: ScoutRecRequest):
    """Generate contextual recruitment recommendations.
    Data source: IntelligenceBridge — REAL signatures + DNA + ClubIdentity.
    style_weights NOW populated from ClubIdentityEngine (was empty dict before)."""
    if not _bridge.has_data():
        raise HTTPException(status_code=404, detail="Run /analyze/full first. No player data available.")

    result = _bridge.recommend(request.club_id, request.target_role, top_n=request.top_n)
    if result is None:
        raise HTTPException(status_code=404, detail="No complete player profiles or club identity available.")

    return result


# ── Copilot ───────────────────────────────────────────
class CopilotRequest(BaseModel):
    query: str


@app.post("/intelligence/copilot")
async def copilot_query(request: CopilotRequest):
    """
    Arabic-first natural language football intelligence.
    Data source: IntelligenceBridge — REAL data only.

    Examples:
      "اعطني أفضل جناح للتحولات السريعة"
      "لاعب يشبه #7 في التحرك"
      "أنسب محور لنظام الضغط العالي"
    """
    if not _bridge.has_data():
        raise HTTPException(status_code=404, detail="Run /analyze/full first. No analysis data available.")

    # Build profiles dict from bridge caches (REAL data)
    profiles = {}
    for pid, sig in _bridge.get_all_signatures().items():
        dna = _bridge.get_dna(pid)
        if dna:
            profiles[pid] = (sig, dna)

    response = _copilot.query(request.query, player_profiles=profiles)
    return {
        "answer": response.answer_ar,
        "data": response.data,
        "citations": response.citations,
        "query_type": response.query_type,
    }


# ── Feedback ──────────────────────────────────────────
class FeedbackNoteRequest(BaseModel):
    player_id: int
    note: str
    source: str = "scout"


class FeedbackVerdictRequest(BaseModel):
    player_id: int
    role_id: str
    accepted: bool
    note: str = ""
    corrected_role: Optional[str] = None


class FeedbackCorrectionRequest(BaseModel):
    player_id: int
    corrected_role: str
    corrected_score: float
    note: str = ""


@app.post("/intelligence/feedback/note")
async def add_feedback_note(request: FeedbackNoteRequest):
    """Add a scout/coach note on a player."""
    fb = _feedback_store.add_note(request.player_id, request.note, request.source)
    return {"status": "saved", "feedback_id": fb.feedback_id}


@app.post("/intelligence/feedback/verdict")
async def add_feedback_verdict(request: FeedbackVerdictRequest):
    """Accept or reject a recommendation."""
    if request.accepted:
        fb = _feedback_store.accept_recommendation(request.player_id, request.role_id, request.note)
    else:
        fb = _feedback_store.reject_recommendation(
            request.player_id, request.role_id, request.note,
            corrected_role=request.corrected_role or "",
        )
    return {"status": "saved", "feedback_id": fb.feedback_id, "type": fb.feedback_type}


@app.post("/intelligence/feedback/correction")
async def add_feedback_correction(request: FeedbackCorrectionRequest):
    """Add a tactical correction from a coach."""
    fb = _feedback_store.add_correction(request.player_id, request.corrected_role, request.corrected_score, request.note)
    return {"status": "saved", "feedback_id": fb.feedback_id}


@app.get("/intelligence/feedback/insights")
async def get_feedback_insights():
    """Get feedback-driven intelligence insights."""
    return _feedback_store.get_insights()


@app.get("/intelligence/feedback/player/{player_id}")
async def get_player_feedback(player_id: int):
    """Get all feedback for a specific player."""
    feedbacks = _feedback_store.get_for_player(player_id)
    return {"player_id": player_id, "feedbacks": [f.to_dict() for f in feedbacks]}


# ── Graph Schema ──────────────────────────────────────
@app.get("/intelligence/graph/schema")
async def get_graph_schema():
    """Get graph-ready data architecture (schema only — no DB deployed)."""
    return GRAPH_SCHEMA


# ── Temporal Intelligence (new — via Bridge) ─────────
@app.get("/intelligence/temporal/{player_id}")
async def get_temporal_profile(player_id: int):
    """Get temporal evolution profile for a player. REAL data from Bridge."""
    if not _bridge.has_data():
        raise HTTPException(status_code=404, detail="Run /analyze/full first.")
    result = _bridge.get_temporal_profile(player_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"No temporal data for player {player_id}.")
    return result


# ── Match Timeline (new — via Bridge) ───────────────
@app.get("/intelligence/timeline")
async def get_match_timeline():
    """Get match narrative from real event timeline. REAL data from Bridge."""
    if not _bridge.has_data():
        raise HTTPException(status_code=404, detail="Run /analyze/full first.")
    result = _bridge.get_match_timeline()
    if result is None:
        raise HTTPException(status_code=404, detail="No match timeline available.")
    return result


# ── Explainability (new — via Bridge) ────────────────
class ExplainRequest(BaseModel):
    output_type: str  # role_fit | dna | similarity | recommendation | timeline
    data: dict


@app.post("/intelligence/explain")
async def explain_intelligence(request: ExplainRequest):
    """Explain any intelligence output with evidence + confidence."""
    result = _bridge.explain(request.output_type, request.data)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result)
    return result


# ── Intelligence Status ──────────────────────────────
@app.get("/intelligence/status")
async def get_intelligence_status():
    """Check what intelligence data is currently available."""
    return {
        "has_data": _bridge.has_data(),
        "signatures_count": len(_bridge._signatures),
        "dna_profiles_count": len(_bridge._dna_profiles),
        "events_count": len(_bridge._events_timeline),
        "match_meta": _bridge.get_match_meta(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
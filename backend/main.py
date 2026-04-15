"""
Ada2AI YOLO Video Analysis API
FastAPI server for football video analysis with YOLO
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

from video_processor import VideoProcessor
from yolo_analyzer import YOLOAnalyzer
from player_tracker import PlayerTracker, generate_formation_map
from sportid_routes import router as sportid_router


app = FastAPI(
    title="Ada2AI YOLO Video Analysis API",
    description="Football video analysis with YOLO object detection + SportID System",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("CORS_ORIGIN", "http://localhost:3000"),
        "http://localhost:3000",   # Vite dev server
        "http://localhost:3001",    # Alternative dev port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include SportID routes
app.include_router(sportid_router)


# Initialize models (lazy loading)
yolo_analyzer: Optional[YOLOAnalyzer] = None
player_tracker: Optional[PlayerTracker] = None


def get_yolo() -> YOLOAnalyzer:
    """Get or create YOLO analyzer instance."""
    global yolo_analyzer
    if yolo_analyzer is None:
        yolo_analyzer = YOLOAnalyzer()
    return yolo_analyzer


def get_tracker() -> PlayerTracker:
    """Get or create player tracker instance."""
    global player_tracker
    if player_tracker is None:
        player_tracker = PlayerTracker()
    return player_tracker


# Pydantic models for request/response
class AnalysisConfig(BaseModel):
    conf_threshold: float = 0.5
    frame_interval: int = 5
    max_frames: Optional[int] = None
    pixels_per_meter: float = 100.0


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


@app.get("/")
async def root():
    """API health check."""
    return {"status": "ok", "message": "Ada2AI YOLO Video Analysis API"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/analyze/single")
async def analyze_single_player(
    video: UploadFile = File(...),
    conf_threshold: float = Form(0.5),
    frame_interval: int = Form(5),
    max_frames: Optional[int] = Form(None),
    pixels_per_meter: float = Form(100.0)
):
    """
    Analyze a single player's movement in a video.
    
    Args:
        video: Video file upload
        conf_threshold: YOLO confidence threshold
        frame_interval: Extract every N frames
        max_frames: Maximum frames to process
        pixels_per_meter: Conversion factor for speed calculation
    
    Returns:
        Single player analysis results
    """
    # Save uploaded video to temp file
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
        tmp.write(await video.read())
        tmp_path = tmp.name
    
    try:
        analyzer = get_yolo()
        tracker = get_tracker()
        tracker.reset()
        
        # Process video
        with VideoProcessor(tmp_path) as vp:
            video_info = vp.get_video_info()
            frames = vp.extract_frames(frame_interval, max_frames)
        
        if not frames:
            raise HTTPException(status_code=400, detail="No frames extracted from video")
        
        # Analyze frames and track players
        fps = video_info["fps"]
        frame_detections = []
        
        for frame_num, frame in frames:
            detections = analyzer.detect_players(frame, conf_threshold)
            tracker.update(detections)
            frame_detections.append({
                "frame_number": frame_num,
                "players": detections
            })
        
        tracks = tracker.get_tracks()
        
        if not tracks:
            raise HTTPException(status_code=400, detail="No players detected in video")
        
        # Get the player with most frames (main player)
        main_track_id = max(tracks.keys(), key=lambda tid: len(tracks[tid]["positions"]))
        track = tracks[main_track_id]
        
        # Calculate stats
        total_distance = 0.0
        positions = []
        speeds = []
        
        for i in range(1, len(track["positions"])):
            prev = track["positions"][i - 1]
            curr = track["positions"][i]
            
            dx = curr["center"][0] - prev["center"][0]
            dy = curr["center"][1] - prev["center"][1]
            dist_px = (dx ** 2 + dy ** 2) ** 0.5
            dist_m = dist_px / pixels_per_meter
            total_distance += dist_m
            
            frame_diff = curr["frame"] - prev["frame"]
            time_diff = frame_diff / fps
            if time_diff > 0:
                speeds.append(dist_m / time_diff)
            
            positions.append({
                "x": curr["center"][0],
                "y": curr["center"][1],
                "frame": curr["frame"]
            })
        
        return JSONResponse({
            "track_id": main_track_id,
            "total_distance_meters": round(total_distance, 2),
            "average_speed_mps": round(sum(speeds) / len(speeds), 2) if speeds else 0,
            "max_speed_mps": round(max(speeds), 2) if speeds else 0,
            "positions": positions,
            "frames_analyzed": len(frames),
            "video_info": video_info
        })
    
    finally:
        os.unlink(tmp_path)


@app.post("/analyze/team")
async def analyze_team(
    video: UploadFile = File(...),
    conf_threshold: float = Form(0.5),
    frame_interval: int = Form(5),
    max_frames: Optional[int] = Form(None)
):
    """
    Analyze team formations and coordination.
    
    Args:
        video: Video file upload
        conf_threshold: YOLO confidence threshold
        frame_interval: Extract every N frames
        max_frames: Maximum frames to process
    
    Returns:
        Team analysis results with formation data
    """
    # Save uploaded video
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
        tmp.write(await video.read())
        tmp_path = tmp.name
    
    try:
        analyzer = get_yolo()
        tracker = get_tracker()
        tracker.reset()
        
        # Process video
        with VideoProcessor(tmp_path) as vp:
            video_info = vp.get_video_info()
            frames = vp.extract_frames(frame_interval, max_frames)
        
        if not frames:
            raise HTTPException(status_code=400, detail="No frames extracted from video")
        
        # Analyze frames
        all_detections = []
        
        for frame_num, frame in frames:
            detections = analyzer.detect_players(frame, conf_threshold)
            tracker.update(detections)
            all_detections.append({
                "frame_number": frame_num,
                "player_count": len(detections),
                "players": detections
            })
        
        tracks = tracker.get_tracks()
        
        # Assign teams based on position (simplified - left/right side)
        frame_width = video_info["width"]
        teams = {}
        
        for track_id, track in tracks.items():
            if track["positions"]:
                latest = track["positions"][-1]
                center_x = latest["center"][0]
                
                # Simple team assignment based on position
                team_id = 1 if center_x < frame_width / 2 else 2
                teams[track_id] = team_id
        
        tracker.assign_teams(teams)
        
        # Generate formation map
        formation = generate_formation_map(
            tracks, 
            video_info["width"], 
            video_info["height"]
        )
        
        return JSONResponse({
            "total_players_detected": len(tracks),
            "team1_count": formation["formation_1v1"],
            "team2_count": formation["formation_1v2"],
            "formation": formation,
            "tracks": {
                str(tid): {
                    "team": track["team"],
                    "positions": track["positions"]
                }
                for tid, track in tracks.items()
            },
            "frames_analyzed": len(frames),
            "video_info": video_info
        })
    
    finally:
        os.unlink(tmp_path)


@app.post("/detect/frame")
async def detect_frame(
    file: UploadFile = File(...)
):
    """
    Detect players in a single image frame.
    
    Args:
        file: Image file
    
    Returns:
        Detection results
    """
    # Save uploaded image
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    
    try:
        import cv2
        analyzer = get_yolo()
        
        frame = cv2.imread(tmp_path)
        if frame is None:
            raise HTTPException(status_code=400, detail="Could not read image")
        
        detections = analyzer.detect_players(frame)
        
        return JSONResponse({
            "player_count": len(detections),
            "players": detections
        })
    
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)

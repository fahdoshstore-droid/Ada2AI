"""
VisionPipeline — Unified Sports Vision Intelligence Pipeline

Single entry point for all sports video analysis.
Orchestrates: detection → tracking → pose → events → graph

Usage:
  config = VisionConfig(model_size="n", pose_enabled=True)
  pipeline = VisionPipeline(config)
  result = pipeline.analyze_video("match.mp4")
  result = pipeline.analyze_frame(frame_bgr_array)
"""

import cv2
import gc
import time
import asyncio
import logging
from pathlib import Path
from typing import List, Dict, Optional

logger = logging.getLogger("vision_core")

from .config import VisionConfig
from .detector import SportsDetector, Detection, _get_model
from .tracker import SportsTracker
from .pose import PoseExtractor, PoseResult
from .events import EventExtractor, SemanticEvent
from .graph import SportsGraphBuilder


class VisionPipeline:
    """
    Unified Sports Vision Intelligence Pipeline.

    Single entry point that orchestrates all vision subsystems.
    Replaces fragmented yolo_analyzer.py + separate tracker + separate pipeline.
    """

    def __init__(self, config: VisionConfig = None):
        self.config = config or VisionConfig()
        self.detector = SportsDetector(self.config)
        self.tracker = SportsTracker(self.config)
        self.pose_extractor = PoseExtractor(self.config.pixels_per_meter)
        self.event_extractor = EventExtractor(self.config)
        self._graph_builder: Optional[SportsGraphBuilder] = None
        self._last_analysis: Optional[dict] = None
        # ── Intelligence caches (populated after analyze_video) ──
        self._results_cache: Dict[str, dict] = {}
        self._signature_cache: Dict[int, object] = {}
        self._dna_profiles_cache: Dict[int, object] = {}

    def analyze_video(self, video_path: str, team_assignment: str = "position") -> dict:
        """
        Full video analysis: detect → track → pose → events → graph.

        Args:
            video_path: Path to video file
            team_assignment: "position" (x-based) or "none"

        Returns:
            Complete analysis result dict
        """
        start_time = time.time()

        # Reset all subsystems
        self.tracker.reset()
        self.event_extractor.reset()

        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"status": "failed", "error": f"Cannot open video: {video_path}"}

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        self._graph_builder = SportsGraphBuilder(width, height)

        # Run tracking-enabled YOLO on video
        model = self.detector.model
        stride = self.config.frame_stride
        target_classes = self.config.detect_classes

        frame_idx = 0
        all_frame_results = []

        # Use YOLO track mode for persistent IDs
        results = model.track(
            video_path,
            device=self.config.device,
            conf=self.config.confidence_threshold,
            iou=self.config.iou_threshold,
            classes=target_classes,
            tracker=f"{self.config.tracking_backend}.yaml",
            stream=True,
            verbose=False,
        )

        for r in results:
            if frame_idx % stride != 0:
                frame_idx += 1
                continue

            timestamp = frame_idx / fps

            # Extract detections with track IDs
            detections = []
            if r.boxes is not None:
                for box in r.boxes:
                    track_id = int(box.id[0]) if box.id is not None else -1
                    det = Detection(
                        bbox=box.xyxy[0].tolist(),
                        confidence=float(box.conf[0]),
                        class_id=int(box.cls[0]),
                        track_id=track_id,
                    )
                    detections.append(det)

            # Update tracker
            self.tracker.update_from_results(detections, frame_idx, timestamp, fps)

            # Pose estimation
            pose_results = []
            if self.config.pose_enabled:
                # Get the actual frame for pose
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                if ret:
                    raw_poses = self.detector.detect_pose(frame)
                    pose_results = self.pose_extractor.process_poses(raw_poses, detections)

            # Event extraction
            self.event_extractor.process_frame(
                frame_number=frame_idx,
                timestamp=timestamp,
                detections=detections,
                tracks=self.tracker.tracks,
                frame_width=width,
                frame_height=height,
            )

            # Store frame result
            frame_data = {
                "frame": frame_idx,
                "timestamp": round(timestamp, 3),
                "detections": [d.to_dict() for d in detections],
                "tracked_players": self.tracker.get_active_players(),
                "poses": [p.to_dict() for p in pose_results],
            }
            all_frame_results.append(frame_data)

            # Prune lost tracks periodically
            if frame_idx % 100 == 0:
                self.tracker.prune_lost()

            frame_idx += 1

        cap.release()

        # Team assignment
        if team_assignment == "position":
            self.tracker.assign_teams_by_position(width)

        # Build sports graph
        self._graph_builder.build_from_tracker(self.tracker.tracks, fps)
        self._graph_builder.build_from_events(self.event_extractor.get_events())

        elapsed = time.time() - start_time

        # Compile results
        result = {
            "status": "success",
            "video_info": {
                "path": video_path,
                "fps": fps,
                "total_frames": total_frames,
                "width": width,
                "height": height,
                "duration": round(total_frames / fps, 2) if fps > 0 else 0,
            },
            "analysis_info": {
                "frames_processed": len(all_frame_results),
                "frame_stride": stride,
                "device": self.config.device,
                "model": self.config.detection_model_path,
                "tracking": self.config.tracking_backend,
                "pose_enabled": self.config.pose_enabled,
                "processing_time_seconds": round(elapsed, 2),
            },
            "players": {
                str(tid): self.tracker.get_track_summary(tid, fps)
                for tid in self.tracker.tracks
            },
            "formation": self.tracker.get_formation_map(width, height),
            "events": self.event_extractor.get_timeline(),
            "event_counts": self._count_events(),
            "graph": self._graph_builder.get_graph_ready_output(),
            "frames": all_frame_results[-10:] if len(all_frame_results) > 10 else all_frame_results,
        }

        self._last_analysis = result
        return result

    def analyze_frame(self, frame, frame_number: int = 0, timestamp: float = 0.0, fps: float = 25.0) -> dict:
        """
        Single frame analysis: detect + track + pose.

        Args:
            frame: BGR numpy array
            frame_number: Frame index
            timestamp: Time in seconds
            fps: Video FPS

        Returns:
            Frame analysis result
        """
        # Detect
        detections = self.detector.detect_frame(frame)

        # Track (if detections have track_ids from YOLO track mode)
        self.tracker.update_from_results(detections, frame_number, timestamp, fps)

        # Pose
        pose_results = []
        if self.config.pose_enabled:
            raw_poses = self.detector.detect_pose(frame)
            pose_results = self.pose_extractor.process_poses(raw_poses, detections)

        # Events
        h, w = frame.shape[:2]
        self.event_extractor.process_frame(
            frame_number=frame_number,
            timestamp=timestamp,
            detections=detections,
            tracks=self.tracker.tracks,
            frame_width=w,
            frame_height=h,
        )

        return {
            "status": "success",
            "frame": frame_number,
            "timestamp": round(timestamp, 3),
            "detections": [d.to_dict() for d in detections],
            "tracked_players": self.tracker.get_active_players(),
            "poses": [p.to_dict() for p in pose_results],
            "active_tracks": len(self.tracker.tracks),
        }

    def analyze_single_player(self, video_path: str, conf_threshold: float = None) -> dict:
        """
        Analyze dominant player movement (backward-compatible with legacy API).

        Args:
            video_path: Path to video file
            conf_threshold: Override confidence threshold

        Returns:
            Single player analysis (backward-compatible format)
        """
        result = self.analyze_video(video_path)

        if result["status"] != "success":
            return result

        players = result["players"]
        if not players:
            return {"status": "failed", "error": "No players detected"}

        # Find player with most frames
        main_tid = max(players.keys(), key=lambda tid: players[tid]["frames_visible"])
        main = players[main_tid]

        return {
            "status": "success",
            "track_id": int(main_tid),
            "total_distance_meters": main["total_distance_meters"],
            "average_speed_mps": main["average_speed_mps"],
            "max_speed_mps": main["max_speed_mps"],
            "frames_analyzed": result["analysis_info"]["frames_processed"],
            "video_info": result["video_info"],
        }

    def analyze_team(self, video_path: str, conf_threshold: float = None) -> dict:
        """
        Team formation analysis (backward-compatible with legacy API).

        Args:
            video_path: Path to video file
            conf_threshold: Override confidence threshold

        Returns:
            Team analysis (backward-compatible format)
        """
        result = self.analyze_video(video_path)

        if result["status"] != "success":
            return result

        return {
            "status": "success",
            "total_players_detected": len(result["players"]),
            "team1_count": result["formation"]["team1_count"],
            "team2_count": result["formation"]["team2_count"],
            "formation": result["formation"],
            "tracks": result["players"],
            "frames_analyzed": result["analysis_info"]["frames_processed"],
            "video_info": result["video_info"],
        }

    def _count_events(self) -> dict:
        """Count events by type."""
        counts = {}
        for event in self.event_extractor.events:
            etype = event.event_type
            counts[etype] = counts.get(etype, 0) + 1
        return counts

    def reset(self):
        """Reset all subsystems and free memory."""
        self.tracker.reset()
        self.event_extractor.reset()
        if self._graph_builder:
            self._graph_builder.reset()
        self._last_analysis = None
        gc.collect()

    def cleanup(self):
        """Force cleanup of all models and cached data. Call between long sessions."""
        from .detector import clear_model_cache
        clear_model_cache()
        self._model = None
        self._pose_model = None
        self._seg_model = None
        self._graph_builder = None
        self._last_analysis = None
        self._results_cache.clear()
        self._signature_cache.clear()
        self._dna_profiles_cache.clear()
        gc.collect()
        logger.info("VisionPipeline cleanup: models unloaded, memory freed")

    async def analyze_video_async(self, video_path: str, team_assignment: str = "position") -> dict:
        """Async wrapper for analyze_video. Runs in thread pool for non-blocking API."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.analyze_video, video_path, team_assignment)

    async def analyze_frame_async(self, frame, frame_number: int = 0, timestamp: float = 0.0, fps: float = 25.0) -> dict:
        """Async wrapper for analyze_frame."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.analyze_frame, frame, frame_number, timestamp, fps)
"""
SportsTracker — ByteTrack-based persistent player tracking

Replaces legacy IoU-only PlayerTracker with Ultralytics built-in ByteTrack.
Exposes: track_id, bbox, velocity, acceleration, frame timestamps.
"""

import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from .config import VisionConfig, COCOClasses


@dataclass
class TrackState:
    """Per-track state maintained across frames."""
    track_id: int
    positions: list = field(default_factory=list)     # [{frame, bbox, center, confidence}]
    disappeared: int = 0
    team: Optional[int] = None
    velocities: list = field(default_factory=list)      # [{frame, vx, vy, speed}]
    accelerations: list = field(default_factory=list)   # [{frame, ax, ay}]

    @property
    def latest_position(self) -> Optional[dict]:
        return self.positions[-1] if self.positions else None

    @property
    def latest_velocity(self) -> Optional[dict]:
        return self.velocities[-1] if self.velocities else None

    @property
    def is_active(self) -> bool:
        return self.disappeared == 0


class SportsTracker:
    """
    Wraps Ultralytics tracking (ByteTrack/BotSort) and adds:
    - Persistent player IDs
    - Velocity & acceleration computation
    - Team assignment
    - Stable tracking under occlusion
    """

    def __init__(self, config: VisionConfig):
        self.config = config
        self.tracks: Dict[int, TrackState] = {}
        self._prev_timestamps: Dict[int, float] = {}  # track_id -> last timestamp

    def update_from_results(self, tracked_detections: list, frame_number: int, timestamp: float, fps: float):
        """Update tracks from detection results that include track_id.

        Called after YOLO tracking produces results with .id field.

        Args:
            tracked_detections: List of Detection objects with track_id set
            frame_number: Current frame index
            timestamp: Current frame timestamp (seconds)
            fps: Video FPS
        """
        current_ids = set()
        dt = 1.0 / fps if fps > 0 else 0.033

        for det in tracked_detections:
            tid = det.track_id
            if tid < 0:
                continue  # Skip untracked detections

            current_ids.add(tid)
            pos_entry = {
                "frame": frame_number,
                "timestamp": round(timestamp, 4),
                "bbox": det.bbox,
                "center": det.center,
                "confidence": det.confidence,
                "class_id": det.class_id,
            }

            if tid not in self.tracks:
                self.tracks[tid] = TrackState(track_id=tid)
                self.tracks[tid].positions.append(pos_entry)
            else:
                track = self.tracks[tid]
                track.positions.append(pos_entry)
                track.disappeared = 0
                self._compute_velocity(track, dt)

        # Mark disappeared tracks
        for tid in list(self.tracks.keys()):
            if tid not in current_ids:
                self.tracks[tid].disappeared += 1

    def _compute_velocity(self, track: TrackState, dt: float):
        """Compute velocity and acceleration for a track."""
        if len(track.positions) < 2:
            return

        curr = track.positions[-1]
        prev = track.positions[-2]

        cx, cy = curr["center"]
        px, py = prev["center"]

        # Check if we have real timestamps
        curr_t = curr.get("timestamp", curr["frame"] * dt)
        prev_t = prev.get("timestamp", prev["frame"] * dt)
        time_diff = curr_t - prev_t

        if time_diff <= 0:
            return

        ppm = self.config.pixels_per_meter
        vx = (cx - px) / ppm / time_diff  # m/s
        vy = (cy - py) / ppm / time_diff  # m/s
        speed = (vx**2 + vy**2) ** 0.5

        vel_entry = {
            "frame": curr["frame"],
            "timestamp": round(curr_t, 4),
            "vx": round(vx, 3),
            "vy": round(vy, 3),
            "speed": round(speed, 3),
        }
        track.velocities.append(vel_entry)

        # Acceleration (need 2 velocity samples)
        if len(track.velocities) >= 2:
            prev_vel = track.velocities[-2]
            dt_vel = vel_entry["timestamp"] - prev_vel["timestamp"]
            if dt_vel > 0:
                ax = (vel_entry["vx"] - prev_vel["vx"]) / dt_vel
                ay = (vel_entry["vy"] - prev_vel["vy"]) / dt_vel
                track.accelerations.append({
                    "frame": curr["frame"],
                    "timestamp": round(curr_t, 4),
                    "ax": round(ax, 3),
                    "ay": round(ay, 3),
                })

    def assign_teams_by_position(self, frame_width: int):
        """Assign teams based on x-position (simple heuristic)."""
        for tid, track in self.tracks.items():
            if track.latest_position:
                cx = track.latest_position["center"][0]
                track.team = 1 if cx < frame_width / 2 else 2

    def assign_teams(self, teams: Dict[int, int]):
        """Explicitly assign teams by track_id."""
        for tid, team_id in teams.items():
            if tid in self.tracks:
                self.tracks[tid].team = team_id

    def prune_lost(self, max_disappeared: int = None):
        """Remove tracks that have been lost for too long."""
        max_lost = max_disappeared or self.config.track_buffer
        to_remove = [tid for tid, t in self.tracks.items() if t.disappeared > max_lost]
        for tid in to_remove:
            del self.tracks[tid]

    def get_active_players(self) -> List[dict]:
        """Get all currently active (visible) players."""
        players = []
        for tid, track in self.tracks.items():
            if track.is_active and track.latest_position:
                pos = track.latest_position
                vel = track.latest_velocity
                players.append({
                    "track_id": tid,
                    "team": track.team,
                    "frame": pos["frame"],
                    "timestamp": pos.get("timestamp", 0),
                    "bbox": pos["bbox"],
                    "center": pos["center"],
                    "confidence": pos["confidence"],
                    "speed": vel["speed"] if vel else 0.0,
                    "vx": vel["vx"] if vel else 0.0,
                    "vy": vel["vy"] if vel else 0.0,
                })
        return players

    def get_formation_map(self, frame_width: int, frame_height: int) -> dict:
        """Generate formation map from track positions."""
        team1, team2 = [], []
        for tid, track in self.tracks.items():
            pos = track.latest_position
            if not pos:
                continue
            cx, cy = pos["center"]
            player = {
                "track_id": tid,
                "x": round(cx / frame_width, 3),
                "y": round(cy / frame_height, 3),
                "speed": track.latest_velocity["speed"] if track.latest_velocity else 0,
            }
            if track.team == 1:
                team1.append(player)
            else:
                team2.append(player)

        return {
            "team1": team1,
            "team2": team2,
            "team1_count": len(team1),
            "team2_count": len(team2),
        }

    def get_track_summary(self, track_id: int, fps: float) -> Optional[dict]:
        """Get comprehensive summary for a single track."""
        if track_id not in self.tracks:
            return None

        track = self.tracks[track_id]
        if not track.positions:
            return None

        total_distance = 0.0
        speeds = []

        for i in range(1, len(track.positions)):
            prev = track.positions[i - 1]
            curr = track.positions[i]
            dx = curr["center"][0] - prev["center"][0]
            dy = curr["center"][1] - prev["center"][1]
            dist_px = (dx**2 + dy**2) ** 0.5
            dist_m = dist_px / self.config.pixels_per_meter
            total_distance += dist_m

        for vel in track.velocities:
            speeds.append(vel["speed"])

        return {
            "track_id": track_id,
            "team": track.team,
            "frames_visible": len(track.positions),
            "total_distance_meters": round(total_distance, 2),
            "average_speed_mps": round(sum(speeds) / len(speeds), 2) if speeds else 0,
            "max_speed_mps": round(max(speeds), 2) if speeds else 0,
            "velocity_samples": len(track.velocities),
            "acceleration_samples": len(track.accelerations),
        }

    def reset(self):
        """Reset all tracking state."""
        self.tracks.clear()
        self._prev_timestamps.clear()
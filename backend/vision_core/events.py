"""
EventExtractor — Semantic football event intelligence

Transforms raw vision data into semantic events:
  - Pass events
  - Sprint events  
  - Shot attempts
  - Defensive pressure
  - Transitions
  - Possession chains

Architecture: raw vision → semantic events
Output: JSON + timestamps
"""

import math
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from .config import VisionConfig, COCOClasses


@dataclass
class SemanticEvent:
    """A single semantic football event."""
    event_type: str           # pass | sprint | shot | pressure | transition | possession
    timestamp: float          # seconds
    frame: int
    confidence: float         # 0-1 confidence in event detection
    actors: list              # [{track_id, role}]
    location: dict            # {x, y} normalized 0-1
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "event_type": self.event_type,
            "timestamp": round(self.timestamp, 3),
            "frame": self.frame,
            "confidence": round(self.confidence, 3),
            "actors": self.actors,
            "location": {k: round(v, 3) for k, v in self.location.items()},
            "metadata": self.metadata,
        }


class EventExtractor:
    """
    Extracts semantic events from tracking + detection data.

    Uses deterministic heuristics (NOT ML) for event detection.
    Rules are configurable via VisionConfig thresholds.
    """

    def __init__(self, config: VisionConfig):
        self.config = config
        self.events: List[SemanticEvent] = []
        self._prev_ball_holder: Optional[int] = None
        self._possession_start: Optional[dict] = None
        self._prev_ball_pos: Optional[dict] = None

    def process_frame(
        self,
        frame_number: int,
        timestamp: float,
        detections: list,
        tracks: dict,
        frame_width: int = 1920,
        frame_height: int = 1080,
    ):
        """Process a single frame for event extraction.

        Args:
            frame_number: Current frame index
            timestamp: Current time in seconds
            detections: List of Detection objects
            tracks: Dict[int, TrackState] from SportsTracker
            frame_width: Frame width in pixels
            frame_height: Frame height in pixels
        """
        # Separate persons and ball
        ball_dets = [d for d in detections if d.is_ball]
        person_dets = [d for d in detections if d.is_person]

        # ── Ball-based events ──────────────────────
        ball_pos = None
        if ball_dets:
            ball_pos = {
                "x": ball_dets[0].center[0] / frame_width,
                "y": ball_dets[0].center[1] / frame_height,
            }

        if ball_pos:
            self._detect_pass_event(frame_number, timestamp, ball_pos, tracks, frame_width)
            self._detect_shot_event(frame_number, timestamp, ball_pos, tracks, frame_height)
            self._update_possession(frame_number, timestamp, ball_pos, tracks, frame_width)

        # ── Player-based events ────────────────────
        self._detect_sprint_events(frame_number, timestamp, tracks)
        self._detect_pressure_events(frame_number, timestamp, person_dets, tracks, frame_width, frame_height)
        self._detect_transition_events(frame_number, timestamp, ball_pos, tracks, frame_width)

        self._prev_ball_pos = ball_pos

    def _find_nearest_player(
        self, pos: dict, tracks: dict, frame_width: int, max_dist: float = 0.15
    ) -> Optional[int]:
        """Find the track_id of the player nearest to a position."""
        nearest_tid = None
        nearest_dist = max_dist

        for track in tracks.values():
            latest = track.latest_position if hasattr(track, "latest_position") else None
            if latest is None:
                continue

            # Extract center from TrackState.latest_position (dict)
            center = latest.get("center", None) if isinstance(latest, dict) else None
            if center is None:
                continue

            cx, cy = center[0], center[1]
            px_norm = cx / frame_width
            py_norm = cy / (frame_width * 9 / 16)  # Approx aspect ratio

            dist = math.sqrt((pos["x"] - px_norm)**2 + (pos["y"] - py_norm)**2)
            if dist < nearest_dist:
                nearest_dist = dist
                nearest_tid = track.track_id

        return nearest_tid

    def _detect_pass_event(self, frame, timestamp, ball_pos, tracks, frame_width):
        """Detect pass: ball changes holder."""
        if self._prev_ball_pos is None:
            self._prev_ball_holder = self._find_nearest_player(ball_pos, tracks, frame_width)
            return

        curr_holder = self._find_nearest_player(ball_pos, tracks, frame_width)

        if curr_holder is not None and self._prev_ball_holder is not None and curr_holder != self._prev_ball_holder:
            ball_dx = ball_pos["x"] - self._prev_ball_pos["x"]
            ball_dy = ball_pos["y"] - self._prev_ball_pos["y"]
            ball_dist = math.sqrt(ball_dx**2 + ball_dy**2)

            if ball_dist > 0.05:
                self.events.append(SemanticEvent(
                    event_type="pass",
                    timestamp=timestamp,
                    frame=frame,
                    confidence=min(0.9, ball_dist * 5),
                    actors=[
                        {"track_id": self._prev_ball_holder, "role": "passer"},
                        {"track_id": curr_holder, "role": "receiver"},
                    ],
                    location=ball_pos,
                    metadata={"ball_distance": round(ball_dist, 4)},
                ))

        self._prev_ball_holder = curr_holder

    def _detect_shot_event(self, frame, timestamp, ball_pos, tracks, frame_height):
        """Detect shot attempt: ball moves fast toward goal area."""
        if self._prev_ball_pos is None:
            return

        ball_dx = ball_pos["x"] - self._prev_ball_pos["x"]
        ball_dy = ball_pos["y"] - self._prev_ball_pos["y"]
        ball_dist = math.sqrt(ball_dx**2 + ball_dy**2)

        is_fast = ball_dist > 0.08
        heading_goalward = ball_pos["y"] < 0.2 or ball_pos["y"] > 0.8

        if is_fast and heading_goalward:
            shooter = self._prev_ball_holder
            self.events.append(SemanticEvent(
                event_type="shot",
                timestamp=timestamp,
                frame=frame,
                confidence=min(0.85, ball_dist * 4),
                actors=[{"track_id": shooter, "role": "shooter"}] if shooter else [],
                location=ball_pos,
                metadata={"ball_speed_norm": round(ball_dist, 4)},
            ))

    def _detect_sprint_events(self, frame, timestamp, tracks):
        """Detect sprint: player speed exceeds threshold."""
        sprint_threshold = 6.0  # m/s (~21.6 km/h)

        for track in tracks.values():
            if not hasattr(track, "latest_velocity") or track.latest_velocity is None:
                continue

            speed = track.latest_velocity.get("speed", 0)
            if speed >= sprint_threshold and track.is_active:
                self.events.append(SemanticEvent(
                    event_type="sprint",
                    timestamp=timestamp,
                    frame=frame,
                    confidence=min(0.9, speed / 10.0),
                    actors=[{"track_id": track.track_id, "role": "sprinter"}],
                    location={
                        "x": track.latest_position["center"][0],
                        "y": track.latest_position["center"][1],
                    },
                    metadata={"speed_mps": round(speed, 2)},
                ))

    def _detect_pressure_events(self, frame, timestamp, person_dets, tracks, frame_width, frame_height):
        """Detect defensive pressure: multiple players clustered."""
        if len(person_dets) < 3:
            return

        positions = []
        for det in person_dets:
            positions.append((det.center[0] / frame_width, det.center[1] / frame_height))

        for i, (x, y) in enumerate(positions):
            nearby = sum(1 for (ox, oy) in positions if math.sqrt((x - ox)**2 + (y - oy)**2) < 0.08)
            if nearby >= 3:
                tid = person_dets[i].track_id
                self.events.append(SemanticEvent(
                    event_type="pressure",
                    timestamp=timestamp,
                    frame=frame,
                    confidence=0.6,
                    actors=[{"track_id": tid, "role": "under_pressure"}],
                    location={"x": round(x, 3), "y": round(y, 3)},
                    metadata={"nearby_count": nearby},
                ))
                break

    def _detect_transition_events(self, frame, timestamp, ball_pos, tracks, frame_width):
        """Detect transition: ball crosses midfield rapidly."""
        if self._prev_ball_pos is None or ball_pos is None:
            return

        prev_half = self._prev_ball_pos["x"] < 0.5
        curr_half = ball_pos["x"] < 0.5

        if prev_half != curr_half:
            self.events.append(SemanticEvent(
                event_type="transition",
                timestamp=timestamp,
                frame=frame,
                confidence=0.7,
                actors=[],
                location=ball_pos,
                metadata={"direction": "right_to_left" if curr_half else "left_to_right"},
            ))

    def _update_possession(self, frame, timestamp, ball_pos, tracks, frame_width):
        """Track possession chains."""
        holder = self._find_nearest_player(ball_pos, tracks, frame_width)

        if holder != self._prev_ball_holder:
            if self._possession_start and self._prev_ball_holder is not None:
                duration = timestamp - self._possession_start["timestamp"]
                if duration > 0.5:
                    self.events.append(SemanticEvent(
                        event_type="possession",
                        timestamp=self._possession_start["timestamp"],
                        frame=self._possession_start["frame"],
                        confidence=0.75,
                        actors=[{"track_id": self._prev_ball_holder, "role": "holder"}],
                        location=self._possession_start["location"],
                        metadata={"duration": round(duration, 2)},
                    ))

            if holder is not None:
                self._possession_start = {
                    "timestamp": timestamp,
                    "frame": frame,
                    "location": ball_pos.copy(),
                }
            else:
                self._possession_start = None

    def get_events(self, event_type: str = None) -> List[dict]:
        """Get all events, optionally filtered by type."""
        events = self.events
        if event_type:
            events = [e for e in events if e.event_type == event_type]
        return [e.to_dict() for e in events]

    def get_timeline(self) -> List[dict]:
        """Get events sorted by timestamp."""
        return [e.to_dict() for e in sorted(self.events, key=lambda e: e.timestamp)]

    def reset(self):
        """Reset event extraction state."""
        self.events.clear()
        self._prev_ball_holder = None
        self._possession_start = None
        self._prev_ball_pos = None
"""
SportsGraph — Graph-ready outputs for future Sports Intelligence Graph

Each detected entity supports:
  - Player identity
  - Event associations
  - Positional history
  - Movement vectors
  - Tactical zones

This module prepares graph-ready data structures.
DO NOT implement full graph database yet.
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, field
import math


@dataclass
class PlayerNode:
    """Graph-ready player entity."""
    track_id: int
    team: Optional[int] = None
    frames_visible: int = 0
    total_distance_meters: float = 0.0
    avg_speed_mps: float = 0.0
    max_speed_mps: float = 0.0
    positional_history: list = field(default_factory=list)    # [{frame, x, y, timestamp}]
    movement_vectors: list = field(default_factory=list)       # [{frame, vx, vy, speed}]
    tactical_zones: list = field(default_factory=list)         # [{zone, time_spent_pct}]
    event_associations: list = field(default_factory=list)     # [{event_type, event_id, role}]
    first_seen_frame: Optional[int] = None
    last_seen_frame: Optional[int] = None

    def to_dict(self) -> dict:
        return {
            "track_id": self.track_id,
            "team": self.team,
            "frames_visible": self.frames_visible,
            "total_distance_meters": round(self.total_distance_meters, 2),
            "avg_speed_mps": round(self.avg_speed_mps, 2),
            "max_speed_mps": round(self.max_speed_mps, 2),
            "positional_history": self.positional_history[-50:],  # Last 50 positions
            "movement_vectors": self.movement_vectors[-20:],       # Last 20 vectors
            "tactical_zones": self.tactical_zones,
            "event_associations": self.event_associations[-30:],    # Last 30 events
            "first_seen_frame": self.first_seen_frame,
            "last_seen_frame": self.last_seen_frame,
        }


@dataclass
class EventNode:
    """Graph-ready event entity."""
    event_id: str
    event_type: str
    timestamp: float
    frame: int
    actors: list           # [{track_id, role}]
    location: dict         # {x, y}
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "timestamp": round(self.timestamp, 3),
            "frame": self.frame,
            "actors": self.actors,
            "location": {k: round(v, 3) for k, v in self.location.items()},
            "metadata": self.metadata,
        }


# ── Tactical Zone Definitions ──────────────────────
TACTICAL_ZONES = {
    "defensive_third":  {"x": (0.0, 0.33)},
    "midfield":         {"x": (0.33, 0.66)},
    "attacking_third":  {"x": (0.66, 1.0)},
    "left_channel":     {"x": (0.0, 1.0), "y": (0.0, 0.33)},
    "central_channel":  {"x": (0.0, 1.0), "y": (0.33, 0.66)},
    "right_channel":    {"x": (0.0, 1.0), "y": (0.66, 1.0)},
    "penalty_area":     {"x": (0.85, 1.0), "y": (0.2, 0.8)},
    "own_penalty_area": {"x": (0.0, 0.15), "y": (0.2, 0.8)},
}


def classify_zone(x_norm: float, y_norm: float) -> str:
    """Classify a normalised position into a tactical zone."""
    for zone_name, bounds in TACTICAL_ZONES.items():
        x_min, x_max = bounds["x"]
        y_bounds = bounds.get("y", (0.0, 1.0))
        y_min, y_max = y_bounds
        if x_min <= x_norm <= x_max and y_min <= y_norm <= y_max:
            return zone_name
    return "midfield"


class SportsGraphBuilder:
    """
    Builds graph-ready data structures from tracking and event data.

    Prepares for future migration to Sports Intelligence Graph.
    Does NOT implement graph database — only structured output.
    """

    def __init__(self, frame_width: int = 1920, frame_height: int = 1080):
        self.frame_width = frame_width
        self.frame_height = frame_height
        self.player_nodes: Dict[int, PlayerNode] = {}
        self.event_nodes: List[EventNode] = []
        self._zone_time: Dict[int, Dict[str, int]] = {}  # track_id -> {zone: frame_count}

    def build_from_tracker(self, tracks: dict, fps: float):
        """Build player nodes from SportsTracker tracks.

        Args:
            tracks: Dict[int, TrackState] from SportsTracker
            fps: Video FPS
        """
        for tid, track in tracks.items():
            if tid not in self.player_nodes:
                self.player_nodes[tid] = PlayerNode(track_id=tid)
                self._zone_time[tid] = {}

            node = self.player_nodes[tid]
            node.team = track.team
            node.frames_visible = len(track.positions)

            if track.positions:
                node.first_seen_frame = track.positions[0]["frame"]
                node.last_seen_frame = track.positions[-1]["frame"]

            # Positional history (normalised)
            for pos in track.positions:
                cx, cy = pos["center"]
                x_norm = cx / self.frame_width
                y_norm = cy / self.frame_height
                entry = {
                    "frame": pos["frame"],
                    "x": round(x_norm, 4),
                    "y": round(y_norm, 4),
                    "timestamp": round(pos["frame"] / fps, 3) if fps > 0 else pos["frame"],
                }
                node.positional_history.append(entry)

                # Tactical zone classification
                zone = classify_zone(x_norm, y_norm)
                self._zone_time[tid][zone] = self._zone_time[tid].get(zone, 0) + 1

            # Movement vectors
            for vel in track.velocities:
                node.movement_vectors.append({
                    "frame": vel["frame"],
                    "vx": vel["vx"],
                    "vy": vel["vy"],
                    "speed": vel["speed"],
                })

            # Speed summary
            if track.velocities:
                speeds = [v["speed"] for v in track.velocities]
                node.avg_speed_mps = sum(speeds) / len(speeds)
                node.max_speed_mps = max(speeds)

            # Distance
            if track.positions and len(track.positions) > 1:
                total_dist = 0.0
                for i in range(1, len(track.positions)):
                    prev = track.positions[i-1]["center"]
                    curr = track.positions[i]["center"]
                    dist_px = math.sqrt((curr[0]-prev[0])**2 + (curr[1]-prev[1])**2)
                    total_dist += dist_px / 100.0  # Using ppm=100 as default
                node.total_distance_meters = round(total_dist, 2)

        # Convert zone time to percentages
        for tid, zones in self._zone_time.items():
            total_frames = sum(zones.values())
            if total_frames > 0 and tid in self.player_nodes:
                self.player_nodes[tid].tactical_zones = [
                    {"zone": zone, "time_spent_pct": round(count / total_frames, 3)}
                    for zone, count in sorted(zones.items(), key=lambda x: -x[1])
                ]

    def build_from_events(self, events: list):
        """Build event nodes and link to player nodes.

        Args:
            events: List of SemanticEvent.to_dict() outputs
        """
        for i, event in enumerate(events):
            event_id = f"evt_{event['event_type']}_{event['frame']}_{i}"
            event_node = EventNode(
                event_id=event_id,
                event_type=event["event_type"],
                timestamp=event["timestamp"],
                frame=event["frame"],
                actors=event.get("actors", []),
                location=event.get("location", {}),
                metadata=event.get("metadata", {}),
            )
            self.event_nodes.append(event_node)

            # Link events to player nodes
            for actor in event.get("actors", []):
                tid = actor.get("track_id")
                role = actor.get("role", "unknown")
                if tid is not None and tid in self.player_nodes:
                    self.player_nodes[tid].event_associations.append({
                        "event_id": event_id,
                        "event_type": event["event_type"],
                        "role": role,
                        "timestamp": event["timestamp"],
                    })

    def get_graph_ready_output(self) -> dict:
        """Produce graph-ready JSON output.

        Returns:
            Structured data ready for Sports Intelligence Graph ingestion.
        """
        return {
            "players": {str(tid): node.to_dict() for tid, node in self.player_nodes.items()},
            "events": [e.to_dict() for e in self.event_nodes],
            "metadata": {
                "frame_width": self.frame_width,
                "frame_height": self.frame_height,
                "total_players": len(self.player_nodes),
                "total_events": len(self.event_nodes),
                "tactical_zones": list(TACTICAL_ZONES.keys()),
            },
        }

    def reset(self):
        """Reset graph builder state."""
        self.player_nodes.clear()
        self.event_nodes.clear()
        self._zone_time.clear()
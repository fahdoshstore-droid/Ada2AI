"""
Player Tracker - Track players across frames
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
from scipy.optimize import linear_sum_assignment


class PlayerTracker:
    """Tracks players across video frames using IoU matching."""
    
    def __init__(self, iou_threshold: float = 0.3, max_disappear: int = 10):
        """Initialize tracker.
        
        Args:
            iou_threshold: Minimum IoU for matching
            max_disappear: Max frames before removing track
        """
        self.iou_threshold = iou_threshold
        self.max_disappear = max_disappear
        
        self.tracks = {}  # track_id -> {"positions": [], "disappeared": 0, "team": None}
        self.next_track_id = 0
        self.frame_count = 0
    
    def _calculate_iou(self, bbox1: List[float], bbox2: List[float]) -> float:
        """Calculate IoU between two bounding boxes.
        
        Args:
            bbox1: [x1, y1, x2, y2]
            bbox2: [x1, y1, x2, y2]
            
        Returns:
            IoU value
        """
        x1_1, y1_1, x2_1, y2_1 = bbox1
        x1_2, y1_2, x2_2, y2_2 = bbox2
        
        # Intersection area
        x1_i = max(x1_1, x1_2)
        y1_i = max(y1_1, y1_2)
        x2_i = min(x2_1, x2_2)
        y2_i = min(y2_1, y2_2)
        
        if x2_i < x1_i or y2_i < y1_i:
            return 0.0
        
        intersection = (x2_i - x1_i) * (y2_i - y1_i)
        
        # Union area
        area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
        area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0
    
    def _match_detections(self, detections: List[Dict]) -> List[Tuple[int, int]]:
        """Match detections to existing tracks using IoU.
        
        Args:
            detections: List of detections
            
        Returns:
            List of (track_id, detection_idx) matches
        """
        if not detections:
            return []
        
        if not self.tracks:
            # First frame - create new tracks
            return []
        
        # Build cost matrix
        track_ids = list(self.tracks.keys())
        cost_matrix = np.zeros((len(track_ids), len(detections)))
        
        for i, track_id in enumerate(track_ids):
            track_bbox = self.tracks[track_id]["positions"][-1]["bbox"]
            for j, det in enumerate(detections):
                iou = self._calculate_iou(track_bbox, det["bbox"])
                cost_matrix[i, j] = 1 - iou  # Convert to cost
        
        # Hungarian algorithm
        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        
        matches = []
        for i, j in zip(row_ind, col_ind):
            if cost_matrix[i, j] < (1 - self.iou_threshold):
                matches.append((track_ids[i], j))
        
        return matches
    
    def update(self, detections: List[Dict]) -> Dict[int, Dict]:
        """Update tracks with new detections.
        
        Args:
            detections: List of detections from current frame
            
        Returns:
            Updated tracks
        """
        self.frame_count += 1
        
        matches = self._match_detections(detections)
        matched_detections = set()
        
        # Update matched tracks
        for track_id, det_idx in matches:
            det = detections[det_idx]
            self.tracks[track_id]["positions"].append({
                "frame": self.frame_count,
                "bbox": det["bbox"],
                "center": det["center"],
                "confidence": det["confidence"]
            })
            self.tracks[track_id]["disappeared"] = 0
            matched_detections.add(det_idx)
        
        # Create new tracks for unmatched detections
        for i, det in enumerate(detections):
            if i not in matched_detections:
                self.tracks[self.next_track_id] = {
                    "positions": [{
                        "frame": self.frame_count,
                        "bbox": det["bbox"],
                        "center": det["center"],
                        "confidence": det["confidence"]
                    }],
                    "disappeared": 0,
                    "team": None
                }
                self.next_track_id += 1
        
        # Mark unmatched tracks as disappeared
        matched_track_ids = {match[0] for match in matches}
        for track_id in self.tracks:
            if track_id not in matched_track_ids:
                self.tracks[track_id]["disappeared"] += 1
        
        # Remove old tracks
        to_remove = []
        for track_id, track in self.tracks.items():
            if track["disappeared"] > self.max_disappear:
                to_remove.append(track_id)
        
        for track_id in to_remove:
            del self.tracks[track_id]
        
        return self.tracks
    
    def assign_teams(self, teams: Dict[int, int]) -> None:
        """Assign team IDs to tracks.
        
        Args:
            teams: Dictionary of {track_id: team_id}
        """
        for track_id, team_id in teams.items():
            if track_id in self.tracks:
                self.tracks[track_id]["team"] = team_id
    
    def get_tracks(self) -> Dict[int, Dict]:
        """Get all current tracks."""
        return self.tracks
    
    def get_track_history(self, track_id: int) -> List[Dict]:
        """Get position history for a track."""
        if track_id in self.tracks:
            return self.tracks[track_id]["positions"]
        return []
    
    def get_active_players(self) -> List[Dict]:
        """Get list of active players with latest positions."""
        players = []
        for track_id, track in self.tracks.items():
            if track["positions"]:
                latest = track["positions"][-1]
                players.append({
                    "track_id": track_id,
                    "team": track["team"],
                    "frame": latest["frame"],
                    "bbox": latest["bbox"],
                    "center": latest["center"],
                    "confidence": latest["confidence"]
                })
        return players
    
    def reset(self) -> None:
        """Reset tracker state."""
        self.tracks = {}
        self.next_track_id = 0
        self.frame_count = 0


def generate_formation_map(tracks: Dict[int, Dict], frame_width: int, frame_height: int) -> Dict:
    """Generate formation map from track positions.
    
    Args:
        tracks: Player tracks
        frame_width: Frame width
        frame_height: Frame height
        
    Returns:
        Formation data
    """
    team1_players = []
    team2_players = []
    
    for track_id, track in tracks.items():
        if not track["positions"]:
            continue
        
        latest = track["positions"][-1]
        center = latest["center"]
        
        player_data = {
            "track_id": track_id,
            "x": center[0] / frame_width,
            "y": center[1] / frame_height
        }
        
        if track["team"] == 1:
            team1_players.append(player_data)
        elif track["team"] == 2:
            team2_players.append(player_data)
    
    return {
        "team1": team1_players,
        "team2": team2_players,
        "formation_1v1": len(team1_players),
        "formation_1v2": len(team2_players)
    }

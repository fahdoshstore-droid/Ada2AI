"""
PoseExtractor — Biomechanics and movement intelligence from YOLO11-pose

Extracts:
  - Body keypoints (17 COCO keypoints)
  - Body orientation
  - Stride estimation
  - Sprint posture
  - Movement direction

Prepares data interfaces for future:
  - Fatigue scoring
  - Injury prediction
  - Tactical body analysis

DO NOT implement injury prediction yet — only prepare interfaces.
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass

# ── COCO 17 Keypoint Names ───────────────────────────
KEYPOINT_NAMES = [
    "nose", "left_eye", "right_eye", "left_ear", "right_ear",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_hip", "right_hip",
    "left_knee", "right_knee", "left_ankle", "right_ankle",
]

# Key indices for biomechanics
SHOULDERS = (5, 6)
HIPS = (11, 12)
KNEES = (13, 14)
ANKLES = (15, 16)


@dataclass
class PoseResult:
    """Structured pose estimation result for a single person."""
    track_id: int
    keypoints: List[List[float]]       # [[x, y, conf], ...] — 17 points
    bbox: List[float]
    confidence: float
    orientation: Optional[float] = None       # radians, 0 = facing right
    stride_estimate: Optional[float] = None   # meters
    sprint_posture: Optional[float] = None    # 0-1 (0=upright, 1=leaning)
    movement_direction: Optional[float] = None  # radians of movement
    body_height_estimate: Optional[float] = None  # pixels

    def to_dict(self) -> dict:
        return {
            "track_id": self.track_id,
            "keypoints": self.keypoints,
            "bbox": self.bbox,
            "confidence": round(self.confidence, 3),
            "orientation": round(self.orientation, 3) if self.orientation is not None else None,
            "stride_estimate": round(self.stride_estimate, 3) if self.stride_estimate is not None else None,
            "sprint_posture": round(self.sprint_posture, 3) if self.sprint_posture is not None else None,
            "movement_direction": round(self.movement_direction, 3) if self.movement_direction is not None else None,
            "body_height_estimate": round(self.body_height_estimate, 1) if self.body_height_estimate else None,
        }

    # ── Future data interfaces (not implemented) ──────
    # fatigue_score: Optional[float] = None
    # injury_risk: Optional[float] = None
    # tactical_body_analysis: Optional[dict] = None


class PoseExtractor:
    """
    Extract biomechanical intelligence from YOLO pose results.

    This class does NOT run inference — it processes raw pose results
    into structured biomechanics data.
    """

    def __init__(self, pixels_per_meter: float = 100.0):
        self.ppm = pixels_per_meter

    def process_poses(
        self,
        raw_poses: List[dict],
        tracked_detections: Optional[List] = None,
    ) -> List[PoseResult]:
        """Process raw YOLO pose results into structured PoseResult objects.

        Args:
            raw_poses: Output from SportsDetector.detect_pose()
            tracked_detections: Optional list of Detection objects for matching track_ids

        Returns:
            List of PoseResult with biomechanics computed
        """
        results = []

        # Build bbox->track_id mapping if detections available
        bbox_to_track = {}
        if tracked_detections:
            for det in tracked_detections:
                key = tuple(round(v, 1) for v in det.bbox)
                bbox_to_track[key] = det.track_id

        for i, pose in enumerate(raw_poses):
            kps = pose.get("keypoints", [])
            if len(kps) < 17:
                continue  # Need all 17 keypoints

            bbox = pose.get("bbox", [])
            conf = pose.get("box_confidence", 0.0)

            # Match with track_id
            track_id = -1
            if bbox:
                key = tuple(round(v, 1) for v in bbox)
                track_id = bbox_to_track.get(key, -1)
            if track_id < 0:
                track_id = i  # Fallback to index

            pose_result = PoseResult(
                track_id=track_id,
                keypoints=kps,
                bbox=bbox,
                confidence=conf,
            )

            # Compute biomechanics
            self._compute_orientation(pose_result)
            self._compute_stride(pose_result)
            self._compute_sprint_posture(pose_result)
            self._compute_body_height(pose_result)

            results.append(pose_result)

        return results

    def _kp_confidence(self, kps: list, idx: int) -> float:
        """Get confidence of a keypoint. Returns 0 if missing."""
        if idx >= len(kps) or len(kps[idx]) < 3:
            return 0.0
        return kps[idx][2]

    def _kp_xy(self, kps: list, idx: int) -> Optional[Tuple[float, float]]:
        """Get (x, y) of a keypoint. Returns None if low confidence."""
        if idx >= len(kps) or len(kps[idx]) < 2:
            return None
        if len(kps[idx]) >= 3 and kps[idx][2] < 0.3:
            return None  # Low confidence
        return (kps[idx][0], kps[idx][1])

    def _midpoint(self, kps: list, idx_a: int, idx_b: int) -> Optional[Tuple[float, float]]:
        """Midpoint of two keypoints."""
        a = self._kp_xy(kps, idx_a)
        b = self._kp_xy(kps, idx_b)
        if a is None or b is None:
            return None
        return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)

    def _compute_orientation(self, pose: PoseResult):
        """Compute body orientation from shoulder-hip vector.

        Returns angle in radians. 0 = facing right, π = facing left.
        """
        kps = pose.keypoints
        shoulder_mid = self._midpoint(kps, *SHOULDERS)
        hip_mid = self._midpoint(kps, *HIPS)

        if shoulder_mid is None or hip_mid is None:
            return

        dx = shoulder_mid[0] - hip_mid[0]
        dy = shoulder_mid[1] - hip_mid[1]
        pose.orientation = float(np.arctan2(dy, dx))

    def _compute_stride(self, pose: PoseResult):
        """Estimate stride length from ankle distance (if both feet visible)."""
        kps = pose.keypoints
        left_ankle = self._kp_xy(kps, ANKLES[0])
        right_ankle = self._kp_xy(kps, ANKLES[1])

        if left_ankle is None or right_ankle is None:
            return

        dist_px = ((left_ankle[0] - right_ankle[0])**2 + (left_ankle[1] - right_ankle[1])**2) ** 0.5
        pose.stride_estimate = dist_px / self.ppm

    def _compute_sprint_posture(self, pose: PoseResult):
        """
        Sprint posture score: 0 = upright, 1 = maximum forward lean.

        Computed from shoulder-hip vertical angle relative to vertical axis.
        """
        kps = pose.keypoints
        shoulder_mid = self._midpoint(kps, *SHOULDERS)
        hip_mid = self._midpoint(kps, *HIPS)

        if shoulder_mid is None or hip_mid is None:
            return

        dx = shoulder_mid[0] - hip_mid[0]
        vertical_dist = abs(shoulder_mid[1] - hip_mid[1])

        if vertical_dist < 1:
            return

        lean_ratio = abs(dx) / vertical_dist
        pose.sprint_posture = min(1.0, lean_ratio / 1.5)  # Normalize: 1.5 = max lean ratio

    def _compute_body_height(self, pose: PoseResult):
        """Estimate body height in pixels from nose to ankle midpoint."""
        kps = pose.keypoints
        nose = self._kp_xy(kps, 0)
        ankle_mid = self._midpoint(kps, *ANKLES)

        if nose is None or ankle_mid is None:
            return

        pose.body_height_estimate = ((nose[0] - ankle_mid[0])**2 + (nose[1] - ankle_mid[1])**2) ** 0.5

    def compute_movement_direction(self, pose: PoseResult, prev_pose: Optional[PoseResult]) -> Optional[float]:
        """
        Compute movement direction from hip midpoint displacement.

        Args:
            pose: Current frame pose
            prev_pose: Previous frame pose (same track_id)

        Returns:
            Angle in radians of movement direction, or None
        """
        hip_curr = self._midpoint(pose.keypoints, *HIPS)
        if prev_pose is None:
            return None
        hip_prev = self._midpoint(prev_pose.keypoints, *HIPS)

        if hip_curr is None or hip_prev is None:
            return None

        dx = hip_curr[0] - hip_prev[0]
        dy = hip_curr[1] - hip_prev[1]

        if abs(dx) < 1 and abs(dy) < 1:
            return pose.movement_direction  # No significant movement

        pose.movement_direction = float(np.arctan2(dy, dx))
        return pose.movement_direction
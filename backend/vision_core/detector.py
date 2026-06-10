"""
SportsDetector — Unified YOLO detection engine

Single point of YOLO model initialization and inference.
Supports: detection, pose, segmentation.
Auto-caches model instances.
"""

import numpy as np
from typing import List, Dict, Optional
from ultralytics import YOLO

from .config import VisionConfig, COCOClasses


# ── Model Cache ────────────────────────────────────
_model_cache: Dict[str, YOLO] = {}


def _get_model(model_path: str, device: str) -> YOLO:
    """Get or create cached YOLO model instance."""
    cache_key = f"{model_path}:{device}"
    if cache_key not in _model_cache:
        model = YOLO(model_path)
        # Warm up model on first load
        model(np.zeros((64, 64, 3), dtype=np.uint8), device=device, verbose=False)
        _model_cache[cache_key] = model
    return _model_cache[cache_key]


class Detection:
    """Single detection result — lightweight data container."""

    __slots__ = ("bbox", "confidence", "class_id", "class_name", "center", "width", "height", "track_id")

    def __init__(self, bbox: list, confidence: float, class_id: int, track_id: int = -1):
        self.bbox = bbox           # [x1, y1, x2, y2]
        self.confidence = confidence
        self.class_id = class_id
        self.class_name = COCOClasses.__dict__.get(
            next((k for k, v in COCOClasses.__dict__.items() if v == class_id), ""), str(class_id)
        )
        self.center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]
        self.width = bbox[2] - bbox[0]
        self.height = bbox[3] - bbox[1]
        self.track_id = track_id

    def to_dict(self) -> dict:
        return {
            "bbox": self.bbox,
            "confidence": round(self.confidence, 3),
            "class_id": self.class_id,
            "class_name": self.class_name,
            "center": [round(c, 1) for c in self.center],
            "width": round(self.width, 1),
            "height": round(self.height, 1),
            "track_id": self.track_id,
        }

    @property
    def is_person(self) -> bool:
        return self.class_id == COCOClasses.PERSON

    @property
    def is_ball(self) -> bool:
        return self.class_id == COCOClasses.SPORTS_BALL


class SportsDetector:
    """Unified YOLO detection engine for sports analysis."""

    def __init__(self, config: VisionConfig):
        self.config = config
        self._model: Optional[YOLO] = None
        self._pose_model: Optional[YOLO] = None
        self._seg_model: Optional[YOLO] = None

    @property
    def model(self) -> YOLO:
        if self._model is None:
            self._model = _get_model(self.config.detection_model_path, self.config.device)
        return self._model

    @property
    def pose_model(self) -> YOLO:
        if self._pose_model is None:
            self._pose_model = _get_model(self.config.pose_model_path, self.config.device)
        return self._pose_model

    @property
    def seg_model(self) -> YOLO:
        if self._seg_model is None:
            self._seg_model = _get_model(self.config.seg_model_path, self.config.device)
        return self._seg_model

    def detect_frame(self, frame: np.ndarray, classes: list[int] = None) -> List[Detection]:
        """Detect objects in a single frame.

        Args:
            frame: BGR image (numpy array)
            classes: Filter to specific class IDs. None = config.detect_classes

        Returns:
            List of Detection objects
        """
        target_classes = classes or self.config.detect_classes
        results = self.model(
            frame,
            device=self.config.device,
            conf=self.config.confidence_threshold,
            iou=self.config.iou_threshold,
            classes=target_classes,
            verbose=False,
        )

        detections = []
        if results and results[0].boxes is not None:
            for box in results[0].boxes:
                det = Detection(
                    bbox=box.xyxy[0].tolist(),
                    confidence=float(box.conf[0]),
                    class_id=int(box.cls[0]),
                )
                detections.append(det)

        return detections

    def detect_video(self, video_path: str, classes: list[int] = None):
        """Stream detection over video. Yields (frame_idx, detections).

        Args:
            video_path: Path to video file
            classes: Filter to specific class IDs

        Yields:
            (frame_index, List[Detection])
        """
        target_classes = classes or self.config.detect_classes
        results = self.model(
            video_path,
            device=self.config.device,
            conf=self.config.confidence_threshold,
            iou=self.config.iou_threshold,
            classes=target_classes,
            stream=True,
            verbose=False,
        )

        for frame_idx, r in enumerate(results):
            detections = []
            if r.boxes is not None:
                for box in r.boxes:
                    det = Detection(
                        bbox=box.xyxy[0].tolist(),
                        confidence=float(box.conf[0]),
                        class_id=int(box.cls[0]),
                        track_id=int(box.id[0]) if box.id is not None else -1,
                    )
                    detections.append(det)

            # Apply frame stride
            if frame_idx % self.config.frame_stride == 0:
                yield frame_idx, detections

    def detect_pose(self, frame: np.ndarray) -> List[dict]:
        """Detect pose keypoints in a frame.

        Returns:
            List of {keypoints: [[x,y,conf], ...], bbox, confidence}
        """
        if not self.config.pose_enabled:
            return []

        results = self.pose_model(
            frame,
            device=self.config.device,
            conf=self.config.confidence_threshold,
            verbose=False,
        )

        poses = []
        if results and results[0].keypoints is not None:
            for i, kp in enumerate(results[0].keypoints):
                box = results[0].boxes[i] if results[0].boxes is not None else None
                poses.append({
                    "keypoints": kp.xy[0].tolist() if kp.xy is not None else [],
                    "confidence": kp.conf[0].tolist() if kp.conf is not None else [],
                    "bbox": box.xyxy[0].tolist() if box else [],
                    "box_confidence": float(box.conf[0]) if box else 0.0,
                })

        return poses

    def detect_segmentation(self, frame: np.ndarray) -> List[dict]:
        """Detect instance segmentation masks.

        Returns:
            List of {mask, bbox, confidence, class_id}
        """
        if not self.config.segmentation_enabled:
            return []

        results = self.seg_model(
            frame,
            device=self.config.device,
            conf=self.config.confidence_threshold,
            verbose=False,
        )

        masks = []
        if results and results[0].masks is not None:
            for i, mask in enumerate(results[0].masks):
                box = results[0].boxes[i] if results[0].boxes is not None else None
                masks.append({
                    "mask": mask.xy[0].tolist() if mask.xy is not None else [],
                    "bbox": box.xyxy[0].tolist() if box else [],
                    "confidence": float(box.conf[0]) if box else 0.0,
                    "class_id": int(box.cls[0]) if box else -1,
                })

        return masks


def clear_model_cache():
    """Clear all cached YOLO models. Call to free GPU memory."""
    _model_cache.clear()
"""
YOLOAnalyzer — BACKWARD-COMPATIBLE WRAPPER

DEPRECATED: This module is a thin compatibility shim.
All real inference routes into vision_core.VisionPipeline.

Do NOT add new functionality here.
Use vision_core directly for new code.

Migration guide:
  from yolo_analyzer import YOLOAnalyzer      ← OLD
  from vision_core import VisionPipeline       ← NEW
"""

from vision_core.config import VisionConfig
from vision_core.pipeline import VisionPipeline
from vision_core.config import COCOClasses

# Keep backward-compatible constant (was WRONG at 37, now correct at 32)
SPORTS_BALL_CLASS = COCOClasses.SPORTS_BALL  # 32 (COCO)


class YOLOAnalyzer:
    """
    DEPRECATED backward-compatible wrapper.

    Routes all calls through VisionPipeline.
    Preserves existing API surface for main.py and frontend.
    """

    def __init__(self, model_name: str = "yolo11n", confidence: float = 0.4):
        self._config = VisionConfig(
            model_name="yolo11",
            model_size="n",
            confidence_threshold=confidence,
        )
        self._pipeline = VisionPipeline(self._config)

    @property
    def model(self):
        """Access underlying YOLO model (backward compat)."""
        return self._pipeline.detector.model

    def detect_players(self, frame, conf_threshold: float = None):
        """
        Detect persons + sports ball in a frame.

        Returns list of dicts (backward-compatible format):
          [{"bbox", "center", "confidence", "class_id", "class_name"}]
        """
        conf = conf_threshold or self._config.confidence_threshold
        old_conf = self._config.confidence_threshold
        self._config.confidence_threshold = conf

        detections = self._pipeline.detector.detect_frame(frame)

        self._config.confidence_threshold = old_conf

        # Convert Detection objects to legacy dict format
        results = []
        for d in detections:
            results.append({
                "bbox": d.bbox,
                "center": d.center,
                "confidence": d.confidence,
                "class_id": d.class_id,
                "class_name": d.class_name,
            })
        return results

    def detect_and_track(self, frame, conf_threshold: float = None):
        """Detect + return track IDs (extended API)."""
        conf = conf_threshold or self._config.confidence_threshold
        old_conf = self._config.confidence_threshold
        self._config.confidence_threshold = conf

        detections = self._pipeline.detector.detect_frame(frame)

        self._config.confidence_threshold = old_conf

        return [d.to_dict() for d in detections]

    def get_pipeline(self) -> VisionPipeline:
        """Access the underlying VisionPipeline for advanced usage."""
        return self._pipeline

    def get_config(self) -> VisionConfig:
        """Access current VisionConfig."""
        return self._config
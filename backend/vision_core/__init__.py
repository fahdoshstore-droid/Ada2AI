"""
Ada2AI Vision Core — Unified Sports Vision Intelligence Pipeline

Single source of truth for:
  - Detection (YOLO11)
  - Tracking (ByteTrack)
  - Pose Estimation (YOLO11-pose)
  - Event Intelligence
  - Sports Graph Foundations

Usage:
  from vision_core import VisionConfig, VisionPipeline
  config = VisionConfig(model_size="n", pose_enabled=True)
  pipeline = VisionPipeline(config)
  result = pipeline.analyze_video("match.mp4")
"""

from vision_core.config import VisionConfig
from vision_core.pipeline import VisionPipeline
from vision_core.detector import SportsDetector
from vision_core.tracker import SportsTracker
from vision_core.pose import PoseExtractor

__all__ = ["VisionConfig", "VisionPipeline", "SportsDetector", "SportsTracker", "PoseExtractor"]
__version__ = "1.0.0"
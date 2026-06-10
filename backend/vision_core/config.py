"""
VisionConfig — Unified configuration for the Sports Vision Pipeline

Single source of truth for all vision parameters.
"""

import torch
from dataclasses import dataclass, field
from typing import Optional


def _detect_device() -> str:
    """Detect best available compute device. Priority: MPS > CUDA > CPU."""
    if torch.backends.mps.is_available() and torch.backends.mps.is_built():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


# ── COCO Class Mapping (validated) ──────────────────────
class COCOClasses:
    """COCO dataset class IDs. Validated against ultralytics COCO mapping."""
    PERSON = 0
    BICYCLE = 1
    CAR = 2
    MOTORCYCLE = 3
    BUS = 5
    TRAIN = 6
    TRUCK = 7
    SPORTS_BALL = 32  # Fixed: was 37 in legacy code (37 = cell phone)
    TENNIS_RACKET = 43
    FRISBEE = 29
    BASEBALL_BAT = 34
    BASEBALL_GLOVE = 35
    SKATEBOARD = 36
    SURFBOARD = 40
    SKIS = 30
    SNOWBOARD = 31
    KITE = 38

    @classmethod
    def sports_relevant(cls) -> list[int]:
        """Classes relevant to sports analysis."""
        return [
            cls.PERSON,
            cls.SPORTS_BALL,
            cls.TENNIS_RACKET,
            cls.FRISBEE,
            cls.BASEBALL_BAT,
            cls.BASEBALL_GLOVE,
            cls.SKATEBOARD,
            cls.SURFBOARD,
        ]


@dataclass
class VisionConfig:
    """Unified configuration for the Sports Vision Pipeline."""

    # ── Model ──────────────────────────────────
    model_size: str = "n"              # n(nano) s(small) m(medium) l(large) x(xlarge)
    model_name: str = "yolo11"         # yolo11 (latest stable)
    confidence_threshold: float = 0.4  # Detection confidence
    iou_threshold: float = 0.45        # NMS IoU threshold

    # ── Device ────────────────────────────────
    device: str = field(default_factory=_detect_device)

    # ── Tracking ──────────────────────────────
    tracking_backend: str = "bytetrack"  # bytetrack (default) | botsort
    track_buffer: int = 30              # Frames to keep lost tracks
    match_thresh: float = 0.8          # Matching threshold for tracker

    # ── Pose ──────────────────────────────────
    pose_enabled: bool = False         # Enable pose estimation
    pose_model_size: str = "n"         # Pose model size

    # ── Segmentation ──────────────────────────
    segmentation_enabled: bool = False  # Enable instance segmentation

    # ── Frame Processing ──────────────────────
    frame_stride: int = 1              # Process every N frames
    max_frames: Optional[int] = None   # Max frames to process (None = all)

    # ── Output ────────────────────────────────
    pixels_per_meter: float = 100.0    # Conversion for speed/distance
    save_detections: bool = True       # Save detection JSON

    # ── Classes ───────────────────────────────
    detect_classes: list[int] = field(
        default_factory=lambda: [COCOClasses.PERSON, COCOClasses.SPORTS_BALL]
    )

    @property
    def detection_model_path(self) -> str:
        return f"{self.model_name}{self.model_size}.pt"

    @property
    def pose_model_path(self) -> str:
        return f"{self.model_name}{self.pose_model_size}-pose.pt"

    @property
    def seg_model_path(self) -> str:
        return f"{self.model_name}{self.pose_model_size}-seg.pt"

    def __post_init__(self):
        if self.model_size not in ("n", "s", "m", "l", "x"):
            raise ValueError(f"Invalid model_size: {self.model_size}")
        if self.tracking_backend not in ("bytetrack", "botsort"):
            raise ValueError(f"Invalid tracking_backend: {self.tracking_backend}")
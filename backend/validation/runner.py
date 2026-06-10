"""
Real Match Validation — Stress test the full intelligence pipeline

Measures real-world reliability across:
  full matches, academy matches, low-quality footage,
  mobile recordings, multiple angles, crowded scenes, partial occlusions

Outputs: tracking stability, role confidence, event confidence,
  pose reliability, tactical zone consistency, false positives, identity switching
"""

import json
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from pathlib import Path
from enum import Enum


class FootageType(str, Enum):
    FULL_MATCH = "full_match"
    ACADEMY = "academy"
    LOW_QUALITY = "low_quality"
    MOBILE = "mobile"
    MULTI_ANGLE = "multi_angle"
    CROWDED = "crowded"
    OCCLUDED = "occluded"


@dataclass
class TrackingStability:
    """Tracking quality metrics."""
    total_tracks: int = 0
    avg_track_length_frames: float = 0.0
    identity_switches: int = 0         # track_id reassignment events
    lost_tracks: int = 0               # tracks that disappeared
    recovered_tracks: int = 0          # tracks that re-appeared
    stability_score: float = 0.0      # 0-1

    def compute_score(self):
        if self.total_tracks == 0:
            self.stability_score = 0.0
            return
        switch_rate = self.identity_switches / max(1, self.total_tracks)
        loss_rate = self.lost_tracks / max(1, self.total_tracks)
        recovery_bonus = self.recovered_tracks / max(1, self.lost_tracks + 1)
        self.stability_score = max(0.0, 1.0 - switch_rate - loss_rate * 0.5 + recovery_bonus * 0.2)


@dataclass
class RoleConfidence:
    """Role evaluation confidence metrics."""
    total_evaluated: int = 0
    high_confidence_count: int = 0      # fit_score >= 0.7
    ambiguous_count: int = 0            # 0.3-0.7
    low_confidence_count: int = 0       # < 0.3
    avg_fit_score: float = 0.0
    role_confusion_pairs: List[Dict] = field(default_factory=list)
    # e.g. [{"role_a": "pressing_forward", "role_b": "box_crasher", "count": 3}]
    confidence_score: float = 0.0

    def compute_score(self):
        if self.total_evaluated == 0:
            self.confidence_score = 0.0
            return
        high_rate = self.high_confidence_count / self.total_evaluated
        confusion_penalty = len(self.role_confusion_pairs) * 0.05
        self.confidence_score = max(0.0, high_rate - confusion_penalty)


@dataclass
class EventConfidence:
    """Event detection confidence metrics."""
    total_events: int = 0
    confirmed_events: int = 0          # confidence >= 0.6
    false_positives: int = 0           # detected but shouldn't be
    missing_events: int = 0            # should be detected but weren't
    avg_confidence: float = 0.0
    event_type_accuracy: Dict[str, float] = field(default_factory=dict)  # event_type → accuracy
    confidence_score: float = 0.0

    def compute_score(self):
        if self.total_events == 0:
            self.confidence_score = 0.0
            return
        precision = self.confirmed_events / max(1, self.confirmed_events + self.false_positives)
        recall = self.confirmed_events / max(1, self.confirmed_events + self.missing_events)
        if precision + recall == 0:
            self.confidence_score = 0.0
        else:
            self.confidence_score = 2 * precision * recall / (precision + recall)


@dataclass
class PoseReliability:
    """Pose estimation reliability metrics."""
    frames_with_pose: int = 0
    total_frames: int = 0
    avg_keypoint_confidence: float = 0.0
    missing_keypoints_rate: float = 0.0
    reliability_score: float = 0.0

    def compute_score(self):
        if self.total_frames == 0:
            self.reliability_score = 0.0
            return
        coverage = self.frames_with_pose / self.total_frames
        self.reliability_score = coverage * self.avg_keypoint_confidence * (1 - self.missing_keypoints_rate)


@dataclass
class ZoneConsistency:
    """Tactical zone assignment consistency."""
    total_assignments: int = 0
    consistent_assignments: int = 0    # player stays in same zone
    zone_hops: int = 0                  # rapid zone switching
    consistency_score: float = 0.0

    def compute_score(self):
        if self.total_assignments == 0:
            self.consistency_score = 0.0
            return
        self.consistency_score = self.consistent_assignments / self.total_assignments


@dataclass
class ValidationReport:
    """Complete validation report for a match analysis run."""
    report_id: str = ""
    timestamp: float = 0.0
    footage_type: str = ""
    video_path: str = ""
    duration_seconds: float = 0.0
    # ── Metrics ────────────────────────
    tracking: TrackingStability = field(default_factory=TrackingStability)
    role: RoleConfidence = field(default_factory=RoleConfidence)
    events: EventConfidence = field(default_factory=EventConfidence)
    pose: PoseReliability = field(default_factory=PoseReliability)
    zones: ZoneConsistency = field(default_factory=ZoneConsistency)
    # ── Issues ────────────────────────
    false_positives: List[Dict] = field(default_factory=list)
    role_confusions: List[Dict] = field(default_factory=list)
    identity_switches: List[Dict] = field(default_factory=list)
    missing_events: List[Dict] = field(default_factory=list)
    # ── Overall ──────────────────────
    overall_score: float = 0.0
    ready_for_production: bool = False

    def compute_overall(self):
        self.tracking.compute_score()
        self.role.compute_score()
        self.events.compute_score()
        self.pose.compute_score()
        self.zones.compute_score()
        self.overall_score = (
            self.tracking.stability_score * 0.30 +
            self.role.confidence_score * 0.20 +
            self.events.confidence_score * 0.25 +
            self.pose.reliability_score * 0.15 +
            self.zones.consistency_score * 0.10
        )
        self.ready_for_production = self.overall_score >= 0.7

    def to_dict(self) -> dict:
        self.compute_overall()
        return {
            "report_id": self.report_id,
            "timestamp": self.timestamp,
            "footage_type": self.footage_type,
            "video_path": self.video_path,
            "duration_seconds": round(self.duration_seconds, 1),
            "scores": {
                "overall": round(self.overall_score, 3),
                "tracking_stability": round(self.tracking.stability_score, 3),
                "role_confidence": round(self.role.confidence_score, 3),
                "event_confidence": round(self.events.confidence_score, 3),
                "pose_reliability": round(self.pose.reliability_score, 3),
                "zone_consistency": round(self.zones.consistency_score, 3),
            },
            "issues": {
                "false_positives": len(self.false_positives),
                "role_confusions": len(self.role_confusions),
                "identity_switches": len(self.identity_switches),
                "missing_events": len(self.missing_events),
            },
            "ready_for_production": self.ready_for_production,
        }


class ValidationRunner:
    """
    Stress test the full intelligence pipeline on real match footage.

    Usage:
        runner = ValidationRunner(pipeline)
        report = runner.validate("match.mp4", footage_type="full_match")
        print(report.to_dict())
    """

    HISTORY_PATH = Path(__file__).parent / "validation_history.json"

    def __init__(self, pipeline=None):
        self.pipeline = pipeline
        self._history: List[dict] = []
        self._load_history()

    def _load_history(self):
        if self.HISTORY_PATH.exists():
            try:
                self._history = json.loads(self.HISTORY_PATH.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, TypeError):
                self._history = []

    def _save_history(self):
        self.HISTORY_PATH.write_text(
            json.dumps(self._history[-50:], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def validate(self, video_path: str, footage_type: str = "full_match") -> ValidationReport:
        """
        Run full pipeline validation on a video.

        Returns ValidationReport with all metrics computed.
        """
        if self.pipeline is None:
            raise RuntimeError("No VisionPipeline provided to ValidationRunner")

        report = ValidationReport(
            report_id=f"val_{int(time.time()*1000)}",
            timestamp=time.time(),
            footage_type=footage_type,
            video_path=video_path,
        )

        # Run the pipeline
        start = time.time()
        result = self.pipeline.analyze_video(video_path)
        report.duration_seconds = time.time() - start

        # ── Extract Metrics from pipeline result ──

        tracks = result.get("tracked_players", {})
        frames = result.get("frames", [])
        events = result.get("events", [])

        # Tracking stability
        if tracks:
            track_lengths = [len(t.get("positions", [])) for t in tracks.values() if isinstance(t, dict)]
            report.tracking.total_tracks = len(tracks)
            report.tracking.avg_track_length_frames = sum(track_lengths) / max(1, len(track_lengths))
            report.tracking.identity_switches = result.get("identity_switches", 0)
            report.tracking.lost_tracks = result.get("lost_tracks", 0)

        # Event confidence
        if events:
            confirmed = [e for e in events if isinstance(e, dict) and e.get("confidence", 0) >= 0.6]
            report.events.total_events = len(events)
            report.events.confirmed_events = len(confirmed)
            conf_values = [e.get("confidence", 0) for e in events if isinstance(e, dict)]
            report.events.avg_confidence = sum(conf_values) / max(1, len(conf_values)) if conf_values else 0

        # Pose reliability (if pose was enabled)
        pose_frames = result.get("pose_frames", 0)
        report.pose.total_frames = len(frames) if frames else result.get("total_frames", 0)
        report.pose.frames_with_pose = pose_frames
        report.pose.avg_keypoint_confidence = result.get("avg_keypoint_confidence", 0.0)

        # Zone consistency
        zone_data = result.get("zone_analysis", {})
        if zone_data:
            report.zones.total_assignments = zone_data.get("total_assignments", 0)
            report.zones.consistent_assignments = zone_data.get("consistent_assignments", 0)
            report.zones.zone_hops = zone_data.get("zone_hops", 0)

        # Role confidence
        role_data = result.get("role_evaluations", {})
        if role_data:
            fits = [r.get("fit_score", 0) for r in role_data.values() if isinstance(r, dict)]
            report.role.total_evaluated = len(fits)
            report.role.high_confidence_count = sum(1 for f in fits if f >= 0.7)
            report.role.ambiguous_count = sum(1 for f in fits if 0.3 <= f < 0.7)
            report.role.low_confidence_count = sum(1 for f in fits if f < 0.3)
            report.role.avg_fit_score = sum(fits) / max(1, len(fits)) if fits else 0

        # Compute all scores
        report.compute_overall()

        # Persist
        self._history.append(report.to_dict())
        self._save_history()

        return report

    def validate_batch(self, videos: List[Tuple[str, str]]) -> List[ValidationReport]:
        """
        Validate multiple videos. Each entry: (video_path, footage_type).
        """
        reports = []
        for video_path, ftype in videos:
            try:
                report = self.validate(video_path, ftype)
                reports.append(report)
            except Exception as e:
                # Log failure but continue
                failed = ValidationReport(
                    report_id=f"val_fail_{int(time.time()*1000)}",
                    video_path=video_path,
                    footage_type=ftype,
                )
                reports.append(failed)
        return reports

    def get_history(self) -> List[dict]:
        """Get validation history."""
        return self._history

    def get_summary(self) -> dict:
        """Aggregate validation statistics."""
        if not self._history:
            return {"status": "no_data"}

        scores = [h.get("scores", {}).get("overall", 0) for h in self._history]
        avg_score = sum(scores) / len(scores)
        by_type = {}
        for h in self._history:
            ftype = h.get("footage_type", "unknown")
            if ftype not in by_type:
                by_type[ftype] = []
            by_type[ftype].append(h.get("scores", {}).get("overall", 0))

        return {
            "total_validations": len(self._history),
            "average_score": round(avg_score, 3),
            "by_footage_type": {
                k: round(sum(v) / len(v), 3) for k, v in by_type.items()
            },
            "production_ready_count": sum(1 for s in scores if s >= 0.7),
        }
"""Registry of the 15 CV-supported bodybuilding movements and their rule keys.

This is a data contract (not fake business data): it mirrors the seeded
``physique_exercise_library`` rows and defines the interface that Phase 2
movement-rule implementations must satisfy.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Callable


class MovementRuleKey(str, Enum):
    SQUAT = "squat"
    BENCH_PRESS = "bench_press"
    DEADLIFT = "deadlift"
    SHOULDER_PRESS = "shoulder_press"
    PULL_UP = "pull_up"
    LAT_PULLDOWN = "lat_pulldown"
    CABLE_ROW = "cable_row"
    BICEPS_CURL = "biceps_curl"
    TRICEPS_PUSHDOWN = "triceps_pushdown"
    LEG_PRESS = "leg_press"
    HACK_SQUAT = "hack_squat"
    LATERAL_RAISE = "lateral_raise"
    ROMANIAN_DEADLIFT = "romanian_deadlift"
    HIP_THRUST = "hip_thrust"
    WALKING_LUNGES = "walking_lunges"


@dataclass
class MovementRule:
    """Contract for a Phase 2 exercise movement rule (not yet implemented)."""
    key: MovementRuleKey
    display_name: str
    primary_joints: list[str] = field(default_factory=list)
    # Phase 2 will populate: setup/concentric/eccentric angle thresholds, tempo
    # windows, stability heuristics, mistake signatures, injury-risk flags.
    implemented: bool = False
    analyze: Optional[Callable] = None  # set in Phase 2: (frames, pose_series) -> AnalysisReport


# Phase 1: registry of keys + display names only. Phase 2 fills `implemented`/`analyze`.
MOVEMENT_RULES: dict[MovementRuleKey, MovementRule] = {
    MovementRuleKey.SQUAT:            MovementRule(MovementRuleKey.SQUAT, "Barbell Squat", ["hip", "knee", "ankle"]),
    MovementRuleKey.BENCH_PRESS:      MovementRule(MovementRuleKey.BENCH_PRESS, "Bench Press", ["shoulder", "elbow"]),
    MovementRuleKey.DEADLIFT:         MovementRule(MovementRuleKey.DEADLIFT, "Deadlift", ["hip", "knee", "lumbar"]),
    MovementRuleKey.SHOULDER_PRESS:   MovementRule(MovementRuleKey.SHOULDER_PRESS, "Shoulder Press", ["shoulder", "elbow"]),
    MovementRuleKey.PULL_UP:          MovementRule(MovementRuleKey.PULL_UP, "Pull-up", ["shoulder", "elbow"]),
    MovementRuleKey.LAT_PULLDOWN:     MovementRule(MovementRuleKey.LAT_PULLDOWN, "Lat Pulldown", ["shoulder", "elbow"]),
    MovementRuleKey.CABLE_ROW:        MovementRule(MovementRuleKey.CABLE_ROW, "Cable Row", ["shoulder", "elbow", "lumbar"]),
    MovementRuleKey.BICEPS_CURL:      MovementRule(MovementRuleKey.BICEPS_CURL, "Biceps Curl", ["elbow"]),
    MovementRuleKey.TRICEPS_PUSHDOWN: MovementRule(MovementRuleKey.TRICEPS_PUSHDOWN, "Triceps Pushdown", ["elbow", "shoulder"]),
    MovementRuleKey.LEG_PRESS:        MovementRule(MovementRuleKey.LEG_PRESS, "Leg Press", ["hip", "knee", "ankle"]),
    MovementRuleKey.HACK_SQUAT:       MovementRule(MovementRuleKey.HACK_SQUAT, "Hack Squat", ["hip", "knee"]),
    MovementRuleKey.LATERAL_RAISE:    MovementRule(MovementRuleKey.LATERAL_RAISE, "Lateral Raise", ["shoulder"]),
    MovementRuleKey.ROMANIAN_DEADLIFT: MovementRule(MovementRuleKey.ROMANIAN_DEADLIFT, "Romanian Deadlift", ["hip", "lumbar", "knee"]),
    MovementRuleKey.HIP_THRUST:       MovementRule(MovementRuleKey.HIP_THRUST, "Hip Thrust", ["hip", "knee"]),
    MovementRuleKey.WALKING_LUNGES:   MovementRule(MovementRuleKey.WALKING_LUNGES, "Walking Lunges", ["hip", "knee", "ankle"]),
}


def get_rule(key: str) -> Optional[MovementRule]:
    try:
        return MOVEMENT_RULES[MovementRuleKey(key)]
    except ValueError:
        return None

"""
Temporal Intelligence Engine — Player evolution over time

No more static snapshots. System understands trajectory.
Tracks: form evolution, tactical adaptation, consistency, fatigue,
  role evolution, movement changes, pressure tolerance changes.
Outputs: time-aware intelligence profiles.
"""

import math
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field

from intelligence.roles import PlayerEventSignature
from intelligence.dna import PlayerDNAProfile


@dataclass
class TemporalSnapshot:
    """Single time-point player observation."""
    match_id: str
    timestamp: float
    signature: Optional[PlayerEventSignature] = None
    dna_profile: Optional[PlayerDNAProfile] = None
    role_fits: Dict[str, float] = field(default_factory=dict)
    fatigue_index: float = 0.0        # 0=fresh, 1=exhausted


@dataclass
class EvolutionTrajectory:
    """How a dimension changes over time."""
    dimension: str                     # e.g. "speed", "pressing_intensity", "role_fit:transition_winger"
    values: List[Tuple[float, float]] = field(default_factory=list)  # (timestamp, value)
    trend: str = "stable"             # improving | declining | stable | volatile
    rate_of_change: float = 0.0       # per match

    def compute_trend(self):
        """Determine trend from recent values."""
        if len(self.values) < 2:
            self.trend = "stable"
            return
        recent = self.values[-5:]  # Last 5 data points
        vals = [v for _, v in recent]
        if len(vals) < 2:
            self.trend = "stable"
            return
        # Linear regression slope
        n = len(vals)
        xs = list(range(n))
        mean_x = sum(xs) / n
        mean_y = sum(vals) / n
        cov = sum((xs[i] - mean_x) * (vals[i] - mean_y) for i in range(n))
        var_x = sum((x - mean_x) ** 2 for x in xs)
        slope = cov / var_x if var_x > 0 else 0
        self.rate_of_change = slope

        # Classify trend
        if abs(slope) < 0.02:
            self.trend = "stable"
        elif slope > 0:
            self.trend = "improving"
        else:
            self.trend = "declining"

        # Volatility check
        if len(vals) >= 3:
            variance = sum((v - mean_y) ** 2 for v in vals) / n
            if variance > 0.1:
                self.trend = "volatile"


@dataclass
class TemporalProfile:
    """Time-aware player intelligence profile."""
    player_id: int
    snapshots: List[TemporalSnapshot] = field(default_factory=list)
    trajectories: Dict[str, EvolutionTrajectory] = field(default_factory=dict)
    # ── Derived ────────────────────────
    form_trend: str = "stable"             # improving | declining | stable
    tactical_adaptation: float = 0.0       # How well player adapted to new system
    consistency_score: float = 0.0         # Stability of performance
    fatigue_pattern: str = "normal"        # normal | early_fatigue | recovery | concern
    role_evolution: List[Dict] = field(default_factory=list)  # [{match, best_role, score}]
    pressure_tolerance_trend: str = "stable"

    def to_dict(self) -> dict:
        return {
            "player_id": self.player_id,
            "snapshots_count": len(self.snapshots),
            "form_trend": self.form_trend,
            "tactical_adaptation": round(self.tactical_adaptation, 3),
            "consistency_score": round(self.consistency_score, 3),
            "fatigue_pattern": self.fatigue_pattern,
            "pressure_tolerance_trend": self.pressure_tolerance_trend,
            "trajectories": {
                k: {"trend": v.trend, "rate": round(v.rate_of_change, 4), "data_points": len(v.values)}
                for k, v in self.trajectories.items()
            },
            "role_evolution": self.role_evolution,
        }


class TemporalProfileEngine:
    """
    Understand player evolution over time.

    No static snapshots — trajectory-based intelligence.
    """

    # Dimensions to track over time
    TRACKED_DIMENSIONS = [
        "avg_speed", "max_speed", "distance_covered",
        "pressing_intensity", "creative_output", "transition_speed",
        "positional_discipline",
    ]

    def __init__(self):
        self._profiles: Dict[int, TemporalProfile] = {}

    def add_snapshot(self, player_id: int, match_id: str, signature: PlayerEventSignature = None, dna_profile: PlayerDNAProfile = None, role_fits: Dict[str, float] = None, fatigue_index: float = 0.0):
        """Add a temporal observation for a player."""
        if player_id not in self._profiles:
            self._profiles[player_id] = TemporalProfile(player_id=player_id)

        profile = self._profiles[player_id]
        snapshot = TemporalSnapshot(
            match_id=match_id,
            timestamp=time.time(),
            signature=signature,
            dna_profile=dna_profile,
            role_fits=role_fits or {},
            fatigue_index=fatigue_index,
        )
        profile.snapshots.append(snapshot)

        # Update trajectories
        if signature:
            ts = snapshot.timestamp
            dims = {
                "avg_speed": signature.avg_speed_mps,
                "max_speed": signature.max_speed_mps,
                "distance_covered": signature.total_distance_meters,
                "pressing_intensity": signature.sprint_presses / max(1, signature.sprint_count + signature.sprint_presses),
                "creative_output": signature.shot_creation_actions / max(1, signature.pass_count + 1),
                "transition_speed": signature.transition_count / max(1, signature.possession_time + 1) * 60,
                "positional_discipline": 1.0 - abs(signature.zone_time_pct.get("half_space", 0.5) - 0.5) if hasattr(signature.zone_time_pct, 'get') else 0.5,
            }
            for dim_name, value in dims.items():
                if dim_name not in profile.trajectories:
                    profile.trajectories[dim_name] = EvolutionTrajectory(dimension=dim_name)
                profile.trajectories[dim_name].values.append((ts, value))
                profile.trajectories[dim_name].compute_trend()

        if dna_profile:
            for trait, value in dna_profile.traits.items():
                key = f"dna:{trait}"
                if key not in profile.trajectories:
                    profile.trajectories[key] = EvolutionTrajectory(dimension=key)
                profile.trajectories[key].values.append((snapshot.timestamp, value))
                profile.trajectories[key].compute_trend()

        # Role evolution
        if role_fits:
            best_role = max(role_fits, key=role_fits.get) if role_fits else ""
            profile.role_evolution.append({
                "match_id": match_id,
                "best_role": best_role,
                "fit_score": role_fits.get(best_role, 0),
            })

        # Compute derived metrics
        self._compute_derived(profile)

    def get_profile(self, player_id: int) -> Optional[TemporalProfile]:
        return self._profiles.get(player_id)

    def _compute_derived(self, profile: TemporalProfile):
        """Compute derived temporal metrics."""
        if len(profile.snapshots) < 2:
            return

        # Form trend — aggregate of improving trajectories
        improving = sum(1 for t in profile.trajectories.values() if t.trend == "improving")
        declining = sum(1 for t in profile.trajectories.values() if t.trend == "declining")
        if improving > declining:
            profile.form_trend = "improving"
        elif declining > improving:
            profile.form_trend = "declining"
        else:
            profile.form_trend = "stable"

        # Consistency — variance of key metrics
        speed_traj = profile.trajectories.get("avg_speed")
        if speed_traj and len(speed_traj.values) >= 3:
            vals = [v for _, v in speed_traj.values[-10:]]
            mean_v = sum(vals) / len(vals)
            var = sum((v - mean_v) ** 2 for v in vals) / len(vals)
            profile.consistency_score = max(0.0, 1.0 - var / (mean_v ** 2 + 0.01))

        # Fatigue pattern
        fatigue_vals = [s.fatigue_index for s in profile.snapshots[-5:] if s.fatigue_index > 0]
        if fatigue_vals:
            avg_fatigue = sum(fatigue_vals) / len(fatigue_vals)
            if avg_fatigue > 0.7:
                profile.fatigue_pattern = "concern"
            elif avg_fatigue > 0.5:
                profile.fatigue_pattern = "early_fatigue"
            elif len(fatigue_vals) >= 3 and fatigue_vals[-1] < fatigue_vals[0]:
                profile.fatigue_pattern = "recovery"
            else:
                profile.fatigue_pattern = "normal"

        # Pressure tolerance trend
        press_traj = profile.trajectories.get("pressing_intensity")
        if press_traj:
            profile.pressure_tolerance_trend = press_traj.trend
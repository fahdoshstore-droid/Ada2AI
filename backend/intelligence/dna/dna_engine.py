"""
Player DNA Engine — Stylistic identity vectors

Generates vector-based player profiles from match behavior.
Weighted traits with temporal evolution support.
No arbitrary ratings — every dimension maps to football events.
"""

import math
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field

from intelligence.ontology import FootballOntology
from intelligence.roles import PlayerEventSignature


# ── DNA Trait Definitions ────────────────────────────
# Each trait is derived from actual match events (0-1 normalized)

DNA_TRAITS = {
    # Pressing behavior
    "press_aggression": {
        "ar": "عدوانية الضغط",
        "en": "Press Aggression",
        "description": "ميل اللاعب للضغط على حامل الكرة بكثافة",
    },
    # Progression style
    "carry_vs_pass": {
        "ar": "تقدم بالكرة مقابل التمرير",
        "en": "Carry vs Pass Progression",
        "description": "هل يفضل التقدم بالكرة أم التمرير التقدمي (+1=carry, -1=pass)",
    },
    # Risk profile
    "risk_appetite": {
        "ar": "مستوى المخاطرة",
        "en": "Risk Appetite",
        "description": "ميل اللاعب للحلول عالية المخاطر (تمريرات كاسرة، تقدم فردي)",
    },
    # Transition focus
    "transition_focus": {
        "ar": "تركيز التحولات",
        "en": "Transition Focus",
        "description": "نشاط اللاعب في لحظات التحول (هجوم↔دفاع)",
    },
    # Positional stability
    "positional_stability": {
        "ar": "استقرار مواقعي",
        "en": "Positional Stability",
        "description": "مدى التزام اللاعب بمنطقه بدل التنقل",
    },
    # Tempo control
    "tempo_control": {
        "ar": "التحكم بالإيقاع",
        "en": "Tempo Control",
        "description": "قدرة التباين في السرعة (تسارع/تباطؤ حسب الموقف)",
    },
    # Spatial occupation
    "half_space_tendency": {
        "ar": "ميل المساحة النصفية",
        "en": "Half-Space Tendency",
        "description": "ميل اللاعب لاحتلال المساحات بين الأطراف والوسط",
    },
    # Box presence
    "box_presence": {
        "ar": "حضور منطقة الجزاء",
        "en": "Box Presence",
        "description": "مستوى تواجد اللاعب في منطقة الجزاء",
    },
}


@dataclass
class PlayerDNAProfile:
    """Vector-based stylistic identity."""
    track_id: int
    team: Optional[int] = None
    traits: Dict[str, float] = field(default_factory=dict)   # trait_name → value (-1 to 1)

    # Temporal evolution (by match timestamp)
    trait_history: Dict[str, List[Tuple[float, float]]] = field(default_factory=dict)

    # Stylistic labels (derived from trait thresholds)
    labels: List[Dict[str, str]] = field(default_factory=list)

    # Consistency
    consistency_score: float = 0.0     # 0-1, how consistent across match segments

    def to_vector(self) -> List[float]:
        """Export as ordered numeric vector for similarity computation."""
        ordered_keys = sorted(DNA_TRAITS.keys())
        return [self.traits.get(k, 0.0) for k in ordered_keys]

    def to_dict(self) -> dict:
        return {
            "track_id": self.track_id,
            "team": self.team,
            "traits": {k: round(v, 3) for k, v in self.traits.items()},
            "labels": self.labels,
            "consistency": round(self.consistency_score, 3),
        }


class PlayerDNAEngine:
    """
    Generate stylistic DNA profiles from player event signatures.

    DNA vectors capture HOW a player plays, not just what they produce.
    Every dimension maps to actual football events.
    """

    def __init__(self, ontology: FootballOntology = None):
        self.ontology = ontology or FootballOntology()

    def generate_profile(self, sig: PlayerEventSignature) -> PlayerDNAProfile:
        """
        Generate DNA profile from a player's event signature.

        All traits are normalized to [-1, 1] range where applicable.
        """
        profile = PlayerDNAProfile(track_id=sig.track_id, team=sig.team)

        # ── Compute each DNA trait ─────────────────

        # 1. Press Aggression (0-1 → scale to -1,1)
        profile.traits["press_aggression"] = sig.pressing_intensity * 2 - 1

        # 2. Carry vs Pass (-1 = pure passer, +1 = pure carrier)
        total_prog = sig.progressive_passes + sig.carry_progressions
        if total_prog > 0:
            carry_ratio = sig.carry_progressions / total_prog
            profile.traits["carry_vs_pass"] = carry_ratio * 2 - 1
        else:
            profile.traits["carry_vs_pass"] = 0.0

        # 3. Risk Appetite (line breaks + carries + shots vs safe passes)
        risky = sig.line_breaking_passes + sig.carry_progressions + sig.shot_count
        safe = sig.pass_count - sig.line_breaking_passes
        total_risk = risky + safe
        if total_risk > 0:
            profile.traits["risk_appetite"] = (risky / total_risk) * 2 - 1
        else:
            profile.traits["risk_appetite"] = 0.0

        # 4. Transition Focus (0-1)
        profile.traits["transition_focus"] = sig.transition_speed * 2 - 1

        # 5. Positional Stability (0=roamer, 1=anchored → scale to -1,1)
        profile.traits["positional_stability"] = sig.positional_discipline * 2 - 1

        # 6. Tempo Control (speed variance → high variance = good tempo control)
        if sig.avg_speed_mps > 0 and sig.max_speed_mps > 0:
            speed_variance = (sig.max_speed_mps - sig.avg_speed_mps) / sig.max_speed_mps
            profile.traits["tempo_control"] = min(1.0, speed_variance * 2) - 1 + 1  # 0-1 scale
            profile.traits["tempo_control"] = speed_variance * 2 - 1
        else:
            profile.traits["tempo_control"] = 0.0

        # 7. Half-Space Tendency
        hs_pct = sig.zone_time_pct.get("half_space", 0.0)
        total_zone = sum(sig.zone_time_pct.values())
        if total_zone > 0:
            profile.traits["half_space_tendency"] = (hs_pct / total_zone) * 4 - 1
        else:
            profile.traits["half_space_tendency"] = 0.0

        # 8. Box Presence
        box_pct = sig.zone_time_pct.get("penalty_area", 0.0)
        profile.traits["box_presence"] = min(1.0, box_pct * 5) * 2 - 1

        # ── Generate Labels ────────────────────────
        profile.labels = self._generate_labels(profile.traits)

        # ── Consistency Score ─────────────────────
        profile.consistency_score = self._compute_consistency(sig)

        return profile

    def _generate_labels(self, traits: Dict[str, float]) -> List[Dict[str, str]]:
        """Generate Arabic/English stylistic labels from trait values."""
        labels = []

        if traits.get("press_aggression", 0) > 0.4:
            labels.append({"ar": "ضاغط عدواني", "en": "Aggressive Presser"})

        if traits.get("carry_vs_pass", 0) > 0.3:
            labels.append({"ar": "حامل تقدمي", "en": "Progressive Carrier"})
        elif traits.get("carry_vs_pass", 0) < -0.3:
            labels.append({"ar": "ممرر محافظ", "en": "Conservative Passer"})

        if traits.get("risk_appetite", 0) > 0.3:
            labels.append({"ar": "صانع مخاطر", "en": "High-Risk Creator"})
        elif traits.get("risk_appetite", 0) < -0.3:
            labels.append({"ar": "لاعب آمن", "en": "Safe Player"})

        if traits.get("transition_focus", 0) > 0.4:
            labels.append({"ar": "متحول", "en": "Transition-Focused"})

        if traits.get("positional_stability", 0) > 0.3:
            labels.append({"ar": "مثبت مواقعي", "en": "Positional Stabilizer"})

        if traits.get("half_space_tendency", 0) > 0.2:
            labels.append({"ar": "محتل المساحة النصفية", "en": "Half-Space Occupier"})

        if traits.get("box_presence", 0) > 0.3:
            labels.append({"ar": "مقتحم الجزاء", "en": "Box Crasher"})

        return labels

    def _compute_consistency(self, sig: PlayerEventSignature) -> float:
        """
        Compute match-to-match behavioral consistency.
        High consistency = same traits visible across match segments.
        """
        # Simple proxy: if player has balanced event distribution
        total_events = (
            sig.pass_count + sig.sprint_count + sig.shot_count +
            sig.pressure_count + sig.transition_count
        )
        if total_events == 0:
            return 0.0

        # Even distribution = higher consistency
        event_counts = [sig.pass_count, sig.sprint_count, sig.shot_count, sig.pressure_count]
        event_fracs = [c / total_events for c in event_counts if c > 0]
        if len(event_fracs) <= 1:
            return 0.3

        mean_frac = sum(event_fracs) / len(event_fracs)
        variance = sum((f - mean_frac) ** 2 for f in event_fracs) / len(event_fracs)
        # Lower variance → higher consistency (scale 0-1)
        consistency = max(0.0, 1.0 - variance * 20)
        return consistency
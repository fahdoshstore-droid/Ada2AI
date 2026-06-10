"""
Role Intelligence Engine — Contextual role evaluation with explainable fit scores

Evaluates players CONTEXTUALLY against tactical roles.
Every score maps to actual football events — no arbitrary ratings.

Input: events, movement, zones, pose, transitions
Output: role_fit_scores per player with explanations
"""

import math
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field

from intelligence.ontology import FootballOntology, RoleDefinition
from vision_core.config import COCOClasses


# ── Player Event Signature ───────────────────────────
# Derived from raw VisionPipeline output per player

@dataclass
class PlayerEventSignature:
    """Statistical profile of a player derived from actual match events."""
    track_id: int
    team: Optional[int] = None
    # ── Event Counts ──────────────────────────────
    pass_count: int = 0
    sprint_count: int = 0
    shot_count: int = 0
    pressure_count: int = 0
    transition_count: int = 0
    possession_time: float = 0.0       # seconds
    # ── Movement ─────────────────────────────────
    total_distance_meters: float = 0.0
    avg_speed_mps: float = 0.0
    max_speed_mps: float = 0.0
    # ── Zones ─────────────────────────────────────
    zone_time_pct: Dict[str, float] = field(default_factory=dict)
    #   e.g. {"attacking_third": 0.3, "midfield": 0.5, ...}
    # ── Derived events (from event category mapping) ──
    progressive_passes: int = 0
    line_breaking_passes: int = 0
    recovery_runs: int = 0
    sprint_presses: int = 0
    defensive_duels: int = 0
    carry_progressions: int = 0
    box_entries: int = 0
    shot_creation_actions: int = 0
    # ── Pose summaries ────────────────────────────
    avg_sprint_posture: float = 0.0    # 0=upright, 1=leaning
    avg_orientation: float = 0.0       # radians

    @property
    def pressing_intensity(self) -> float:
        """Normalized pressing intensity (0-1)."""
        total = self.sprint_presses + self.pressure_count
        return min(1.0, total / 15.0) if total > 0 else 0.0

    @property
    def transition_speed(self) -> float:
        """Normalized transition capability (0-1)."""
        return min(1.0, self.max_speed_mps / 10.0) if self.max_speed_mps > 0 else 0.0

    @property
    def positional_discipline(self) -> float:
        """Staying in primary zone (0-1). Higher = more disciplined positionally."""
        if not self.zone_time_pct:
            return 0.0
        max_zone = max(self.zone_time_pct.values()) if self.zone_time_pct else 0
        return min(1.0, max_zone * 1.5)

    @property
    def creative_output(self) -> float:
        """Creative contribution (0-1)."""
        creative_events = self.progressive_passes + self.line_breaking_passes + self.shot_creation_actions
        return min(1.0, creative_events / 10.0) if creative_events > 0 else 0.0

    @property
    def vertical_tendency_raw(self) -> str:
        """Classify vertical tendency from zone distribution."""
        attack_pct = self.zone_time_pct.get("attacking_third", 0) + self.zone_time_pct.get("penalty_area", 0)
        defense_pct = self.zone_time_pct.get("defensive_third", 0) + self.zone_time_pct.get("own_penalty_area", 0)
        if attack_pct > 0.4:
            return "very_high"
        elif attack_pct > 0.25:
            return "high"
        elif defense_pct > 0.4:
            return "very_low"
        elif defense_pct > 0.25:
            return "low"
        return "medium"

    def get_trait(self, trait_name: str) -> float:
        """Get a computed trait value by name."""
        trait_map = {
            "pressing_intensity": self.pressing_intensity,
            "transition_speed": self.transition_speed,
            "positional_discipline": self.positional_discipline,
            "creative_output": self.creative_output,
        }
        return trait_map.get(trait_name, 0.0)


@dataclass
class RoleFitScore:
    """Role fit result with explanation."""
    role_id: str
    role_name_ar: str
    role_name_en: str
    fit_score: float                    # 0-1
    trait_scores: Dict[str, float] = field(default_factory=dict)    # trait → player score
    trait_weights: Dict[str, float] = field(default_factory=dict)   # trait → role weight
    explanations: List[str] = field(default_factory=list)
    key_evidence: List[str] = field(default_factory=list)

    def to_dict(self, lang: str = "ar") -> dict:
        name = self.role_name_ar if lang == "ar" else self.role_name_en
        return {
            "role": self.role_id,
            "role_name": name,
            "fit_score": round(self.fit_score, 3),
            "trait_scores": {k: round(v, 3) for k, v in self.trait_scores.items()},
            "explanations": self.explanations,
            "key_evidence": self.key_evidence,
        }


class RoleProfileEngine:
    """
    Evaluate players contextually against tactical roles.

    Every fit score is explainable and maps to actual events.
    """

    def __init__(self, ontology: FootballOntology = None):
        self.ontology = ontology or FootballOntology()

    def evaluate_player(self, signature: PlayerEventSignature, top_n: int = 3) -> List[RoleFitScore]:
        """
        Evaluate a player against all defined roles.

        Args:
            signature: Player event signature from match data
            top_n: Number of top role fits to return

        Returns:
            List of RoleFitScore sorted by fit_score descending
        """
        scores = []
        for role_id, role_def in self.ontology.get_all_roles().items():
            score = self._compute_role_fit(signature, role_def)
            scores.append(score)

        scores.sort(key=lambda s: s.fit_score, reverse=True)
        return scores[:top_n]

    def evaluate_for_role(self, signature: PlayerEventSignature, role_id: str) -> Optional[RoleFitScore]:
        """Evaluate a player for a specific role."""
        role_def = self.ontology.get_role(role_id)
        if role_def is None:
            return None
        return self._compute_role_fit(signature, role_def)

    def _compute_role_fit(self, sig: PlayerEventSignature, role: RoleDefinition) -> RoleFitScore:
        """Compute role fit score with trait-level explanation."""
        trait_scores = {}
        trait_weights = role.key_traits
        explanations = []
        evidence = []

        # Score each trait the role defines
        for trait_name, weight in trait_weights.items():
            player_value = sig.get_trait(trait_name)
            trait_scores[trait_name] = player_value

            # Generate explanation
            if player_value >= weight * 0.9:
                explanations.append(
                    f"✅ {trait_name}: {player_value:.2f} ≈ {weight:.2f} (مطلوب)"
                )
            elif player_value >= weight * 0.6:
                explanations.append(
                    f"⚠️ {trait_name}: {player_value:.2f} < {weight:.2f} (قريب من المطلوب)"
                )
            else:
                explanations.append(
                    f"❌ {trait_name}: {player_value:.2f} ≪ {weight:.2f} (بعيد عن المطلوب)"
                )

        # Zone alignment
        zone_overlap = self._zone_overlap(sig.zone_time_pct, role.zone_tendency)
        if zone_overlap >= 0.5:
            evidence.append(f"يمضي {zone_overlap:.0%} من وقته في مناطق الدور ({', '.join(role.zone_tendency)})")
        else:
            evidence.append(f"ييمضي فقط {zone_overlap:.0%} في مناطق الدور — قد يحتاج لتكيف")

        # Event alignment
        event_match = self._event_alignment(sig, role.key_events)
        if event_match >= 0.3:
            evidence.append(f"ينفذ {event_match:.0%} من أحداث الدور المفتاحية")

        # Compute weighted fit score
        total_weight = sum(trait_weights.values())
        if total_weight == 0:
            fit_score = 0.0
        else:
            weighted_sum = sum(trait_weights[t] * trait_scores.get(t, 0.0) for t in trait_weights)
            fit_score = (weighted_sum / total_weight) * 0.7 + zone_overlap * 0.2 + event_match * 0.1
            fit_score = min(1.0, fit_score)

        # Movement alignment evidence
        move_sig = role.movement_signature
        if move_sig:
            v_tendency = move_sig.get("vertical_tendency", "")
            if sig.vertical_tendency_raw == v_tendency:
                evidence.append("نمط التحرك العمودي يطابق الدور")
                fit_score = min(1.0, fit_score + 0.05)
            elif sig.vertical_tendency_raw in ("high", "very_high") and v_tendency in ("high", "very_high"):
                evidence.append("نمط التحرك العمودي قريب من الدور")

        return RoleFitScore(
            role_id=role.role_id,
            role_name_ar=role.name_ar,
            role_name_en=role.name_en,
            fit_score=fit_score,
            trait_scores=trait_scores,
            trait_weights=trait_weights,
            explanations=explanations,
            key_evidence=evidence,
        )

    def _zone_overlap(self, player_zones: Dict[str, float], role_zones: List[str]) -> float:
        """Calculate what fraction of time player spends in role's key zones."""
        if not role_zones or not player_zones:
            return 0.0
        role_time = sum(player_zones.get(z, 0.0) for z in role_zones)
        total_time = sum(player_zones.values())
        return role_time / total_time if total_time > 0 else 0.0

    def _event_alignment(self, sig: PlayerEventSignature, key_events: List[str]) -> float:
        """Calculate alignment between player's events and role's key events."""
        if not key_events:
            return 0.0
        event_counts = {
            "progressive_pass": sig.progressive_passes,
            "line_breaking_pass": sig.line_breaking_passes,
            "recovery_run": sig.recovery_runs,
            "sprint_press": sig.sprint_presses,
            "defensive_duel": sig.defensive_duels,
            "carry_progression": sig.carry_progressions,
            "box_entry": sig.box_entries,
            "shot_creation_action": sig.shot_creation_actions,
        }
        matched = sum(1 for e in key_events if event_counts.get(e, 0) > 0)
        return matched / len(key_events) if key_events else 0.0
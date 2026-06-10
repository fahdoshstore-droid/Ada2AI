"""
Scout Recommendation Engine — Contextual tactical fit recruiting

NOT "best overall player" — best TACTICAL FIT for THIS system.

Input: club tactical identity, role requirements, player profiles
Output: ranked candidate list with contextual justification
"""

import math
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field

from intelligence.ontology import FootballOntology, RoleDefinition
from intelligence.roles import RoleProfileEngine, PlayerEventSignature, RoleFitScore
from intelligence.dna import PlayerDNAProfile


@dataclass
class ClubTacticalIdentity:
    """A club's tactical identity — what style they play."""
    club_id: str
    club_name_ar: str
    club_name_en: str
    primary_roles: List[str]         # Role IDs the club heavily uses
    tactical_concepts: List[str]     # Concept IDs the club employs
    style_weights: Dict[str, float] = field(default_factory=dict)
    # e.g. {"press_aggression": 0.8, "transition_focus": 0.7, ...}


@dataclass
class Recommendation:
    """A single scout recommendation with context."""
    player_id: int
    role_fit: float                    # How well they fit the requested role
    system_fit: float                  # How well they fit the club system
    overall_score: float               # Combined weighted score
    recommended_role: str
    role_name_ar: str
    fit_explanation: List[str]         # Why this player fits
    risk_factors: List[str]            # What might not work
    dna_labels: List[Dict[str, str]]   # Stylistic labels

    def to_dict(self, lang: str = "ar") -> dict:
        key = "ar" if lang == "ar" else "en"
        return {
            "player_id": self.player_id,
            "recommended_role": self.recommended_role,
            "role_name": self.role_name_ar if lang == "ar" else self.recommended_role,
            "role_fit": round(self.role_fit, 3),
            "system_fit": round(self.system_fit, 3),
            "overall_score": round(self.overall_score, 3),
            "fit_explanation": self.fit_explanation,
            "risk_factors": self.risk_factors,
            "dna_labels": [l.get(key, "") for l in self.dna_labels if l.get(key)],
        }


class ScoutRecommendationEngine:
    """
    Generate contextual recruitment recommendations.

    "best tactical fit for THIS system" — not generic "best player".
    """

    def __init__(
        self,
        ontology: FootballOntology = None,
        role_engine: RoleProfileEngine = None,
    ):
        self.ontology = ontology or FootballOntology()
        self.role_engine = role_engine or RoleProfileEngine(self.ontology)

    def recommend(
        self,
        club_identity: ClubTacticalIdentity,
        target_role: str,
        candidates: List[Tuple[PlayerEventSignature, PlayerDNAProfile]],
        top_n: int = 5,
        age: Optional[int] = None,
        age_flexibility: int = 3,
    ) -> List[Recommendation]:
        """
        Generate ranked candidate list for a role within a club system.

        Args:
            club_identity: The hiring club's tactical identity
            target_role: Role ID to recruit for
            candidates: List of (signature, dna_profile) tuples
            top_n: Number of recommendations
            age: Preferred age (optional filter)

        Returns:
            Sorted list of Recommendation
        """
        recommendations = []

        for sig, dna in candidates:
            # Role fit
            role_fit_result = self.role_engine.evaluate_for_role(sig, target_role)
            role_fit_score = role_fit_result.fit_score if role_fit_result else 0.0

            # System fit — how well player's DNA aligns with club style
            system_fit = self._compute_system_fit(dna, club_identity)

            # Overall score (role fit weighted higher than system fit)
            overall = role_fit_score * 0.6 + system_fit * 0.4

            # Build explanation
            fit_exps = []
            risk_factors = []

            if role_fit_result:
                fit_exps.extend(role_fit_result.key_evidence[:3])
                # Check trait gaps
                for trait, score in role_fit_result.trait_scores.items():
                    weight = role_fit_result.trait_weights.get(trait, 0)
                    if score < weight * 0.5:
                        trait_ar = self._trait_name_ar(trait)
                        risk_factors.append(f"{trait_ar} أقل من المطلوب ({score:.0%} vs {weight:.0%})")

            # System fit explanation
            if system_fit > 0.6:
                fit_exps.append("يناسب الهوية التكتيكية للنادي")
            elif system_fit < 0.3:
                risk_factors.append("قد لا يتكيف مع أسلوب النادي")

            role_def = self.ontology.get_role(target_role)
            rec = Recommendation(
                player_id=sig.track_id,
                role_fit=role_fit_score,
                system_fit=system_fit,
                overall_score=overall,
                recommended_role=target_role,
                role_name_ar=role_def.name_ar if role_def else target_role,
                fit_explanation=fit_exps,
                risk_factors=risk_factors,
                dna_labels=dna.labels if dna else [],
            )
            recommendations.append(rec)

        recommendations.sort(key=lambda r: r.overall_score, reverse=True)
        return recommendations[:top_n]

    def _compute_system_fit(self, dna: PlayerDNAProfile, identity: ClubTacticalIdentity) -> float:
        """
        How well a player's DNA matches the club's tactical identity.

        Club style_weights define desired trait values.
        """
        if not identity.style_weights or not dna.traits:
            return 0.5  # Neutral if no data

        total_diff = 0.0
        count = 0

        for trait, target_value in identity.style_weights.items():
            player_value = dna.traits.get(trait, 0.0)
            diff = abs(player_value - target_value)
            total_diff += diff
            count += 1

        if count == 0:
            return 0.5

        avg_diff = total_diff / count
        # Convert diff (0-2 range) to fit (0-1)
        return max(0.0, 1.0 - avg_diff / 2.0)

    def _trait_name_ar(self, trait_id: str) -> str:
        """Get Arabic name for a trait."""
        from intelligence.dna import DNA_TRAITS
        return DNA_TRAITS.get(trait_id, {}).get("ar", trait_id)
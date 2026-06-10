"""
Club Identity Engine — Understand tactical identity of clubs

Tracks: pressing intensity, buildup style, transition preference,
  width usage, possession tempo, defensive structure.
Output: ClubIdentityProfile for contextual recruitment.
"""

import math
from typing import Dict, List, Optional
from dataclasses import dataclass, field

from intelligence.ontology import FootballOntology


@dataclass
class ClubIdentityProfile:
    """Complete tactical identity of a club."""
    club_id: str
    name_ar: str = ""
    name_en: str = ""
    # ── Tactical Dimensions (0-1 scale) ────
    pressing_intensity: float = 0.5     # How aggressively they press
    buildup_style: float = 0.5          # 0=direct, 1=possession-based
    transition_preference: float = 0.5  # How much they rely on transitions
    width_usage: float = 0.5            # How much they use wide areas
    possession_tempo: float = 0.5       # 0=slow deliberate, 1=fast
    defensive_structure: float = 0.5    # 0=low block, 1=high line

    # ── Derived ────────────────────────────
    primary_roles: List[str] = field(default_factory=list)
    tactical_concepts: List[str] = field(default_factory=list)
    style_labels: List[Dict[str, str]] = field(default_factory=list)
    confidence: float = 0.0
    matches_analyzed: int = 0

    @property
    def identity_vector(self) -> List[float]:
        """6-dimensional tactical identity vector."""
        return [
            self.pressing_intensity,
            self.buildup_style,
            self.transition_preference,
            self.width_usage,
            self.possession_tempo,
            self.defensive_structure,
        ]

    def to_dict(self) -> dict:
        return {
            "club_id": self.club_id,
            "name_ar": self.name_ar,
            "name_en": self.name_en,
            "dimensions": {
                "pressing_intensity": round(self.pressing_intensity, 3),
                "buildup_style": round(self.buildup_style, 3),
                "transition_preference": round(self.transition_preference, 3),
                "width_usage": round(self.width_usage, 3),
                "possession_tempo": round(self.possession_tempo, 3),
                "defensive_structure": round(self.defensive_structure, 3),
            },
            "primary_roles": self.primary_roles,
            "tactical_concepts": self.tactical_concepts,
            "style_labels": self.style_labels,
            "confidence": round(self.confidence, 3),
            "matches_analyzed": self.matches_analyzed,
        }


# ── Predefined Saudi Club Profiles ──────────────
SAUDI_CLUB_PROFILES = {
    "alhilal": {
        "name_ar": "الهلال", "name_en": "Al Hilal",
        "pressing_intensity": 0.7, "buildup_style": 0.8,
        "transition_preference": 0.5, "width_usage": 0.6,
        "possession_tempo": 0.7, "defensive_structure": 0.6,
        "primary_roles": ["deep_lying_playmaker", "inverted_fullback", "wide_creator"],
        "tactical_concepts": ["high_press", "overload", "possession"],
    },
    "alnassr": {
        "name_ar": "النصر", "name_en": "Al Nassr",
        "pressing_intensity": 0.6, "buildup_style": 0.6,
        "transition_preference": 0.7, "width_usage": 0.5,
        "possession_tempo": 0.6, "defensive_structure": 0.5,
        "primary_roles": ["pressing_forward", "transition_winger", "box_crasher"],
        "tactical_concepts": ["transition", "counter_attack"],
    },
    "alittihad": {
        "name_ar": "الاتحاد", "name_en": "Al Ittihad",
        "pressing_intensity": 0.8, "buildup_style": 0.5,
        "transition_preference": 0.6, "width_usage": 0.7,
        "possession_tempo": 0.8, "defensive_structure": 0.7,
        "primary_roles": ["pressing_forward", "inverted_fullback", "holding_midfielder"],
        "tactical_concepts": ["high_press", "compactness", "transition"],
    },
    "alahli": {
        "name_ar": "الأهلي", "name_en": "Al Ahli",
        "pressing_intensity": 0.5, "buildup_style": 0.7,
        "transition_preference": 0.6, "width_usage": 0.8,
        "possession_tempo": 0.5, "defensive_structure": 0.6,
        "primary_roles": ["wide_creator", "deep_lying_playmaker", "progressive_centerback"],
        "tactical_concepts": ["positional_rotation", "overload"],
    },
    "alshabab": {
        "name_ar": "الشباب", "name_en": "Al Shabab",
        "pressing_intensity": 0.6, "buildup_style": 0.6,
        "transition_preference": 0.5, "width_usage": 0.6,
        "possession_tempo": 0.6, "defensive_structure": 0.5,
        "primary_roles": ["box_crasher", "transition_winger", "holding_midfielder"],
        "tactical_concepts": ["transition", "half_space_occupation"],
    },
}


class ClubIdentityEngine:
    """
    Understand tactical identity of clubs.
    Used for contextual recruitment recommendations.
    """

    def __init__(self, ontology: FootballOntology = None):
        self.ontology = ontology or FootballOntology()
        self._profiles: Dict[str, ClubIdentityProfile] = {}
        self._init_saudi_profiles()

    def _init_saudi_profiles(self):
        """Initialize predefined Saudi club profiles."""
        for club_id, data in SAUDI_CLUB_PROFILES.items():
            profile = ClubIdentityProfile(
                club_id=club_id,
                name_ar=data["name_ar"],
                name_en=data["name_en"],
                pressing_intensity=data["pressing_intensity"],
                buildup_style=data["buildup_style"],
                transition_preference=data["transition_preference"],
                width_usage=data["width_usage"],
                possession_tempo=data["possession_tempo"],
                defensive_structure=data["defensive_structure"],
                primary_roles=data.get("primary_roles", []),
                tactical_concepts=data.get("tactical_concepts", []),
            )
            profile.style_labels = self._generate_labels(profile)
            profile.confidence = 0.8  # Predefined profiles
            self._profiles[club_id] = profile

    def _generate_labels(self, profile: ClubIdentityProfile) -> List[Dict[str, str]]:
        """Generate Arabic/English style labels from dimensions."""
        labels = []
        if profile.pressing_intensity > 0.6:
            labels.append({"ar": "ضغط عالي", "en": "High Press"})
        elif profile.pressing_intensity < 0.4:
            labels.append({"ar": "كتلة منخفضة", "en": "Low Block"})

        if profile.buildup_style > 0.6:
            labels.append({"ar": "بناء استحواذي", "en": "Possession Buildup"})
        elif profile.buildup_style < 0.4:
            labels.append({"ar": "بناء مباشر", "en": "Direct Buildup"})

        if profile.transition_preference > 0.6:
            labels.append({"ar": "تحولات سريعة", "en": "Transition-Focused"})

        if profile.width_usage > 0.6:
            labels.append({"ar": "لعب عرضي", "en": "Wide Play"})
        elif profile.width_usage < 0.4:
            labels.append({"ar": "لعب مركزي", "en": "Central Play"})

        if profile.possession_tempo > 0.6:
            labels.append({"ar": "إيقاع سريع", "en": "High Tempo"})
        elif profile.possession_tempo < 0.4:
            labels.append({"ar": "إيقاع مهلك", "en": "Deliberate Tempo"})

        return labels

    def get_profile(self, club_id: str) -> Optional[ClubIdentityProfile]:
        return self._profiles.get(club_id)

    def get_all_profiles(self) -> Dict[str, ClubIdentityProfile]:
        return self._profiles

    def create_profile(self, club_id: str, **kwargs) -> ClubIdentityProfile:
        """Create or update a club identity profile."""
        profile = self._profiles.get(club_id, ClubIdentityProfile(club_id=club_id))
        for k, v in kwargs.items():
            if hasattr(profile, k):
                setattr(profile, k, v)
        profile.style_labels = self._generate_labels(profile)
        self._profiles[club_id] = profile
        return profile

    def compute_system_fit(self, player_traits: Dict[str, float], club_id: str) -> Dict[str, object]:
        """
        Compute how well a player's traits fit a club's tactical identity.

        Returns fit score with explanations.
        """
        club = self._profiles.get(club_id)
        if not club:
            return {"fit": 0.0, "explanations": ["لم يتم العثور على هوية النادي"]}

        # Map player DNA traits to club dimensions
        trait_to_dimension = {
            "press_aggression": "pressing_intensity",
            "carry_vs_pass": "buildup_style",       # carry→direct, pass→possession
            "transition_focus": "transition_preference",
            "positional_stability": "defensive_structure",
            "tempo_control": "possession_tempo",
        }

        total_diff = 0.0
        matched = 0
        explanations = []

        for trait, dimension in trait_to_dimension.items():
            player_val = player_traits.get(trait)
            club_val = getattr(club, dimension, None)
            if player_val is not None and club_val is not None:
                # Normalize to 0-1 for comparison
                p_norm = (player_val + 1) / 2 if -1 <= player_val <= 1 else player_val
                diff = abs(p_norm - club_val)
                total_diff += diff
                matched += 1

                # Build explanation
                if diff < 0.2:
                    explanations.append(f"✅ {trait}: يتناسب مع أسلوب النادي")
                elif diff > 0.5:
                    explanations.append(f"⚠️ {trait}: قد لا يتناسب مع أسلوب النادي (فرق {diff:.0%})")

        fit_score = max(0.0, 1.0 - total_diff / max(1, matched)) if matched > 0 else 0.5

        return {
            "club_id": club_id,
            "club_name_ar": club.name_ar,
            "fit": round(fit_score, 3),
            "matched_dimensions": matched,
            "explanations": explanations,
            "style_labels": [l.get("ar", "") for l in club.style_labels],
        }
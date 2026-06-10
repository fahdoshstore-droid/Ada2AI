"""
Similarity Engine — Stylistic player similarity with explanation

Finds players who are stylistically similar based on:
  - Movement patterns
  - Tactical role behavior
  - Event patterns
  - Spatial occupation
  - Tempo
  - Pressure behavior

NOT just raw statistics — structural similarity.
"""

import math
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field

from intelligence.dna import PlayerDNAProfile, DNA_TRAITS


@dataclass
class SimilarityResult:
    """A single similarity comparison result."""
    source_id: int
    target_id: int
    similarity: float                   # 0-1
    trait_comparisons: Dict[str, Tuple[float, float, float]] = field(default_factory=dict)
    # trait → (source_val, target_val, trait_similarity)
    explanations: List[str] = field(default_factory=list)
    shared_labels: List[Dict[str, str]] = field(default_factory=list)

    def to_dict(self, lang: str = "ar") -> dict:
        key = "ar" if lang == "ar" else "en"
        shared = [l.get(key, "") for l in self.shared_labels if l.get(key)]
        return {
            "player_id": self.target_id,
            "similarity": round(self.similarity, 3),
            "explanations": self.explanations,
            "shared_labels": shared,
            "trait_diffs": {
                t: {
                    "source": round(sv, 3),
                    "target": round(tv, 3),
                    "match": round(sim, 3),
                }
                for t, (sv, tv, sim) in self.trait_comparisons.items()
            },
        }


class SimilarityEngine:
    """
    Find stylistically similar players using DNA profile vectors.

    Similarity is cosine + trait-level comparison with explanation.
    """

    # Trait weights for similarity (more important traits get higher weight)
    TRAIT_IMPORTANCE = {
        "press_aggression": 1.2,
        "carry_vs_pass": 1.3,
        "risk_appetite": 1.0,
        "transition_focus": 1.4,
        "positional_stability": 0.9,
        "tempo_control": 0.8,
        "half_space_tendency": 1.1,
        "box_presence": 1.0,
    }

    def compare(self, source: PlayerDNAProfile, target: PlayerDNAProfile) -> SimilarityResult:
        """
        Compare two player DNA profiles.

        Returns similarity score with trait-level explanation.
        """
        # Weighted cosine similarity
        source_vec = []
        target_vec = []
        weights = []
        trait_comparisons = {}
        explanations = []

        for trait_name in DNA_TRAITS:
            sv = source.traits.get(trait_name, 0.0)
            tv = target.traits.get(trait_name, 0.0)
            w = self.TRAIT_IMPORTANCE.get(trait_name, 1.0)

            source_vec.append(sv * w)
            target_vec.append(tv * w)
            weights.append(w)

            # Trait-level similarity (1 - normalized diff)
            diff = abs(sv - tv)
            trait_sim = 1.0 - diff / 2.0  # Normalize to 0-1
            trait_comparisons[trait_name] = (sv, tv, trait_sim)

            # Generate explanation for significant matches/mismatches
            trait_info = DNA_TRAITS[trait_name]
            if diff < 0.2:
                explanations.append(f"✅ {trait_info['ar']}: متشابه ({sv:.1f} ≈ {tv:.1f})")
            elif diff > 0.6:
                explanations.append(f"❌ {trait_info['ar']}: مختلف ({sv:.1f} vs {tv:.1f})")

        # Compute weighted cosine similarity
        dot = sum(a * b for a, b in zip(source_vec, target_vec))
        norm_a = math.sqrt(sum(a**2 for a in source_vec))
        norm_b = math.sqrt(sum(b**2 for b in target_vec))

        if norm_a == 0 or norm_b == 0:
            similarity = 0.0
        else:
            similarity = max(0.0, dot / (norm_a * norm_b))
            # Shift from [-1,1] cosine to [0,1] similarity
            similarity = (similarity + 1) / 2

        # Find shared labels
        shared = []
        for l1 in source.labels:
            for l2 in target.labels:
                if l1.get("en") == l2.get("en"):
                    shared.append(l1)
                    break

        # Additional explanations from shared labels
        for label in shared:
            explanations.append(f"🔗 مشترك: {label['ar']}")

        return SimilarityResult(
            source_id=source.track_id,
            target_id=target.track_id,
            similarity=similarity,
            trait_comparisons=trait_comparisons,
            explanations=explanations,
            shared_labels=shared,
        )

    def find_similar(
        self,
        source: PlayerDNAProfile,
        candidates: List[PlayerDNAProfile],
        top_n: int = 5,
        min_similarity: float = 0.3,
    ) -> List[SimilarityResult]:
        """
        Find top-N most similar players from candidates.

        Args:
            source: Query player profile
            candidates: Pool of candidate profiles
            top_n: Number of results
            min_similarity: Minimum similarity threshold

        Returns:
            Sorted list of SimilarityResult
        """
        results = []
        for candidate in candidates:
            if candidate.track_id == source.track_id:
                continue
            result = self.compare(source, candidate)
            if result.similarity >= min_similarity:
                results.append(result)

        results.sort(key=lambda r: r.similarity, reverse=True)
        return results[:top_n]

    def explain_similarity(self, result: SimilarityResult, lang: str = "ar") -> str:
        """
        Generate natural language explanation of why two players are similar.

        Args:
            result: SimilarityResult from compare()
            lang: "ar" or "en"

        Returns:
            Explanation string
        """
        if lang == "ar":
            lines = [f"اللاعب #{result.source_id} يشبه اللاعب #{result.target_id} (تشابه: {result.similarity:.0%})"]
            lines.append("")
            for exp in result.explanations:
                lines.append(f"• {exp}")
            if result.shared_labels:
                labels = ", ".join(l.get("ar", "") for l in result.shared_labels)
                lines.append(f"")
                lines.append(f"صفات مشتركة: {labels}")
            return "\n".join(lines)
        else:
            lines = [f"Player #{result.source_id} resembles Player #{result.target_id} (similarity: {result.similarity:.0%})"]
            for exp in result.explanations:
                lines.append(f"• {exp}")
            return "\n".join(lines)
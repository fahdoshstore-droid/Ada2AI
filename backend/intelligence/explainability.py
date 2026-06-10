"""
Confidence + Explainability Layer

Every intelligence output must expose:
  evidence, confidence, supporting events, tactical reasoning, temporal references

NO black-box outputs. Every recommendation, role fit, similarity, timeline phase
must carry its reasoning.
"""

import math
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field


@dataclass
class Evidence:
    """Single piece of supporting evidence."""
    description_ar: str      # Arabic description
    description_en: str = ""  # English description
    event_type: str = ""      # Source event type
    match_id: str = ""        # Source match
    frame: int = 0            # Source frame
    value: float = 0.0        # Measured value
    weight: float = 1.0       # How much this evidence contributes

    def to_dict(self) -> dict:
        return {
            "description_ar": self.description_ar,
            "event_type": self.event_type,
            "match_id": self.match_id,
            "value": round(self.value, 3),
            "weight": round(self.weight, 3),
        }


@dataclass
class ExplainableOutput:
    """
    Universal wrapper for any intelligence output.

    Every output from Ada2AI must carry:
      - what was concluded
      - how confident
      - why (evidence)
      - tactical reasoning
      - temporal references
    """
    output_type: str           # "role_fit" | "recommendation" | "similarity" | "timeline_phase" | "dna" | "club_fit"
    conclusion_ar: str         # Arabic conclusion
    conclusion_en: str = ""    # English conclusion
    confidence: float = 0.0    # 0-1
    evidence: List[Evidence] = field(default_factory=list)
    tactical_reasoning_ar: str = ""  # Why this makes tactical sense
    tactical_reasoning_en: str = ""
    temporal_references: List[Dict] = field(default_factory=list)  # [{match_id, minute, context}]
    player_id: Optional[int] = None
    club_id: Optional[str] = None
    metadata: Dict = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)

    @property
    def is_reliable(self) -> bool:
        """Output is reliable enough for decision-making."""
        return self.confidence >= 0.6 and len(self.evidence) >= 2

    @property
    def evidence_strength(self) -> float:
        """Aggregate evidence strength weighted by confidence."""
        if not self.evidence:
            return 0.0
        total_weight = sum(e.weight for e in self.evidence)
        if total_weight == 0:
            return 0.0
        return sum(e.value * e.weight for e in self.evidence) / total_weight

    def to_dict(self) -> dict:
        return {
            "output_type": self.output_type,
            "conclusion_ar": self.conclusion_ar,
            "confidence": round(self.confidence, 3),
            "is_reliable": self.is_reliable,
            "evidence_strength": round(self.evidence_strength, 3),
            "evidence": [e.to_dict() for e in self.evidence],
            "tactical_reasoning_ar": self.tactical_reasoning_ar,
            "temporal_references": self.temporal_references,
            "player_id": self.player_id,
            "club_id": self.club_id,
            "metadata": self.metadata,
        }


class ExplainabilityEngine:
    """
    Wraps any intelligence output with explainability.

    Usage:
        explain = ExplainabilityEngine()
        output = explain.explain_role_fit(player_id=7, role="transition_winger", fit_score=0.82, ...)
    """

    # Minimum evidence count for reliability
    MIN_EVIDENCE = 2
    MIN_CONFIDENCE = 0.6

    def explain_role_fit(self, player_id: int, role: str, role_ar: str,
                         fit_score: float, event_counts: Dict[str, int],
                         match_id: str = "") -> ExplainableOutput:
        """Create explainable role fit output."""
        evidence_list = []
        for event_type, count in sorted(event_counts.items(), key=lambda x: -x[1])[:5]:
            ev = Evidence(
                description_ar=f"{count} حدث {event_type}",
                event_type=event_type,
                match_id=match_id,
                value=float(count),
                weight=min(1.0, count / 10),
            )
            evidence_list.append(ev)

        reasoning = f"اللاعب يمتلك {len(event_counts)} أنواع أحداث متوافقة مع دور {role_ar}"
        if fit_score >= 0.7:
            reasoning += " — تقييم عالي يدعم هذا الدور"
        elif fit_score >= 0.4:
            reasoning += " — تقييم متوسط يشير لإمكانية مع تطوير"

        return ExplainableOutput(
            output_type="role_fit",
            conclusion_ar=f"ملاءمة اللاعب {player_id} لدور {role_ar}: {fit_score:.0%}",
            confidence=fit_score,
            evidence=evidence_list,
            tactical_reasoning_ar=reasoning,
            player_id=player_id,
            metadata={"role": role, "fit_score": fit_score},
        )

    def explain_recommendation(self, player_id: int, club_id: str,
                                club_name_ar: str, fit_score: float,
                                trait_matches: List[Dict],
                                role_match: str = "") -> ExplainableOutput:
        """Create explainable recommendation output."""
        evidence_list = []
        for tm in trait_matches[:5]:
            ev = Evidence(
                description_ar=tm.get("ar", ""),
                event_type=tm.get("trait", ""),
                value=tm.get("match", 0.0),
                weight=tm.get("importance", 1.0),
            )
            evidence_list.append(ev)

        reasoning = f"اللاعب {player_id} يناسب أسلوب {club_name_ar}"
        if role_match:
            reasoning += f" في دور {role_match}"
        reasoning += f" بملاءمة {fit_score:.0%}"

        return ExplainableOutput(
            output_type="recommendation",
            conclusion_ar=f"توصية: {player_id} ← {club_name_ar} ({fit_score:.0%})",
            confidence=fit_score,
            evidence=evidence_list,
            tactical_reasoning_ar=reasoning,
            player_id=player_id,
            club_id=club_id,
            metadata={"fit_score": fit_score, "role_match": role_match},
        )

    def explain_similarity(self, player_a: int, player_b: int,
                            similarity: float, trait_similarities: Dict[str, float],
                            shared_patterns: List[str] = None) -> ExplainableOutput:
        """Create explainable similarity output."""
        evidence_list = []
        for trait, sim in sorted(trait_similarities.items(), key=lambda x: -x[1])[:5]:
            ev = Evidence(
                description_ar=f"تشابه {trait}: {sim:.0%}",
                value=sim,
                weight=1.0,
            )
            evidence_list.append(ev)

        if shared_patterns:
            for pattern in shared_patterns[:3]:
                evidence_list.append(Evidence(
                    description_ar=f"نمط مشترك: {pattern}",
                    value=1.0,
                    weight=0.8,
                ))

        reasoning = f"اللاعبان {player_a} و {player_b} متشابهان أسلوبياً بنسبة {similarity:.0%}"

        return ExplainableOutput(
            output_type="similarity",
            conclusion_ar=f"تشابه أسلوبي: {player_a} ↔ {player_b} = {similarity:.0%}",
            confidence=similarity,
            evidence=evidence_list,
            tactical_reasoning_ar=reasoning,
            metadata={"similarity": similarity},
        )

    def explain_timeline_phase(self, phase_type: str, phase_ar: str,
                                start_minute: float, end_minute: float,
                                intensity: float, phase_evidence: List[str],
                                team: int = None) -> ExplainableOutput:
        """Create explainable timeline phase output."""
        evidence_list = [
            Evidence(description_ar=e, value=1.0, weight=1.0)
            for e in phase_evidence
        ]

        reasoning = f"مرحلة {phase_ar} من الدقيقة {start_minute:.0f} إلى {end_minute:.0f}"
        if team is not None:
            reasoning += f" — بقيادة الفريق {team}"

        return ExplainableOutput(
            output_type="timeline_phase",
            conclusion_ar=f"{phase_ar}: د{start_minute:.0f}-{end_minute:.0f} (شدة {intensity:.0%})",
            confidence=min(1.0, intensity + 0.2),
            evidence=evidence_list,
            tactical_reasoning_ar=reasoning,
            metadata={"phase_type": phase_type, "intensity": intensity},
        )

    def explain_temporal_evolution(self, player_id: int, dimension: str,
                                    trend: str, rate: float,
                                    key_matches: List[Dict]) -> ExplainableOutput:
        """Create explainable temporal evolution output."""
        trend_ar = {
            "improving": "تحسّن", "declining": "تراجع",
            "stable": "استقرار", "volatile": "تذبذب",
        }.get(trend, trend)

        evidence_list = [
            Evidence(
                description_ar=f"مباراة {m.get('match_id', '')}: {m.get('value', 0):.2f}",
                value=m.get("value", 0.0),
                match_id=m.get("match_id", ""),
            )
            for m in key_matches[-5:]
        ]

        reasoning = f"البُعد {dimension} للاعب {player_id}: اتجاه {trend_ar}"
        if abs(rate) > 0.02:
            reasoning += f" (معدل التغيّر: {rate:+.3f}/مباراة)"

        return ExplainableOutput(
            output_type="temporal_evolution",
            conclusion_ar=f"تطوّر {dimension}: {trend_ar}",
            confidence=min(1.0, len(key_matches) / 10),
            evidence=evidence_list,
            tactical_reasoning_ar=reasoning,
            player_id=player_id,
            metadata={"dimension": dimension, "trend": trend, "rate": rate},
        )

    def explain_club_fit(self, player_id: int, club_id: str, club_name_ar: str,
                          fit_score: float, dimension_diffs: Dict[str, float],
                          style_labels: List[str]) -> ExplainableOutput:
        """Create explainable club-system fit output."""
        evidence_list = []
        for dim, diff in sorted(dimension_diffs.items(), key=lambda x: x[1])[:5]:
            ev = Evidence(
                description_ar=f"{dim}: فرق {diff:.0%}",
                value=1.0 - diff,
                weight=1.0,
            )
            evidence_list.append(ev)

        reasoning = f"ملاءمة اللاعب {player_id} لأسلوب {club_name_ar}: {fit_score:.0%}"
        if style_labels:
            reasoning += f" — أسلوب النادي: {', '.join(style_labels)}"

        return ExplainableOutput(
            output_type="club_fit",
            conclusion_ar=f"ملاءمة نظام {club_name_ar}: {fit_score:.0%}",
            confidence=fit_score,
            evidence=evidence_list,
            tactical_reasoning_ar=reasoning,
            player_id=player_id,
            club_id=club_id,
            metadata={"fit_score": fit_score, "style_labels": style_labels},
        )
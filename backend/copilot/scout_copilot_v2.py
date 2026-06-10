"""
Scout Copilot V2 — Arabic football reasoning with temporal + confidence

Answers:
  لماذا هذا اللاعب مناسب؟
  كيف تطور خلال آخر 10 مباريات؟
  ما نقاط ضعفه التكتيكية؟
  هل يناسب لعب التحولات؟
  كيف يتعامل مع الضغط؟
  من يشبهه أسلوبيًا؟
  هل مستواه مستقر؟

Responses reference: events, timeline, tactical semantics, evolution, confidence
NOT generic AI responses.
"""

import re
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field

from intelligence.ontology import FootballOntology
from intelligence.roles import RoleProfileEngine
from intelligence.dna import PlayerDNAEngine
from intelligence.similarity import SimilarityEngine
from intelligence.recommendation import ScoutRecommendationEngine
from intelligence.temporal import TemporalProfileEngine
from intelligence.timeline import MatchTimelineEngine
from intelligence.club_identity import ClubIdentityEngine
from intelligence.memory import IntelligenceMemory
from intelligence.explainability import ExplainabilityEngine, ExplainableOutput


# ── Arabic Intent Detection ──────────────────────

INTENT_PATTERNS = {
    "fit_transitions": [
        r"يناسب (لعب |أسلوب )?التحولات",
        r"لاعب تحولات",
        r"مرتدات",
        r"هل يناسب.*تحول",
    ],
    "club_fit": [
        r"يناسب (الهلال|النصر|الاتحاد|الأهلي|الشباب)",
        r"ملاءمة (نادي|نظام)",
        r"أسلوب (الهلال|النصر)",
    ],
    "why_fit": [
        r"لم[ا]?ذا? .*(مناسب|يصلح|يليق)",
        r"هل (يناسب|يصلح|يليق)",
        r"ليش .*(مناسب|يصلح|يليق)",
        r"لماذا (مناسب|يصلح)",
        r"ليش يناسب",
    ],
    "evolution": [
        r"كيف تطور",
        r"تطور (اللاعب|مستواه|أداءه)",
        r"آخر \d+ مباريات",
        r"مسيرة اللاعب",
    ],
    "weaknesses": [
        r"نقاط? (ضعف|ضعفه)",
        r"ضعف[هـ]? التكتيكي",
        r"مشاكل[هـ]?",
        r"نواقص",
    ],
    "pressure_handling": [
        r"يتعامل مع الضغط",
        r"تحت الضغط",
        r"ضغط (عالي|منخفض)",
        r"كيف يضغط",
    ],
    "similarity": [
        r"من يشبهه",
        r"يشبه (أسلوبيا|لعيبه)",
        r"لاعب مشابه",
        r"تشابه",
    ],
    "form_stability": [
        r"مستواه مستقر",
        r"استقرار",
        r"ثبات الأداء",
        r"هل مستوى",
    ],
    "role_search": [
        r"أفضل (جناح|مهاجم|لاعب وسط|مدافع|حارس)",
        r"دور (جناح|مهاجم|صانع)",
        r"أبغى|أبي|أريد|ابحث عن",
    ],
    "recommendation": [
        r"توصي[ةة]",
        r"اقتراح",
        r"من تنصح",
        r"أفضل لاعب (لـ|لل)",
    ],
}


@dataclass
class CopilotV2Response:
    """Rich copilot response with evidence and confidence."""
    answer_ar: str
    confidence: float = 0.0
    evidence: List[str] = field(default_factory=list)
    temporal_refs: List[Dict] = field(default_factory=list)
    related_players: List[int] = field(default_factory=list)
    related_clubs: List[str] = field(default_factory=list)
    query_type: str = ""

    def to_dict(self) -> dict:
        return {
            "answer_ar": self.answer_ar,
            "confidence": round(self.confidence, 3),
            "evidence_count": len(self.evidence),
            "evidence": self.evidence[:5],
            "temporal_refs": self.temporal_refs[:3],
            "related_players": self.related_players[:5],
            "related_clubs": self.related_clubs[:3],
            "query_type": self.query_type,
        }


class ScoutCopilotV2:
    """
    Arabic-first football reasoning copilot.

    V2 enhancements:
      - Temporal intelligence (evolution, fatigue, form)
      - Confidence + explainability on every output
      - Club identity integration
      - Intelligence memory for context
      - Timeline-aware reasoning
    """

    def __init__(self):
        self.ontology = FootballOntology()
        self.role_engine = RoleProfileEngine(self.ontology)
        self.dna_engine = PlayerDNAEngine()
        self.similarity_engine = SimilarityEngine()
        self.recommendation_engine = ScoutRecommendationEngine()
        self.temporal_engine = TemporalProfileEngine()
        self.timeline_engine = MatchTimelineEngine()
        self.club_engine = ClubIdentityEngine(self.ontology)
        self.memory = IntelligenceMemory()
        self.explainability = ExplainabilityEngine()
        # Player data stores (populated via set_player_data or memory)
        self._player_signatures: Dict[int, dict] = {}
        self._player_dnas: Dict[int, dict] = {}
        self._player_role_fits: Dict[int, Dict[str, float]] = {}

    def set_player_data(self, player_id: int, signature: dict = None,
                        dna: dict = None, role_fits: Dict[str, float] = None):
        """Provide player data for copilot queries."""
        if signature:
            self._player_signatures[player_id] = signature
        if dna:
            self._player_dnas[player_id] = dna
        if role_fits:
            self._player_role_fits[player_id] = role_fits

    def query(self, text: str, player_id: int = None, club_id: str = None) -> CopilotV2Response:
        """
        Process Arabic scout query.

        Returns response with evidence, confidence, and temporal references.
        """
        intent = self._detect_intent(text)
        responder = {
            "why_fit": self._answer_why_fit,
            "evolution": self._answer_evolution,
            "weaknesses": self._answer_weaknesses,
            "fit_transitions": self._answer_fit_transitions,
            "pressure_handling": self._answer_pressure,
            "similarity": self._answer_similarity,
            "form_stability": self._answer_form_stability,
            "role_search": self._answer_role_search,
            "recommendation": self._answer_recommendation,
            "club_fit": self._answer_club_fit,
        }.get(intent, self._answer_general)

        return responder(text, player_id=player_id, club_id=club_id)

    def _detect_intent(self, text: str) -> str:
        """Detect query intent from Arabic text."""
        for intent, patterns in INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text):
                    return intent
        return "general"

    def _answer_why_fit(self, text: str, player_id: int = None, club_id: str = None, **_) -> CopilotV2Response:
        """لماذا هذا اللاعب مناسب؟"""
        if player_id is None:
            return CopilotV2Response(answer_ar="حدّد رقم اللاعب للتحليل", confidence=0.0, query_type="why_fit")

        role_fits = self._player_role_fits.get(player_id, {})
        if not role_fits:
            return CopilotV2Response(answer_ar=f"لا توجد بيانات أدوار للاعب {player_id}", confidence=0.0, query_type="why_fit")

        best_role = max(role_fits, key=role_fits.get) if role_fits else ""
        best_score = role_fits.get(best_role, 0)
        role_ar = self._get_role_name_ar(best_role)
        dna = self._player_dnas.get(player_id, {})
        traits = dna.get("traits", {})
        labels = dna.get("labels", [])

        evidence = []
        if traits:
            top_trait = max(traits, key=traits.get) if traits else ""
            evidence.append(f"أبرز صفة: {top_trait} = {traits.get(top_trait, 0):.2f}")
        if labels:
            for label_data in labels[:2]:
                label_ar = label_data.get("ar", "") if isinstance(label_data, dict) else str(label_data)
                if label_ar:
                    evidence.append(f"تصنيف: {label_ar}")

        # Temporal check
        temporal = self.temporal_engine.get_profile(player_id)
        temporal_refs = []
        if temporal:
            temporal_refs.append({"form_trend": temporal.form_trend})
            if temporal.form_trend == "improving":
                evidence.append("المستوى في تحسّن مستمر")
            elif temporal.form_trend == "declining":
                evidence.append("⚠️ المستوى في تراجع")

        # Club fit if specified
        club_info = ""
        if club_id:
            club_fit = self.club_engine.compute_system_fit(traits, club_id)
            club_name = club_fit.get("club_name_ar", club_id)
            club_info = f" — ملاءمة {club_name}: {club_fit.get('fit', 0):.0%}"
            for exp in club_fit.get("explanations", [])[:2]:
                evidence.append(exp)

        answer = f"اللاعب {player_id} يناسب دور {role_ar} بنتيجة {best_score:.0%}{club_info}"

        return CopilotV2Response(
            answer_ar=answer,
            confidence=best_score,
            evidence=evidence,
            temporal_refs=temporal_refs,
            related_players=[player_id],
            related_clubs=[club_id] if club_id else [],
            query_type="why_fit",
        )

    def _answer_evolution(self, text: str, player_id: int = None, **_) -> CopilotV2Response:
        """كيف تطور خلال آخر 10 مباريات؟"""
        if player_id is None:
            return CopilotV2Response(answer_ar="حدّد رقم اللاعب", confidence=0.0, query_type="evolution")

        temporal = self.temporal_engine.get_profile(player_id)
        if not temporal or len(temporal.snapshots) < 2:
            return CopilotV2Response(
                answer_ar=f"لا توجد بيانات كافية لتتبع تطوّر اللاعب {player_id} — يحتاج مباراتين على الأقل",
                confidence=0.0, query_type="evolution",
            )

        evidence = []
        temporal_refs = []
        for dim, traj in temporal.trajectories.items():
            trend_ar = {"improving": "تحسّن", "declining": "تراجع", "stable": "استقرار", "volatile": "تذبذب"}.get(traj.trend, traj.trend)
            if traj.trend != "stable":
                evidence.append(f"{dim}: {trend_ar} (معدل: {traj.rate_of_change:+.3f})")
                temporal_refs.append({"dimension": dim, "trend": traj.trend, "rate": traj.rate_of_change})

        answer = f"تطوّر اللاعب {player_id}: {temporal.form_trend_ar if hasattr(temporal, 'form_trend_ar') else temporal.form_trend}"
        answer += f" — {len(temporal.snapshots)} نقطة زمنية مسجّلة"
        if temporal.fatigue_pattern != "normal":
            answer += f" — نمط الإرهاق: {temporal.fatigue_pattern}"

        return CopilotV2Response(
            answer_ar=answer,
            confidence=min(1.0, len(temporal.snapshots) / 10),
            evidence=evidence,
            temporal_refs=temporal_refs,
            related_players=[player_id],
            query_type="evolution",
        )

    def _answer_weaknesses(self, text: str, player_id: int = None, **_) -> CopilotV2Response:
        """ما نقاط ضعفه التكتيكية؟"""
        if player_id is None:
            return CopilotV2Response(answer_ar="حدّد رقم اللاعب", confidence=0.0, query_type="weaknesses")

        dna = self._player_dnas.get(player_id, {})
        traits = dna.get("traits", {})
        if not traits:
            return CopilotV2Response(answer_ar=f"لا بيانات DNA للاعب {player_id}", confidence=0.0, query_type="weaknesses")

        # Find weak dimensions (low trait values)
        weak_dims = sorted(traits.items(), key=lambda x: x[1])[:3]
        evidence = [f"{dim}: {val:.2f}" for dim, val in weak_dims]

        weak_names = []
        for dim, val in weak_dims:
            if val < -0.3:
                weak_names.append(f"{dim} ضعيف جداً")
            elif val < 0.0:
                weak_names.append(f"{dim} تحت المتوسط")

        answer = f"نقاط ضعف اللاعب {player_id}: {', '.join(weak_names) if weak_names else 'لا نقاط ضعف واضحة'}"

        # Check temporal — declining dimensions
        temporal = self.temporal_engine.get_profile(player_id)
        if temporal:
            for dim, traj in temporal.trajectories.items():
                if traj.trend == "declining":
                    evidence.append(f"⚠️ {dim} في تراجع")

        return CopilotV2Response(
            answer_ar=answer,
            confidence=0.7,
            evidence=evidence,
            related_players=[player_id],
            query_type="weaknesses",
        )

    def _answer_fit_transitions(self, text: str, player_id: int = None, **_) -> CopilotV2Response:
        """هل يناسب لعب التحولات؟"""
        if player_id is None:
            return CopilotV2Response(answer_ar="حدّد رقم اللاعب", confidence=0.0, query_type="fit_transitions")

        dna = self._player_dnas.get(player_id, {})
        traits = dna.get("traits", {})
        transition_val = traits.get("transition_focus", 0)
        sprint_val = traits.get("carry_progression", 0)
        speed_val = traits.get("pressing_intensity", 0) if "pressing_intensity" in traits else 0

        transition_score = (transition_val * 0.5 + sprint_val * 0.3 + speed_val * 0.2)
        evidence = [
            f"تركيز التحولات: {transition_val:.2f}",
            f"التقدم بالكرة: {sprint_val:.2f}",
        ]

        if transition_score > 0.5:
            answer = f"✅ اللاعب {player_id} يناسب لعب التحولات (ملاءمة: {transition_score:.0%})"
        elif transition_score > 0.2:
            answer = f"⚡ اللاعب {player_id} قد يناسب التحولات جزئياً (ملاءمة: {transition_score:.0%})"
        else:
            answer = f"❌ اللاعب {player_id} لا يميل للعب التحولات (ملاءمة: {transition_score:.0%})"

        return CopilotV2Response(
            answer_ar=answer,
            confidence=abs(transition_score - 0.5) * 2,  # Higher confidence at extremes
            evidence=evidence,
            related_players=[player_id],
            query_type="fit_transitions",
        )

    def _answer_pressure(self, text: str, player_id: int = None, **_) -> CopilotV2Response:
        """كيف يتعامل مع الضغط؟"""
        if player_id is None:
            return CopilotV2Response(answer_ar="حدّد رقم اللاعب", confidence=0.0, query_type="pressure_handling")

        dna = self._player_dnas.get(player_id, {})
        traits = dna.get("traits", {})
        press_val = traits.get("pressing_intensity", 0)
        stability = traits.get("positional_stability", 0)
        recovery = traits.get("creative_risk", 0)  # Risk-taking under pressure

        evidence = [
            f" شدة الضغط: {press_val:.2f}",
            f"استقرار تمركزي: {stability:.2f}",
        ]

        temporal = self.temporal_engine.get_profile(player_id)
        pressure_trend = "غير معروف"
        if temporal:
            pressure_trend = temporal.pressure_tolerance_trend
            evidence.append(f"اتجاه تحمل الضغط: {pressure_trend}")

        if press_val > 0.5:
            answer = f"🔥 اللاعب {player_id} عدواني تحت الضغط (ضغط: {press_val:.0%})"
        elif press_val > 0.2:
            answer = f"⚖️ اللاعب {player_id} متوازن تحت الضغط"
        else:
            answer = f"🛡️ اللاعب {player_id} يفضّل الاستقرار على الضغط العالي"

        return CopilotV2Response(
            answer_ar=answer,
            confidence=max(0.4, abs(press_val) + 0.3),
            evidence=evidence,
            related_players=[player_id],
            query_type="pressure_handling",
        )

    def _answer_similarity(self, text: str, player_id: int = None, **_) -> CopilotV2Response:
        """من يشبهه أسلوبياً؟"""
        if player_id is None:
            return CopilotV2Response(answer_ar="حدّد رقم اللاعب", confidence=0.0, query_type="similarity")

        dna_dict = self._player_dnas.get(player_id, {})
        if not dna_dict:
            return CopilotV2Response(answer_ar=f"لا بيانات DNA للاعب {player_id}", confidence=0.0, query_type="similarity")

        # Find similar players from available data
        similar_players = []
        for other_id, other_dna in self._player_dnas.items():
            if other_id == player_id:
                continue
            # Simple cosine similarity on DNA vectors
            vec_a = list(dna_dict.get("traits", {}).values())
            vec_b = list(other_dna.get("traits", {}).values())
            if len(vec_a) == len(vec_b) and vec_a:
                dot = sum(a * b for a, b in zip(vec_a, vec_b))
                norm_a = sum(a ** 2 for a in vec_a) ** 0.5
                norm_b = sum(b ** 2 for b in vec_b) ** 0.5
                sim = dot / (norm_a * norm_b) if norm_a and norm_b else 0
                similar_players.append((other_id, sim))

        similar_players.sort(key=lambda x: -x[1])
        top_similar = similar_players[:3]

        if not top_similar:
            return CopilotV2Response(
                answer_ar=f"لا يوجد لاعبون آخرون في النظام للمقارنة بـ {player_id}",
                confidence=0.0, query_type="similarity",
            )

        evidence = [f"لاعب {pid}: تشابه {sim:.0%}" for pid, sim in top_similar]
        answer = f"أقرب اللاعبين أسلوبياً لـ {player_id}: " + ", ".join(evidence)

        return CopilotV2Response(
            answer_ar=answer,
            confidence=top_similar[0][1] if top_similar else 0.0,
            evidence=evidence,
            related_players=[pid for pid, _ in top_similar],
            query_type="similarity",
        )

    def _answer_form_stability(self, text: str, player_id: int = None, **_) -> CopilotV2Response:
        """هل مستواه مستقر؟"""
        if player_id is None:
            return CopilotV2Response(answer_ar="حدّد رقم اللاعب", confidence=0.0, query_type="form_stability")

        temporal = self.temporal_engine.get_profile(player_id)
        if not temporal or len(temporal.snapshots) < 3:
            return CopilotV2Response(
                answer_ar=f"بيانات غير كافية لتقييم استقرار مستوى اللاعب {player_id}",
                confidence=0.0, query_type="form_stability",
            )

        evidence = [
            f"استقرار: {temporal.consistency_score:.0%}",
            f"اتجاه المستوى: {temporal.form_trend}",
        ]

        if temporal.consistency_score > 0.7:
            answer = f"✅ مستوى اللاعب {player_id} مستقر — ثبات {temporal.consistency_score:.0%}"
        elif temporal.consistency_score > 0.4:
            answer = f"⚡ مستوى اللاعب {player_id} متذبذب أحياناً — ثبات {temporal.consistency_score:.0%}"
        else:
            answer = f"⚠️ مستوى اللاعب {player_id} غير مستقر — ثبات {temporal.consistency_score:.0%}"

        if temporal.fatigue_pattern != "normal":
            evidence.append(f"نمط إرهاق: {temporal.fatigue_pattern}")

        return CopilotV2Response(
            answer_ar=answer,
            confidence=temporal.consistency_score,
            evidence=evidence,
            temporal_refs=[{"form_trend": temporal.form_trend, "consistency": temporal.consistency_score}],
            related_players=[player_id],
            query_type="form_stability",
        )

    def _answer_role_search(self, text: str, player_id: int = None, **_) -> CopilotV2Response:
        """أفضل جناح/مهاجم/صانع ألعاب"""
        # Extract role hint from Arabic text
        role_hint = ""
        if "جناح" in text:
            role_hint = "transition_winger"
        elif "مهاجم" in text or "ضغط" in text:
            role_hint = "pressing_forward"
        elif "صانع" in text:
            role_hint = "deep_lying_playmaker"
        elif "مدافع" in text:
            role_hint = "progressive_centerback"
        elif "محور" in text:
            role_hint = "holding_midfielder"

        candidates = []
        for pid, fits in self._player_role_fits.items():
            if role_hint and role_hint in fits:
                candidates.append((pid, fits[role_hint]))
            elif not role_hint:
                best = max(fits.values()) if fits else 0
                candidates.append((pid, best))

        candidates.sort(key=lambda x: -x[1])
        top = candidates[:5]

        if not top:
            role_name = self._get_role_name_ar(role_hint) if role_hint else "أي دور"
            return CopilotV2Response(
                answer_ar=f"لا توجد نتائج لـ {role_name}",
                confidence=0.0, query_type="role_search",
            )

        role_name = self._get_role_name_ar(role_hint) if role_hint else "أفضل دور"
        evidence = [f"لاعب {pid}: {score:.0%}" for pid, score in top]

        return CopilotV2Response(
            answer_ar=f"أفضل {role_name}: " + ", ".join(evidence),
            confidence=top[0][1] if top else 0.0,
            evidence=evidence,
            related_players=[pid for pid, _ in top],
            query_type="role_search",
        )

    def _answer_recommendation(self, text: str, player_id: int = None, club_id: str = None, **_) -> CopilotV2Response:
        """توصية كشافة"""
        # Try to find Saudi club name in text
        if not club_id:
            club_map = {"الهلال": "alhilal", "النصر": "alnassr", "الاتحاد": "alittihad", "الأهلي": "alahli", "الشباب": "alshabab"}
            for ar_name, cid in club_map.items():
                if ar_name in text:
                    club_id = cid
                    break

        if not club_id or not self._player_dnas:
            return CopilotV2Response(
                answer_ar="حدّد النادي واللاعبين المتاحين",
                confidence=0.0, query_type="recommendation",
            )

        recommendations = []
        for pid, dna_data in self._player_dnas.items():
            traits = dna_data.get("traits", {})
            fit = self.club_engine.compute_system_fit(traits, club_id)
            recommendations.append((pid, fit.get("fit", 0), fit))

        recommendations.sort(key=lambda x: -x[1])
        top = recommendations[:3]

        club_name = self.club_engine.get_profile(club_id).name_ar if self.club_engine.get_profile(club_id) else club_id
        evidence = [f"لاعب {pid}: ملاءمة {fit:.0%}" for pid, fit, _ in top]

        return CopilotV2Response(
            answer_ar=f"توصيات لنادي {club_name}: " + ", ".join(evidence),
            confidence=top[0][1] if top else 0.0,
            evidence=evidence,
            related_players=[pid for pid, _, _ in top[:5]],
            related_clubs=[club_id],
            query_type="recommendation",
        )

    def _answer_club_fit(self, text: str, player_id: int = None, club_id: str = None, **_) -> CopilotV2Response:
        """يناسب الهلال/النصر/..."""
        if player_id is None:
            return CopilotV2Response(answer_ar="حدّد رقم اللاعب والنادي", confidence=0.0, query_type="club_fit")

        dna = self._player_dnas.get(player_id, {})
        traits = dna.get("traits", {})

        # Find club in text if not provided
        if not club_id:
            club_map = {"الهلال": "alhilal", "النصر": "alnassr", "الاتحاد": "alittihad", "الأهلي": "alahli", "الشباب": "alshabab"}
            for ar_name, cid in club_map.items():
                if ar_name in text:
                    club_id = cid
                    break

        if not club_id:
            return CopilotV2Response(answer_ar="حدّد النادي", confidence=0.0, query_type="club_fit")

        fit = self.club_engine.compute_system_fit(traits, club_id)
        club_name = fit.get("club_name_ar", club_id)

        return CopilotV2Response(
            answer_ar=f"ملاءمة اللاعب {player_id} لنظام {club_name}: {fit.get('fit', 0):.0%}",
            confidence=fit.get("fit", 0),
            evidence=fit.get("explanations", []),
            related_players=[player_id],
            related_clubs=[club_id],
            query_type="club_fit",
        )

    def _answer_general(self, text: str, **_) -> CopilotV2Response:
        """General football query fallback."""
        return CopilotV2Response(
            answer_ar=f"استعلام: '{text}' — لم أتمكن من تصنيفه بدقة. جرب: لماذا هذا اللاعب مناسب؟ كيف تطور؟ من يشبهه أسلوبياً؟",
            confidence=0.0,
            query_type="general",
        )

    def _get_role_name_ar(self, role_id: str) -> str:
        """Get Arabic name for a role."""
        try:
            roles = self.ontology.data.get("roles", {})
            return roles.get(role_id, {}).get("name", {}).get("ar", role_id)
        except Exception:
            return role_id
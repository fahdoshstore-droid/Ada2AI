"""
AI Scout Copilot — Arabic-first natural language football intelligence

NOT generic chat — football intelligence querying.
Queries the intelligence graph and explains outputs with football context.
"""

import json
import re
from typing import Dict, List, Optional
from dataclasses import dataclass, field

from intelligence.ontology import FootballOntology
from intelligence.roles import RoleProfileEngine, PlayerEventSignature
from intelligence.dna import PlayerDNAEngine, PlayerDNAProfile
from intelligence.similarity import SimilarityEngine, SimilarityResult
from intelligence.recommendation import ScoutRecommendationEngine, ClubTacticalIdentity


@dataclass
class CopilotQuery:
    """Parsed scout copilot query."""
    raw: str
    intent: str                      # role_search | similarity_search | recommendation | analysis
    role_filter: Optional[str] = None
    age_filter: Optional[int] = None
    player_reference: Optional[str] = None
    zone_filter: Optional[str] = None
    concept_filter: Optional[str] = None


@dataclass
class CopilotResponse:
    """Structured copilot response."""
    answer_ar: str
    answer_en: str
    data: Optional[dict] = None
    citations: List[str] = field(default_factory=list)
    query_type: str = "unknown"


class ScoutCopilot:
    """
    Arabic-first natural language football intelligence.

    Example queries:
      "اعطني أفضل جناح للتحولات السريعة تحت 21 سنة"
      "من أفضل لاعب ضغط عالي في الثلث الأخير؟"
      "ابحث عن لاعب يشبه سالم الدوسري في التحرك"
    """

    # Arabic intent patterns
    PATTERNS = {
        "role_search": [
            r"أفضل\s*(\S+)\s*(?:ل|في|تحت)",
            r"اعطي\s*(?:لي\s*)?أفضل\s*(\S+)",
            r"من\s*أفضل\s*(\S+)",
            r"أبغى\s*(\S+)",
            r"ابحث\s*عن\s*(\S+)",
        ],
        "similarity_search": [
            r"يشبه\s+(\S+)\s+في",
            r"زي\s+(\S+)\s+في",
            r"مثل\s+(\S+)",
            r"قريب\s+من\s+(\S+)",
        ],
        "recommendation": [
            r"أنسب\s+لاعب\s+لـ?\s*(\S+)",
            r"أفضل\s+ت招聘\s+لـ?\s*(\S+)",
            r"اقترح\s+لاعب\s+لـ?\s*(\S+)",
        ],
        "age_filter": [
            r"تحت\s+(\d+)\s*(?:سنة|عام)",
            r"أقل\s+من\s+(\d+)",
        ],
    }

    # Arabic role name → role_id mapping
    ROLE_MAP_AR = {
        "مهاجم": "pressing_forward",
        "ضاغط": "pressing_forward",
        "ظهير": "inverted_fullback",
        "صانع": "deep_lying_playmaker",
        "محور": "holding_midfielder",
        "جناح": "transition_winger",
        "مقتحم": "box_crasher",
        "مدافع": "progressive_centerback",
        "طرفي": "wide_creator",
    }

    # Arabic concept → concept_id mapping
    CONCEPT_MAP_AR = {
        "ضغط": "high_press",
        "ضغط عالي": "high_press",
        "مرتدة": "counter_attack",
        "تحول": "transition",
        "تحولات": "transition",
        "كتلة": "low_block",
        "تكدس": "overload",
    }

    def __init__(
        self,
        ontology: FootballOntology = None,
        role_engine: RoleProfileEngine = None,
        dna_engine: PlayerDNAEngine = None,
        similarity_engine: SimilarityEngine = None,
        scout_engine: ScoutRecommendationEngine = None,
    ):
        self.ontology = ontology or FootballOntology()
        self.role_engine = role_engine or RoleProfileEngine(self.ontology)
        self.dna_engine = dna_engine or PlayerDNAEngine(self.ontology)
        self.similarity_engine = similarity_engine or SimilarityEngine()
        self.scout_engine = scout_engine or ScoutRecommendationEngine(self.ontology, self.role_engine)

    def query(
        self,
        text: str,
        player_profiles: Dict[int, tuple] = None,
        club_identity: ClubTacticalIdentity = None,
    ) -> CopilotResponse:
        """
        Process a natural language scout query (Arabic-first).

        Args:
            text: Natural language query in Arabic or English
            player_profiles: {track_id: (PlayerEventSignature, PlayerDNAProfile)}
            club_identity: Optional club context for recommendations

        Returns:
            CopilotResponse with answer, data, and citations
        """
        parsed = self._parse_query(text)

        if parsed.intent == "role_search":
            return self._handle_role_search(parsed, player_profiles)
        elif parsed.intent == "similarity_search":
            return self._handle_similarity_search(parsed, player_profiles)
        elif parsed.intent == "recommendation":
            return self._handle_recommendation(parsed, player_profiles, club_identity)
        else:
            return self._handle_general(parsed, player_profiles)

    def _parse_query(self, text: str) -> CopilotQuery:
        """Parse Arabic query into structured intent."""
        parsed = CopilotQuery(raw=text, intent="general")

        # Check role search patterns
        for intent, patterns in self.PATTERNS.items():
            if intent == "age_filter":
                continue
            for pattern in patterns:
                match = re.search(pattern, text)
                if match:
                    parsed.intent = intent
                    keyword = match.group(1) if match.lastindex else ""

                    # Resolve role from Arabic keyword
                    if intent == "role_search" and keyword in self.ROLE_MAP_AR:
                        parsed.role_filter = self.ROLE_MAP_AR[keyword]
                    elif intent == "similarity_search":
                        parsed.player_reference = keyword
                    elif intent == "recommendation" and keyword in self.ROLE_MAP_AR:
                        parsed.role_filter = self.ROLE_MAP_AR[keyword]
                    break
            if parsed.intent != "general":
                break

        # Check for concept filter
        for ar_name, concept_id in self.CONCEPT_MAP_AR.items():
            if ar_name in text:
                parsed.concept_filter = concept_id
                break

        # Check for age filter
        for pattern in self.PATTERNS["age_filter"]:
            match = re.search(pattern, text)
            if match:
                parsed.age_filter = int(match.group(1))
                break

        return parsed

    def _handle_role_search(
        self, parsed: CopilotQuery, profiles: Dict[int, tuple]
    ) -> CopilotResponse:
        """Handle: "اعطني أفضل جناح للتحولات السريعة" """
        if not profiles or not parsed.role_filter:
            return CopilotResponse(
                answer_ar="لا توجد بيانات لاعبين متاحة حالياً",
                answer_en="No player data available",
                query_type="role_search",
            )

        role_id = parsed.role_filter
        role = self.ontology.get_role(role_id)

        # Evaluate all players for this role
        results = []
        for pid, (sig, dna) in profiles.items():
            fit = self.role_engine.evaluate_for_role(sig, role_id)
            if fit and fit.fit_score > 0.3:
                results.append((pid, fit))

        results.sort(key=lambda x: x[1].fit_score, reverse=True)
        top = results[:5]

        if not top:
            return CopilotResponse(
                answer_ar=f"لم أجد لاعبين مناسبين لدور {role.name_ar if role else role_id}",
                answer_en=f"No suitable players found for role {role_id}",
                query_type="role_search",
            )

        # Build Arabic answer
        lines = [f"🏀 أفضل اللاعبين لدور **{role.name_ar if role else role_id}**:"]
        citations = []
        data_entries = []

        for pid, fit in top:
            evidence = " · ".join(fit.key_evidence[:2])
            lines.append(f"  {len(data_entries)+1}. لاعب #{pid} — ملاءمة {fit.fit_score:.0%} — {evidence}")
            citations.extend(fit.key_evidence)
            data_entries.append(fit.to_dict())

        answer = "\n".join(lines)

        return CopilotResponse(
            answer_ar=answer,
            answer_en="",  # TODO: generate English
            data={"role": role_id, "rankings": data_entries},
            citations=citations,
            query_type="role_search",
        )

    def _handle_similarity_search(
        self, parsed: CopilotQuery, profiles: Dict[int, tuple]
    ) -> CopilotResponse:
        """Handle: "ابحث عن لاعب يشبه سالم الدوسري" """
        if not profiles:
            return CopilotResponse(
                answer_ar="لا توجد بيانات كافية للمقارنة",
                answer_en="Insufficient data for comparison",
                query_type="similarity_search",
            )

        # If player_reference is numeric, use as track_id
        ref_id = None
        if parsed.player_reference and parsed.player_reference.isdigit():
            ref_id = int(parsed.player_reference)

        if ref_id is None or ref_id not in profiles:
            # Use the profile with most data as reference
            ref_id = max(profiles.keys(), key=lambda pid: profiles[pid][0].pass_count)

        ref_sig, ref_dna = profiles[ref_id]
        candidates = [(pid, dna) for pid, (_, dna) in profiles.items() if pid != ref_id]

        similar = self.similarity_engine.find_similar(
            ref_dna, [dna for _, dna in candidates], top_n=5
        )

        if not similar:
            return CopilotResponse(
                answer_ar=f"لم أجد لاعبين مشابهين للاعب #{ref_id}",
                answer_en="No similar players found",
                query_type="similarity_search",
            )

        lines = [f"🔍 لاعبون مشابهون للاعب #{ref_id}:"]
        data_entries = []
        for result in similar:
            explanation = self.similarity_engine.explain_similarity(result, lang="ar")
            lines.append(f"  • لاعب #{result.target_id} — تشابه {result.similarity:.0%}")
            data_entries.append(result.to_dict(lang="ar"))

        return CopilotResponse(
            answer_ar="\n".join(lines),
            answer_en="",
            data={"reference": ref_id, "similar": data_entries},
            query_type="similarity_search",
        )

    def _handle_recommendation(
        self, parsed: CopilotQuery, profiles: Dict[int, tuple],
        club_identity: ClubTacticalIdentity,
    ) -> CopilotResponse:
        """Handle: "أنسب لاعب للضغط العالي" """
        if not profiles or not club_identity or not parsed.role_filter:
            return CopilotResponse(
                answer_ar="حدد النادي والدور المطلوب للحصول على توصيات",
                answer_en="Specify club and role for recommendations",
                query_type="recommendation",
            )

        candidates = [(sig, dna) for _, (sig, dna) in profiles.items()]
        recs = self.scout_engine.recommend(
            club_identity, parsed.role_filter, candidates, top_n=5
        )

        if not recs:
            return CopilotResponse(
                answer_ar="لم أجد توصيات مناسبة",
                answer_en="No suitable recommendations",
                query_type="recommendation",
            )

        lines = [f"📋 توصيات تجنيد لدور **{parsed.role_filter}** في **{club_identity.club_name_ar}**:"]
        data_entries = []
        for i, rec in enumerate(recs):
            expl = " · ".join(rec.fit_explanation[:2])
            risk = "".join(f" ⚠{r}" for r in rec.risk_factors[:1])
            lines.append(f"  {i+1}. لاعب #{rec.player_id} — {rec.overall_score:.0%} — {expl}{risk}")
            data_entries.append(rec.to_dict())

        return CopilotResponse(
            answer_ar="\n".join(lines),
            answer_en="",
            data={"role": parsed.role_filter, "club": club_identity.club_id, "recommendations": data_entries},
            query_type="recommendation",
        )

    def _handle_general(
        self, parsed: CopilotQuery, profiles: Dict[int, tuple]
    ) -> CopilotResponse:
        """Handle unrecognized queries with helpful guidance."""
        ontology_summary = self.ontology.to_dict()

        available_roles = [f"• {r['ar']}" for r in ontology_summary["roles"].values()]
        available_concepts = [f"• {c['ar']}" for c in ontology_summary["concepts"].values()]

        lines = [
            "🤖 أنا مساعد الكشافة الذكي. يمكنني:",
            "",
            "• البحث عن أفضل لاعب لدور معين",
            "• إيجاد لاعبين مشابهين أسلوبياً",
            "• تقديم توصيات تجنيد سياقية",
            "",
            "الأدوار المتاحة:",
            *available_roles[:8],
            "",
            "أمثلة:",
            '• "أفضل جناح للتحولات السريعة"',
            '• "لاعب يشبه #7 في التحرك"',
            '• "أنسب محور لنظام الضغط العالي"',
        ]

        return CopilotResponse(
            answer_ar="\n".join(lines),
            answer_en="I am the Scout AI Copilot...",
            data={"ontology": ontology_summary},
            query_type="general",
        )
"""Ada2AI Intelligence package — Sports Intelligence Engines."""
from intelligence.ontology import FootballOntology
from intelligence.roles import RoleProfileEngine, PlayerEventSignature
from intelligence.dna import PlayerDNAEngine, PlayerDNAProfile
from intelligence.similarity import SimilarityEngine
from intelligence.recommendation import ScoutRecommendationEngine, ClubTacticalIdentity
from intelligence.temporal import TemporalProfileEngine, TemporalProfile
from intelligence.timeline import MatchTimelineEngine, MatchNarrative
from intelligence.club_identity import ClubIdentityEngine, ClubIdentityProfile
from intelligence.memory import IntelligenceMemory, PlayerMemory, ClubMemory
from intelligence.explainability import ExplainabilityEngine, ExplainableOutput
from intelligence.talent_graph import TalentGraphFoundation
from intelligence.bridge import IntelligenceBridge

__all__ = [
    "FootballOntology", "RoleProfileEngine", "PlayerEventSignature",
    "PlayerDNAEngine", "PlayerDNAProfile", "SimilarityEngine",
    "ScoutRecommendationEngine", "ClubTacticalIdentity",
    "TemporalProfileEngine", "TemporalProfile",
    "MatchTimelineEngine", "MatchNarrative",
    "ClubIdentityEngine", "ClubIdentityProfile",
    "IntelligenceMemory", "PlayerMemory", "ClubMemory",
    "ExplainabilityEngine", "ExplainableOutput",
    "TalentGraphFoundation",
    "IntelligenceBridge",
]
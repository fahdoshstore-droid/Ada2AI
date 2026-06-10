"""
Data Architecture — Graph-ready schemas

Prepare schemas for future Sports Intelligence Graph.
DO NOT deploy graph database yet — only structured architecture.

Node types:
  PlayerNode | MatchNode | EventNode | TacticalRoleNode | ClubIdentityNode | ScoutFeedbackNode
"""

from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class PlayerNodeSchema:
    """Graph node: Player identity + behavior profile."""
    player_id: str                  # Unique ID (track_id from vision or external ID)
    name: Optional[str] = None
    team_id: Optional[str] = None
    age: Optional[int] = None
    position: Optional[str] = None

    # ── DNA Profile ─────────────────────────────
    dna_vector: List[float] = field(default_factory=list)    # 8-dim stylistic vector
    dna_labels: List[Dict[str, str]] = field(default_factory=list)

    # ── Role Fits ─────────────────────────────
    role_fits: Dict[str, float] = field(default_factory=dict)  # role_id → fit_score
    best_role: Optional[str] = None

    # ── Match Statistics ───────────────────────
    matches_played: int = 0
    total_events: int = 0

    # ── Graph Edges ───────────────────────────
    similar_players: List[str] = field(default_factory=list)    # player_ids
    events: List[str] = field(default_factory=list)             # event_ids
    clubs: List[str] = field(default_factory=list)              # club_ids
    feedback: List[str] = field(default_factory=list)           # feedback_ids

    def to_dict(self) -> dict:
        return {
            "node_type": "PlayerNode",
            "player_id": self.player_id,
            "name": self.name,
            "team_id": self.team_id,
            "age": self.age,
            "position": self.position,
            "dna_vector": [round(v, 3) for v in self.dna_vector],
            "dna_labels": self.dna_labels,
            "role_fits": {k: round(v, 3) for k, v in self.role_fits.items()},
            "best_role": self.best_role,
            "matches_played": self.matches_played,
            "total_events": self.total_events,
            "edges": {
                "similar_players": self.similar_players,
                "events": len(self.events),
                "clubs": self.clubs,
                "feedback": len(self.feedback),
            },
        }


@dataclass
class MatchNodeSchema:
    """Graph node: Match context."""
    match_id: str
    home_team_id: str
    away_team_id: str
    date: Optional[str] = None
    competition: Optional[str] = None
    score: Optional[Dict[str, int]] = None
    duration_minutes: float = 90.0
    tactical_concepts_detected: List[str] = field(default_factory=list)
    events: List[str] = field(default_factory=list)            # event_ids
    players: List[str] = field(default_factory=list)          # player_ids

    def to_dict(self) -> dict:
        return {
            "node_type": "MatchNode",
            "match_id": self.match_id,
            "home_team": self.home_team_id,
            "away_team": self.away_team_id,
            "date": self.date,
            "competition": self.competition,
            "score": self.score,
            "tactical_concepts": self.tactical_concepts_detected,
            "edges": {
                "events": len(self.events),
                "players": len(self.players),
            },
        }


@dataclass
class EventNodeSchema:
    """Graph node: Semantic football event."""
    event_id: str
    event_type: str                 # pass | sprint | shot | pressure | transition | possession | derived types
    timestamp: float
    frame: int
    match_id: Optional[str] = None
    location: Dict[str, float] = field(default_factory=dict)  # {x, y} normalized
    actors: List[Dict] = field(default_factory=list)          # [{player_id, role}]
    confidence: float = 0.0
    metadata: Dict = field(default_factory=dict)

    # ── Edges ──────────────────────────────
    players: List[str] = field(default_factory=list)          # player_ids
    tactical_concepts: List[str] = field(default_factory=list)  # concept_ids

    def to_dict(self) -> dict:
        return {
            "node_type": "EventNode",
            "event_id": self.event_id,
            "event_type": self.event_type,
            "timestamp": round(self.timestamp, 3),
            "frame": self.frame,
            "match_id": self.match_id,
            "location": {k: round(v, 3) for k, v in self.location.items()},
            "confidence": round(self.confidence, 3),
            "edges": {
                "players": self.players,
                "tactical_concepts": self.tactical_concepts,
            },
        }


@dataclass
class TacticalRoleNodeSchema:
    """Graph node: Tactical role definition."""
    role_id: str
    name_ar: str
    name_en: str
    description_ar: str
    description_en: str
    key_traits: Dict[str, float] = field(default_factory=dict)
    zone_tendency: List[str] = field(default_factory=list)
    key_events: List[str] = field(default_factory=list)

    # ── Edges ──────────────────────────────
    players_fitted: List[str] = field(default_factory=list)   # player_ids
    related_concepts: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "node_type": "TacticalRoleNode",
            "role_id": self.role_id,
            "name_ar": self.name_ar,
            "name_en": self.name_en,
            "key_traits": self.key_traits,
            "zone_tendency": self.zone_tendency,
            "edges": {
                "players_fitted": len(self.players_fitted),
                "related_concepts": self.related_concepts,
            },
        }


@dataclass
class ClubIdentityNodeSchema:
    """Graph node: Club tactical identity."""
    club_id: str
    name_ar: str
    name_en: str
    tactical_identity: Dict[str, float] = field(default_factory=dict)  # trait → desired value
    primary_roles: List[str] = field(default_factory=list)
    tactical_concepts: List[str] = field(default_factory=list)

    # ── Edges ──────────────────────────────
    players: List[str] = field(default_factory=list)
    matches: List[str] = field(default_factory=list)
    recommendations_made: int = 0

    def to_dict(self) -> dict:
        return {
            "node_type": "ClubIdentityNode",
            "club_id": self.club_id,
            "name_ar": self.name_ar,
            "name_en": self.name_en,
            "tactical_identity": self.tactical_identity,
            "primary_roles": self.primary_roles,
            "edges": {
                "players": len(self.players),
                "matches": len(self.matches),
                "recommendations": self.recommendations_made,
            },
        }


@dataclass
class ScoutFeedbackNodeSchema:
    """Graph node: Human judgment entry."""
    feedback_id: str
    feedback_type: str              # accepted | rejected | note | correction
    player_id: str
    role_id: Optional[str] = None
    note: str = ""
    corrected_role: Optional[str] = None
    timestamp: float = 0.0
    source: str = "scout"           # scout | coach | system

    # ── Edges ──────────────────────────────
    related_player: Optional[str] = None
    related_recommendation: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "node_type": "ScoutFeedbackNode",
            "feedback_id": self.feedback_id,
            "feedback_type": self.feedback_type,
            "player_id": self.player_id,
            "role_id": self.role_id,
            "note": self.note,
            "source": self.source,
            "edges": {
                "related_player": self.related_player,
                "related_recommendation": self.related_recommendation,
            },
        }


# ── Graph Schema Summary ─────────────────────────

GRAPH_SCHEMA = {
    "node_types": {
        "PlayerNode": PlayerNodeSchema,
        "MatchNode": MatchNodeSchema,
        "EventNode": EventNodeSchema,
        "TacticalRoleNode": TacticalRoleNodeSchema,
        "ClubIdentityNode": ClubIdentityNodeSchema,
        "ScoutFeedbackNode": ScoutFeedbackNodeSchema,
    },
    "edge_types": [
        "PLAYS_FOR",           # Player → Club
        "PARTICIPATED_IN",     # Player → Match
        "PERFORMED",           # Player → Event
        "BEST_FIT",            # Player → TacticalRole
        "SIMILAR_TO",          # Player ↔ Player
        "TRIGGERS_CONCEPT",    # Event → TacticalConcept
        "REQUIRES_ROLE",       # Club → TacticalRole
        "FEEDBACK_ON",         # ScoutFeedback → Player
        "IN_MATCH",            # Event → Match
    ],
    "version": "1.0.0",
    "status": "graph-ready",
    "note": "Schema defined. Graph database not deployed yet.",
}
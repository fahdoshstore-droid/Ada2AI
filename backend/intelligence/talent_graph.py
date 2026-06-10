"""
National Talent Graph Foundations — Scalable architecture

Prepares schemas for:
  academies, regions, age groups, player progression,
  tactical evolution, scouting networks

Goal: future Saudi Football Intelligence Graph.
DO NOT deploy distributed infrastructure yet.
Only: prepare scalable schemas and relationships.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum


class AcademyLevel(str, Enum):
    ELITE = "elite"
    ADVANCED = "advanced"
    DEVELOPMENT = "development"
    COMMUNITY = "community"


class AgeGroup(str, Enum):
    U13 = "U13"
    U15 = "U15"
    U17 = "U17"
    U19 = "U19"
    U21 = "U21"
    U23 = "U23"
    SENIOR = "senior"


class Region(str, Enum):
    RIYADH = "riyadh"
    JEDDAH = "jeddah"
    DAMMAM = "dammam"
    MECCA = "mecca"
    MEDINA = "medina"
    ABHA = "abha"
    TABUK = "tabuk"
    HAIL = "hail"
    NAJRAN = "najran"
    JIZAN = "jizan"


# ── Node Types (Graph-ready) ─────────────────────

@dataclass
class AcademyNode:
    """Football academy node."""
    academy_id: str
    name_ar: str = ""
    name_en: str = ""
    level: str = AcademyLevel.DEVELOPMENT
    region: str = ""
    city: str = ""
    established: int = 0
    capacity: int = 0
    current_players: int = 0
    facilities_rating: float = 0.0  # 0-1
    coaching_quality: float = 0.0  # 0-1
    metadata: Dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "node_type": "AcademyNode",
            "academy_id": self.academy_id,
            "name_ar": self.name_ar,
            "level": self.level,
            "region": self.region,
            "capacity": self.capacity,
            "current_players": self.current_players,
            "facilities_rating": round(self.facilities_rating, 2),
            "coaching_quality": round(self.coaching_quality, 2),
        }


@dataclass
class RegionNode:
    """Geographic region node."""
    region_id: str
    name_ar: str = ""
    name_en: str = ""
    population: int = 0
    club_count: int = 0
    academy_count: int = 0
    talent_density: float = 0.0  # rated players / 1000 youth
    infrastructure_score: float = 0.0
    metadata: Dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "node_type": "RegionNode",
            "region_id": self.region_id,
            "name_ar": self.name_ar,
            "club_count": self.club_count,
            "academy_count": self.academy_count,
            "talent_density": round(self.talent_density, 3),
        }


@dataclass
class AgeGroupNode:
    """Age group / development stage node."""
    group_id: str
    age_group: str = AgeGroup.U17
    name_ar: str = ""
    development_focus: List[str] = field(default_factory=list)
    key_metrics: List[str] = field(default_factory=list)
    assessment_criteria: Dict[str, float] = field(default_factory=dict)
    metadata: Dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "node_type": "AgeGroupNode",
            "group_id": self.group_id,
            "age_group": self.age_group,
            "development_focus": self.development_focus,
        }


@dataclass
class ProgressionNode:
    """Player progression / career step node."""
    progression_id: str
    player_id: str
    from_stage: str = ""  # e.g. "academy:U15"
    to_stage: str = ""    # e.g. "academy:U17" or "professional:club_id"
    transition_type: str = ""  # promotion | transfer | loan | release
    date: str = ""
    performance_at_stage: float = 0.0
    notes: str = ""
    metadata: Dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "node_type": "ProgressionNode",
            "player_id": self.player_id,
            "from_stage": self.from_stage,
            "to_stage": self.to_stage,
            "transition_type": self.transition_type,
            "performance_at_stage": round(self.performance_at_stage, 3),
        }


@dataclass
class ScoutingNetworkNode:
    """Scouting network / coverage area node."""
    network_id: str
    name_ar: str = ""
    name_en: str = ""
    coverage_regions: List[str] = field(default_factory=list)
    scout_count: int = 0
    players_tracked: int = 0
    reports_generated: int = 0
    discovery_rate: float = 0.0  # % of tracked who got recommendations
    metadata: Dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "node_type": "ScoutingNetworkNode",
            "network_id": self.network_id,
            "name_ar": self.name_ar,
            "coverage_regions": self.coverage_regions,
            "scout_count": self.scout_count,
            "discovery_rate": round(self.discovery_rate, 3),
        }


# ── Edge Types (Relationships) ───────────────────

@dataclass
class TalentEdge:
    """Edge in the talent graph."""
    edge_type: str  # BELONGS_TO | PROGREDED_TO | SCOUTED_BY | LOCATED_IN | FEEDS_INTO | COMPETES_WITH
    source_id: str
    target_id: str
    weight: float = 1.0
    properties: Dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "edge_type": self.edge_type,
            "source": self.source_id,
            "target": self.target_id,
            "weight": round(self.weight, 3),
            "properties": self.properties,
        }


# ── Schema Registry ──────────────────────────────

TALENT_GRAPH_SCHEMA = {
    "version": "1.0.0",
    "nodes": {
        "AcademyNode": {
            "id_field": "academy_id",
            "required": ["academy_id", "name_ar", "level", "region"],
            "indexes": ["region", "level"],
        },
        "RegionNode": {
            "id_field": "region_id",
            "required": ["region_id", "name_ar"],
            "indexes": ["region_id"],
        },
        "AgeGroupNode": {
            "id_field": "group_id",
            "required": ["group_id", "age_group"],
            "indexes": ["age_group"],
        },
        "ProgressionNode": {
            "id_field": "progression_id",
            "required": ["progression_id", "player_id", "from_stage", "to_stage"],
            "indexes": ["player_id", "transition_type"],
        },
        "ScoutingNetworkNode": {
            "id_field": "network_id",
            "required": ["network_id"],
            "indexes": ["coverage_regions"],
        },
    },
    "edges": {
        "BELONGS_TO": {"source_types": ["PlayerNode", "AcademyNode"], "target_types": ["AcademyNode", "RegionNode"]},
        "PROGRESSED_TO": {"source_types": ["ProgressionNode"], "target_types": ["AgeGroupNode", "AcademyNode"]},
        "SCOUTED_BY": {"source_types": ["PlayerNode"], "target_types": ["ScoutingNetworkNode"]},
        "LOCATED_IN": {"source_types": ["AcademyNode", "ClubIdentityNode"], "target_types": ["RegionNode"]},
        "FEEDS_INTO": {"source_types": ["AcademyNode", "AgeGroupNode"], "target_types": ["AcademyNode", "AgeGroupNode"]},
        "COMPETES_WITH": {"source_types": ["AcademyNode", "ClubIdentityNode"], "target_types": ["AcademyNode", "ClubIdentityNode"]},
    },
}


class TalentGraphFoundation:
    """
    Foundation for National Talent Graph.

    Provides schema validation and in-memory graph structure.
    Ready for future migration to distributed graph database.
    """

    def __init__(self):
        self._nodes: Dict[str, Dict[str, dict]] = {
            "AcademyNode": {},
            "RegionNode": {},
            "AgeGroupNode": {},
            "ProgressionNode": {},
            "ScoutingNetworkNode": {},
        }
        self._edges: List[dict] = []
        self._schema = TALENT_GRAPH_SCHEMA

    def add_node(self, node_type: str, node_data: dict) -> bool:
        """Add a node to the graph."""
        if node_type not in self._schema["nodes"]:
            return False
        id_field = self._schema["nodes"][node_type]["id_field"]
        node_id = node_data.get(id_field, "")
        if not node_id:
            return False
        self._nodes[node_type][node_id] = node_data
        return True

    def add_edge(self, edge_type: str, source_id: str, target_id: str,
                 weight: float = 1.0, properties: Dict = None) -> bool:
        """Add an edge to the graph."""
        if edge_type not in self._schema["edges"]:
            return False
        edge = TalentEdge(
            edge_type=edge_type,
            source_id=source_id,
            target_id=target_id,
            weight=weight,
            properties=properties or {},
        )
        self._edges.append(edge.to_dict())
        return True

    def get_schema(self) -> dict:
        return self._schema

    def get_stats(self) -> dict:
        return {
            "node_counts": {k: len(v) for k, v in self._nodes.items()},
            "edge_count": len(self._edges),
            "edge_types": list(set(e["edge_type"] for e in self._edges)),
            "schema_version": self._schema["version"],
        }

    def export_schema(self) -> dict:
        """Export schema for future graph database migration."""
        return self._schema
"""
Football Ontology Loader — Versioned, extensible YAML-driven football semantics

Loads role definitions, tactical concepts, and event categories from YAML.
Provides programmatic access for all intelligence engines.
"""

import yaml
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, field

ONTOLOGY_DIR = Path(__file__).parent
ONTOLOGY_FILE = ONTOLOGY_DIR / "football_ontology.yaml"


@dataclass
class RoleDefinition:
    """Tactical role with behavioral signature."""
    role_id: str
    name_ar: str
    name_en: str
    description_ar: str
    description_en: str
    zone_tendency: List[str]
    key_events: List[str]
    key_traits: Dict[str, float]     # trait_name → weight (0-1)
    movement_signature: Dict[str, object]

    def get_name(self, lang: str = "ar") -> str:
        return self.name_ar if lang == "ar" else self.name_en

    def get_description(self, lang: str = "ar") -> str:
        return self.description_ar if lang == "ar" else self.description_en


@dataclass
class TacticalConcept:
    """Detectable tactical pattern."""
    concept_id: str
    name_ar: str
    name_en: str
    description_ar: str
    description_en: str
    detection: Dict[str, object]
    event_triggers: List[str]

    def get_name(self, lang: str = "ar") -> str:
        return self.name_ar if lang == "ar" else self.name_en


@dataclass
class EventCategory:
    """Higher-order event derived from raw detection events."""
    event_id: str
    name_ar: str
    name_en: str
    description_ar: str
    description_en: str
    derived_from: List[str]
    conditions: Dict[str, object]

    def get_name(self, lang: str = "ar") -> str:
        return self.name_ar if lang == "ar" else self.name_en


class FootballOntology:
    """
    Versioned football ontology loader.

    Usage:
        onto = FootballOntology()
        role = onto.get_role("pressing_forward")
        concepts = onto.get_concepts_for_event("sprint_press")
    """

    def __init__(self, yaml_path: str = None):
        self._path = Path(yaml_path) if yaml_path else ONTOLOGY_FILE
        self._raw: dict = {}
        self._roles: Dict[str, RoleDefinition] = {}
        self._concepts: Dict[str, TacticalConcept] = {}
        self._events: Dict[str, EventCategory] = {}
        self.version: str = "0.0.0"
        self._load()

    def _load(self):
        """Load and parse ontology YAML."""
        if not self._path.exists():
            raise FileNotFoundError(f"Ontology file not found: {self._path}")

        with open(self._path, "r", encoding="utf-8") as f:
            self._raw = yaml.safe_load(f)

        self.version = self._raw.get("version", "0.0.0")

        # Parse roles
        for role_id, role_data in self._raw.get("roles", {}).items():
            names = role_data.get("name", {})
            descs = role_data.get("description", {})
            self._roles[role_id] = RoleDefinition(
                role_id=role_id,
                name_ar=names.get("ar", role_id),
                name_en=names.get("en", role_id),
                description_ar=descs.get("ar", ""),
                description_en=descs.get("en", ""),
                zone_tendency=role_data.get("zone_tendency", []),
                key_events=role_data.get("key_events", []),
                key_traits=role_data.get("key_traits", {}),
                movement_signature=role_data.get("movement_signature", {}),
            )

        # Parse tactical concepts
        for concept_id, concept_data in self._raw.get("tactical_concepts", {}).items():
            names = concept_data.get("name", {})
            descs = concept_data.get("description", {})
            detection = concept_data.get("detection", {})
            self._concepts[concept_id] = TacticalConcept(
                concept_id=concept_id,
                name_ar=names.get("ar", concept_id),
                name_en=names.get("en", concept_id),
                description_ar=descs.get("ar", ""),
                description_en=descs.get("en", ""),
                detection=detection,
                event_triggers=detection.get("event_triggers", []),
            )

        # Parse event categories
        for event_id, event_data in self._raw.get("event_categories", {}).items():
            names = event_data.get("name", {})
            descs = event_data.get("description", {})
            self._events[event_id] = EventCategory(
                event_id=event_id,
                name_ar=names.get("ar", event_id),
                name_en=names.get("en", event_id),
                description_ar=descs.get("ar", ""),
                description_en=descs.get("en", ""),
                derived_from=event_data.get("derived_from", []),
                conditions=event_data.get("conditions", {}),
            )

    # ── Access Methods ──────────────────────────────

    def get_role(self, role_id: str) -> Optional[RoleDefinition]:
        return self._roles.get(role_id)

    def get_all_roles(self) -> Dict[str, RoleDefinition]:
        return self._roles

    def get_concept(self, concept_id: str) -> Optional[TacticalConcept]:
        return self._concepts.get(concept_id)

    def get_all_concepts(self) -> Dict[str, TacticalConcept]:
        return self._concepts

    def get_event_category(self, event_id: str) -> Optional[EventCategory]:
        return self._events.get(event_id)

    def get_all_event_categories(self) -> Dict[str, EventCategory]:
        return self._events

    def get_concepts_for_event(self, event_id: str) -> List[TacticalConcept]:
        """Find tactical concepts triggered by an event."""
        return [
            c for c in self._concepts.values()
            if event_id in c.event_triggers
        ]

    def get_roles_for_event(self, event_id: str) -> List[RoleDefinition]:
        """Find roles where an event is key."""
        return [
            r for r in self._roles.values()
            if event_id in r.key_events
        ]

    def get_roles_for_zone(self, zone: str) -> List[RoleDefinition]:
        """Find roles that tend to occupy a zone."""
        return [
            r for r in self._roles.values()
            if zone in r.zone_tendency
        ]

    def get_role_trait_names(self) -> List[str]:
        """Get all unique trait names across roles."""
        traits = set()
        for role in self._roles.values():
            traits.update(role.key_traits.keys())
        return sorted(traits)

    def to_dict(self) -> dict:
        """Serialize ontology summary."""
        return {
            "version": self.version,
            "roles": {rid: {"ar": r.name_ar, "en": r.name_en, "traits": r.key_traits}
                      for rid, r in self._roles.items()},
            "concepts": {cid: {"ar": c.name_ar, "en": c.name_en}
                         for cid, c in self._concepts.items()},
            "event_categories": {eid: {"ar": e.name_ar, "en": e.name_en, "derived_from": e.derived_from}
                                 for eid, e in self._events.items()},
        }
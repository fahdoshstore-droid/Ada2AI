"""
Intelligence Memory — Persistent football understanding

Long-term memory for player evolution, tactical profiles,
recommendations, scout interactions, coaching corrections, club preferences.
"""

import json
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from pathlib import Path

MEMORY_PATH = Path(__file__).parent / "intelligence_memory.json"


@dataclass
class PlayerMemory:
    """Persistent memory for one player."""
    player_id: str
    name: Optional[str] = None
    team: Optional[str] = None
    # Evolution history
    temporal_snapshots: List[dict] = field(default_factory=list)
    role_fit_history: List[dict] = field(default_factory=list)
    dna_history: List[dict] = field(default_factory=list)
    # Human interactions
    scout_notes: List[dict] = field(default_factory=list)
    coach_corrections: List[dict] = field(default_factory=list)
    recommendation_history: List[dict] = field(default_factory=list)
    # Tactical understanding
    role_fits: Dict[str, float] = field(default_factory=dict)
    best_role: Optional[str] = None
    dna_vector: List[float] = field(default_factory=list)
    dna_labels: List[Dict[str, str]] = field(default_factory=list)
    # Summary
    matches_analyzed: int = 0
    last_updated: float = 0.0

    def to_dict(self) -> dict:
        return {
            "player_id": self.player_id,
            "name": self.name,
            "team": self.team,
            "role_fits": self.role_fits,
            "best_role": self.best_role,
            "dna_vector": [round(v, 3) for v in self.dna_vector],
            "dna_labels": self.dna_labels,
            "matches_analyzed": self.matches_analyzed,
            "last_updated": round(self.last_updated, 3),
            "snapshots_count": len(self.temporal_snapshots),
            "notes_count": len(self.scout_notes),
            "corrections_count": len(self.coach_corrections),
        }


@dataclass
class ClubMemory:
    """Persistent memory for a club's tactical identity."""
    club_id: str
    name: Optional[str] = None
    # Tactical preferences
    tactical_identity: Dict[str, float] = field(default_factory=dict)
    primary_roles: List[str] = field(default_factory=list)
    tactical_concepts: List[str] = field(default_factory=list)
    # Recommendation history
    recommendations_made: int = 0
    recommendations_accepted: int = 0
    recommendations_rejected: int = 0
    # Scout interactions
    scout_interactions: List[dict] = field(default_factory=list)

    @property
    def acceptance_rate(self) -> float:
        total = self.recommendations_accepted + self.recommendations_rejected
        return self.recommendations_accepted / total if total > 0 else 0.0

    def to_dict(self) -> dict:
        return {
            "club_id": self.club_id,
            "name": self.name,
            "tactical_identity": self.tactical_identity,
            "primary_roles": self.primary_roles,
            "acceptance_rate": round(self.acceptance_rate, 3),
            "recommendations_made": self.recommendations_made,
        }


class IntelligenceMemory:
    """
    Persistent football understanding.

    Stores: player evolution, tactical profiles, recommendations,
    scout interactions, coaching corrections, club preferences.

    This is long-term football memory.
    """

    def __init__(self, path: str = None):
        self._path = Path(path) if path else MEMORY_PATH
        self._players: Dict[str, PlayerMemory] = {}
        self._clubs: Dict[str, ClubMemory] = {}
        self._global_notes: List[dict] = []
        self._load()

    def _load(self):
        if self._path.exists():
            try:
                raw = json.loads(self._path.read_text(encoding="utf-8"))
                for pid, pdata in raw.get("players", {}).items():
                    pm = PlayerMemory(player_id=pid)
                    pm.name = pdata.get("name")
                    pm.team = pdata.get("team")
                    pm.role_fits = pdata.get("role_fits", {})
                    pm.best_role = pdata.get("best_role")
                    pm.dna_vector = pdata.get("dna_vector", [])
                    pm.dna_labels = pdata.get("dna_labels", [])
                    pm.matches_analyzed = pdata.get("matches_analyzed", 0)
                    pm.last_updated = pdata.get("last_updated", 0)
                    pm.temporal_snapshots = pdata.get("temporal_snapshots", [])
                    pm.role_fit_history = pdata.get("role_fit_history", [])
                    pm.dna_history = pdata.get("dna_history", [])
                    pm.scout_notes = pdata.get("scout_notes", [])
                    pm.coach_corrections = pdata.get("coach_corrections", [])
                    pm.recommendation_history = pdata.get("recommendation_history", [])
                    self._players[pid] = pm
                for cid, cdata in raw.get("clubs", {}).items():
                    cm = ClubMemory(club_id=cid)
                    cm.name = cdata.get("name")
                    cm.tactical_identity = cdata.get("tactical_identity", {})
                    cm.primary_roles = cdata.get("primary_roles", [])
                    cm.tactical_concepts = cdata.get("tactical_concepts", [])
                    cm.recommendations_made = cdata.get("recommendations_made", 0)
                    cm.recommendations_accepted = cdata.get("recommendations_accepted", 0)
                    cm.recommendations_rejected = cdata.get("recommendations_rejected", 0)
                    cm.scout_interactions = cdata.get("scout_interactions", [])
                    self._clubs[cid] = cm
                self._global_notes = raw.get("global_notes", [])
            except (json.JSONDecodeError, TypeError):
                pass

    def _save(self):
        data = {
            "players": {pid: {
                "name": p.name, "team": p.team,
                "role_fits": p.role_fits, "best_role": p.best_role,
                "dna_vector": p.dna_vector, "dna_labels": p.dna_labels,
                "matches_analyzed": p.matches_analyzed,
                "last_updated": p.last_updated,
                "temporal_snapshots": p.temporal_snapshots[-20:],
                "role_fit_history": p.role_fit_history[-20:],
                "dna_history": p.dna_history[-10:],
                "scout_notes": p.scout_notes[-30:],
                "coach_corrections": p.coach_corrections[-20:],
                "recommendation_history": p.recommendation_history[-20:],
            } for pid, p in self._players.items()},
            "clubs": {cid: {
                "name": c.name,
                "tactical_identity": c.tactical_identity,
                "primary_roles": c.primary_roles,
                "tactical_concepts": c.tactical_concepts,
                "recommendations_made": c.recommendations_made,
                "recommendations_accepted": c.recommendations_accepted,
                "recommendations_rejected": c.recommendations_rejected,
                "scout_interactions": c.scout_interactions[-20:],
            } for cid, c in self._clubs.items()},
            "global_notes": self._global_notes[-50:],
        }
        self._path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    # ── Player Operations ─────────────────────────

    def update_player(self, player_id: str, **kwargs):
        """Update player memory with new data."""
        if player_id not in self._players:
            self._players[player_id] = PlayerMemory(player_id=player_id)
        pm = self._players[player_id]
        for k, v in kwargs.items():
            if hasattr(pm, k):
                setattr(pm, k, v)
        pm.last_updated = time.time()
        self._save()

    def add_player_snapshot(self, player_id: str, snapshot: dict):
        """Add temporal snapshot."""
        if player_id not in self._players:
            self._players[player_id] = PlayerMemory(player_id=player_id)
        self._players[player_id].temporal_snapshots.append(snapshot)
        self._players[player_id].matches_analyzed += 1
        self._save()

    def add_scout_note(self, player_id: str, note: str, author: str = "scout"):
        if player_id not in self._players:
            self._players[player_id] = PlayerMemory(player_id=player_id)
        self._players[player_id].scout_notes.append({
            "note": note, "author": author, "timestamp": time.time(),
        })
        self._save()

    def add_coach_correction(self, player_id: str, correction: dict):
        if player_id not in self._players:
            self._players[player_id] = PlayerMemory(player_id=player_id)
        self._players[player_id].coach_corrections.append(correction)
        self._save()

    def get_player(self, player_id: str) -> Optional[PlayerMemory]:
        return self._players.get(player_id)

    def get_all_players(self) -> Dict[str, PlayerMemory]:
        return self._players

    # ── Club Operations ───────────────────────────

    def update_club(self, club_id: str, **kwargs):
        if club_id not in self._clubs:
            self._clubs[club_id] = ClubMemory(club_id=club_id)
        cm = self._clubs[club_id]
        for k, v in kwargs.items():
            if hasattr(cm, k):
                setattr(cm, k, v)
        self._save()

    def record_recommendation(self, club_id: str, accepted: bool):
        if club_id not in self._clubs:
            self._clubs[club_id] = ClubMemory(club_id=club_id)
        self._clubs[club_id].recommendations_made += 1
        if accepted:
            self._clubs[club_id].recommendations_accepted += 1
        else:
            self._clubs[club_id].recommendations_rejected += 1
        self._save()

    def get_club(self, club_id: str) -> Optional[ClubMemory]:
        return self._clubs.get(club_id)

    def get_all_clubs(self) -> Dict[str, ClubMemory]:
        return self._clubs

    # ── Global ────────────────────────────────────

    def add_global_note(self, note: str):
        self._global_notes.append({"note": note, "timestamp": time.time()})
        self._save()

    def get_memory_summary(self) -> dict:
        return {
            "total_players": len(self._players),
            "total_clubs": len(self._clubs),
            "total_snapshots": sum(p.matches_analyzed for p in self._players.values()),
            "total_scout_notes": sum(len(p.scout_notes) for p in self._players.values()),
            "total_corrections": sum(len(p.coach_corrections) for p in self._players.values()),
            "memory_strength": min(1.0, len(self._players) / 100),
        }
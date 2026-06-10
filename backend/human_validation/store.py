"""
Human Scout Validation — Capture expert football judgment

Tracks accepted/rejected outputs, corrected tactical interpretations,
human reasoning notes. All corrections stored structurally — becomes training intelligence.

Implements: ScoutReviewSession, CoachCorrection, TacticalOverride, RecommendationApproval
"""

import json
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class CoachCorrection:
    """A tactical correction from a coach/scout."""
    correction_id: str
    player_id: int
    field: str                     # What was corrected: role, event_type, zone, etc.
    original_value: str            # What the system said
    corrected_value: str           # What the human says
    reasoning: str = ""             # Why — human football knowledge
    timestamp: float = field(default_factory=time.time)
    source: str = "coach"          # scout | coach | analyst

    def to_dict(self) -> dict:
        return {
            "correction_id": self.correction_id,
            "player_id": self.player_id,
            "field": self.field,
            "original_value": self.original_value,
            "corrected_value": self.corrected_value,
            "reasoning": self.reasoning,
            "timestamp": round(self.timestamp, 3),
            "source": self.source,
        }


@dataclass
class TacticalOverride:
    """Human overrides a system tactical interpretation."""
    override_id: str
    match_id: Optional[str] = None
    concept_id: str = ""            # e.g. "high_press", "counter_attack"
    system_interpretation: str = "" # What system detected
    human_interpretation: str = "" # What human corrects to
    reasoning: str = ""
    confidence_override: Optional[float] = None  # Human confidence in their correction
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> dict:
        return {
            "override_id": self.override_id,
            "concept_id": self.concept_id,
            "system_interpretation": self.system_interpretation,
            "human_interpretation": self.human_interpretation,
            "reasoning": self.reasoning,
            "confidence_override": self.confidence_override,
        }


@dataclass
class RecommendationApproval:
    """Track recommendation acceptance/rejection with context."""
    approval_id: str
    player_id: int
    role_id: str
    club_id: str
    approved: bool
    note: str = ""
    reasoning: str = ""
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> dict:
        return {
            "approval_id": self.approval_id,
            "player_id": self.player_id,
            "role_id": self.role_id,
            "club_id": self.club_id,
            "approved": self.approved,
            "note": self.note,
            "reasoning": self.reasoning,
        }


@dataclass
class ScoutReviewSession:
    """A complete review session for a match/analysis."""
    session_id: str
    match_id: Optional[str] = None
    video_path: str = ""
    reviewer: str = "scout"          # scout | coach | analyst
    start_time: float = field(default_factory=time.time)
    end_time: Optional[float] = None
    corrections: List[CoachCorrection] = field(default_factory=list)
    overrides: List[TacticalOverride] = field(default_factory=list)
    approvals: List[RecommendationApproval] = field(default_factory=list)
    notes: List[Dict] = field(default_factory=list)  # [{timestamp, text, player_id}]
    overall_assessment: str = ""     # Free text overall assessment

    def add_correction(self, player_id: int, field_name: str, original: str, corrected: str, reasoning: str = "", source: str = "coach") -> CoachCorrection:
        c = CoachCorrection(
            correction_id=f"corr_{int(time.time()*1000)}_{len(self.corrections)}",
            player_id=player_id,
            field=field_name,
            original_value=original,
            corrected_value=corrected,
            reasoning=reasoning,
            source=source,
        )
        self.corrections.append(c)
        return c

    def add_override(self, concept_id: str, system_interp: str, human_interp: str, reasoning: str = "") -> TacticalOverride:
        o = TacticalOverride(
            override_id=f"ovr_{int(time.time()*1000)}_{len(self.overrides)}",
            concept_id=concept_id,
            system_interpretation=system_interp,
            human_interpretation=human_interp,
            reasoning=reasoning,
        )
        self.overrides.append(o)
        return o

    def add_approval(self, player_id: int, role_id: str, club_id: str, approved: bool, note: str = "", reasoning: str = "") -> RecommendationApproval:
        a = RecommendationApproval(
            approval_id=f"appr_{int(time.time()*1000)}_{len(self.approvals)}",
            player_id=player_id,
            role_id=role_id,
            club_id=club_id,
            approved=approved,
            note=note,
            reasoning=reasoning,
        )
        self.approvals.append(a)
        return a

    def add_note(self, text: str, player_id: Optional[int] = None):
        self.notes.append({"timestamp": time.time(), "text": text, "player_id": player_id})

    def close(self, assessment: str = ""):
        self.end_time = time.time()
        self.overall_assessment = assessment

    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "match_id": self.match_id,
            "reviewer": self.reviewer,
            "duration": round((self.end_time or time.time()) - self.start_time, 1),
            "corrections": [c.to_dict() for c in self.corrections],
            "overrides": [o.to_dict() for o in self.overrides],
            "approvals": [a.to_dict() for a in self.approvals],
            "notes": self.notes,
            "overall_assessment": self.overall_assessment,
            "stats": {
                "total_corrections": len(self.corrections),
                "total_overrides": len(self.overrides),
                "approved_count": sum(1 for a in self.approvals if a.approved),
                "rejected_count": sum(1 for a in self.approvals if not a.approved),
            },
        }


class HumanValidationStore:
    """
    Persistent store for all human validation data.
    Human judgment becomes training intelligence.
    """

    STORE_PATH = Path(__file__).parent / "human_validation_store.json"

    def __init__(self, store_path: str = None):
        self._path = Path(store_path) if store_path else self.STORE_PATH
        self._sessions: List[dict] = []
        self._load()

    def _load(self):
        if self._path.exists():
            try:
                self._sessions = json.loads(self._path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, TypeError):
                self._sessions = []

    def _save(self):
        self._path.write_text(
            json.dumps(self._sessions[-100:], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def save_session(self, session: ScoutReviewSession):
        self._sessions.append(session.to_dict())
        self._save()

    def get_sessions(self, limit: int = 20) -> List[dict]:
        return self._sessions[-limit:]

    def get_all_corrections(self) -> List[dict]:
        """Get all corrections across sessions — training intelligence."""
        corrections = []
        for s in self._sessions:
            corrections.extend(s.get("corrections", []))
        return corrections

    def get_all_overrides(self) -> List[dict]:
        overrides = []
        for s in self._sessions:
            overrides.extend(s.get("overrides", []))
        return overrides

    def get_approval_rate(self) -> float:
        """Approval rate across all recommendations."""
        approved = 0
        total = 0
        for s in self._sessions:
            for a in s.get("approvals", []):
                total += 1
                if a.get("approved"):
                    approved += 1
        return approved / max(1, total)

    def get_correction_patterns(self) -> Dict[str, int]:
        """Most frequently corrected fields — signals where system needs improvement."""
        patterns: Dict[str, int] = {}
        for c in self.get_all_corrections():
            field = c.get("field", "unknown")
            patterns[field] = patterns.get(field, 0) + 1
        return dict(sorted(patterns.items(), key=lambda x: -x[1]))

    def get_intelligence_summary(self) -> dict:
        """Summary of human intelligence captured."""
        return {
            "total_sessions": len(self._sessions),
            "total_corrections": len(self.get_all_corrections()),
            "total_overrides": len(self.get_all_overrides()),
            "approval_rate": round(self.get_approval_rate(), 3),
            "correction_patterns": self.get_correction_patterns(),
            "training_intelligence_strength": min(1.0, len(self.get_all_corrections()) / 50),
        }
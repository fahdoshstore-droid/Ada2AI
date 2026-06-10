"""
Feedback Loops — Scout/Coach judgment tracking

Tracks accepted/rejected recommendations, scout notes, tactical corrections.
This becomes Ada2AI proprietary intelligence moat.
Stores HUMAN football judgment for model refinement.
"""

import json
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class ScoutFeedback:
    """Single feedback entry from a human scout/coach."""
    feedback_id: str
    feedback_type: str      # accepted | rejected | note | correction | adjustment
    player_id: int
    role_id: Optional[str] = None
    recommendation_id: Optional[str] = None
    note: str = ""
    corrected_role: Optional[str] = None
    corrected_score: Optional[float] = None
    timestamp: float = field(default_factory=time.time)
    source: str = "scout"   # scout | coach | system

    def to_dict(self) -> dict:
        return {
            "feedback_id": self.feedback_id,
            "feedback_type": self.feedback_type,
            "player_id": self.player_id,
            "role_id": self.role_id,
            "note": self.note,
            "corrected_role": self.corrected_role,
            "corrected_score": self.corrected_score,
            "timestamp": round(self.timestamp, 3),
            "source": self.source,
        }


class FeedbackStore:
    """
    Persistent feedback storage for intelligence loops.

    Tracks:
      - Accepted recommendations → validates system
      - Rejected recommendations → signals correction needed
      - Scout notes → human football knowledge
      - Coach adjustments → tactical corrections
      - Tactical corrections → role/concept refinements

    This becomes proprietary intelligence moat:
      More feedback = better system = better recommendations.
    """

    def __init__(self, store_path: str = None):
        self._path = Path(store_path) if store_path else Path(__file__).parent / "feedback_store.json"
        self._feedbacks: List[ScoutFeedback] = []
        self._load()

    def _load(self):
        """Load existing feedback from disk."""
        if self._path.exists():
            try:
                data = json.loads(self._path.read_text(encoding="utf-8"))
                for entry in data:
                    self._feedbacks.append(ScoutFeedback(**entry))
            except (json.JSONDecodeError, TypeError):
                self._feedbacks = []

    def _save(self):
        """Persist feedback to disk."""
        data = [f.to_dict() for f in self._feedbacks]
        self._path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    def add(self, feedback: ScoutFeedback):
        """Add a feedback entry and persist."""
        self._feedbacks.append(feedback)
        self._save()

    def add_note(self, player_id: int, note: str, source: str = "scout") -> ScoutFeedback:
        """Quick add a scout note."""
        fb = ScoutFeedback(
            feedback_id=f"fb_{int(time.time()*1000)}",
            feedback_type="note",
            player_id=player_id,
            note=note,
            source=source,
        )
        self.add(fb)
        return fb

    def accept_recommendation(self, player_id: int, role_id: str, note: str = "") -> ScoutFeedback:
        """Mark a recommendation as accepted."""
        fb = ScoutFeedback(
            feedback_id=f"fb_{int(time.time()*1000)}",
            feedback_type="accepted",
            player_id=player_id,
            role_id=role_id,
            note=note,
        )
        self.add(fb)
        return fb

    def reject_recommendation(self, player_id: int, role_id: str, note: str = "", corrected_role: str = None) -> ScoutFeedback:
        """Mark a recommendation as rejected with optional correction."""
        fb = ScoutFeedback(
            feedback_id=f"fb_{int(time.time()*1000)}",
            feedback_type="rejected",
            player_id=player_id,
            role_id=role_id,
            note=note,
            corrected_role=corrected_role,
        )
        self.add(fb)
        return fb

    def add_correction(self, player_id: int, corrected_role: str, corrected_score: float, note: str = "") -> ScoutFeedback:
        """Add a tactical correction from a coach."""
        fb = ScoutFeedback(
            feedback_id=f"fb_{int(time.time()*1000)}",
            feedback_type="correction",
            player_id=player_id,
            corrected_role=corrected_role,
            corrected_score=corrected_score,
            note=note,
            source="coach",
        )
        self.add(fb)
        return fb

    # ── Analytics ──────────────────────────────────

    def get_for_player(self, player_id: int) -> List[ScoutFeedback]:
        return [f for f in self._feedbacks if f.player_id == player_id]

    def get_acceptance_rate(self, role_id: str = None) -> float:
        """Calculate recommendation acceptance rate."""
        relevant = [f for f in self._feedbacks
                    if f.feedback_type in ("accepted", "rejected")
                    and (role_id is None or f.role_id == role_id)]
        if not relevant:
            return 0.0
        accepted = sum(1 for f in relevant if f.feedback_type == "accepted")
        return accepted / len(relevant)

    def get_corrections(self) -> List[ScoutFeedback]:
        """Get all tactical corrections — these refine the system."""
        return [f for f in self._feedbacks if f.feedback_type == "correction"]

    def get_insights(self) -> dict:
        """
        Generate insights from feedback data.

        This is the intelligence moat — patterns in human judgment.
        """
        total = len(self._feedbacks)
        if total == 0:
            return {"status": "no_data", "message": "لا توجد تغذية راجعة بعد"}

        accepted = sum(1 for f in self._feedbacks if f.feedback_type == "accepted")
        rejected = sum(1 for f in self._feedbacks if f.feedback_type == "rejected")
        notes = sum(1 for f in self._feedbacks if f.feedback_type == "note")
        corrections = sum(1 for f in self._feedbacks if f.feedback_type == "correction")

        # Most corrected roles
        corrected_roles: Dict[str, int] = {}
        for f in self.get_corrections():
            if f.corrected_role:
                corrected_roles[f.corrected_role] = corrected_roles.get(f.corrected_role, 0) + 1

        return {
            "total_feedback": total,
            "accepted": accepted,
            "rejected": rejected,
            "notes": notes,
            "corrections": corrections,
            "acceptance_rate": self.get_acceptance_rate(),
            "most_corrected_roles": corrected_roles,
            "intelligence_moat_strength": min(1.0, total / 100),  # Scales with volume
        }

    def reset(self):
        """Clear all feedback (testing only)."""
        self._feedbacks.clear()
        self._save()
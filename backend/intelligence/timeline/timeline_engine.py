"""
Match Timeline Intelligence — Understand football phases

Detects: momentum shifts, pressing waves, transition phases,
  defensive compactness, overload periods, tactical dominance,
  tempo changes, fatigue phases.

Output: structured match narrative — NOT generic stats.
"""

import math
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field


@dataclass
class MatchPhase:
    """A detected tactical phase within a match."""
    phase_id: str
    phase_type: str             # momentum_shift | pressing_wave | transition_burst | compact_defense | overload | tactical_dominance | tempo_change | fatigue_phase
    team: Optional[int] = None  # Which team drives this phase
    start_minute: float = 0.0
    end_minute: float = 0.0
    intensity: float = 0.0     # 0-1
    confidence: float = 0.0
    evidence: List[str] = field(default_factory=list)
    # Phase-specific data
    key_events: List[Dict] = field(default_factory=list)
    players_involved: List[int] = field(default_factory=list)

    @property
    def duration_minutes(self) -> float:
        return self.end_minute - self.start_minute

    def to_dict(self) -> dict:
        return {
            "phase_id": self.phase_id,
            "phase_type": self.phase_type,
            "team": self.team,
            "start_minute": round(self.start_minute, 1),
            "end_minute": round(self.end_minute, 1),
            "duration_minutes": round(self.duration_minutes, 1),
            "intensity": round(self.intensity, 3),
            "confidence": round(self.confidence, 3),
            "evidence": self.evidence,
        }


@dataclass
class MatchNarrative:
    """Structured narrative of a match — the story, not the stats."""
    match_id: str
    phases: List[MatchPhase] = field(default_factory=list)
    turning_points: List[Dict] = field(default_factory=list)
    # {minute, phase_type, description_ar, description_en}
    dominant_team: Optional[int] = None
    tempo_profile: str = "balanced"  # high_tempo | low_tempo | variable | balanced
    key_insights: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "match_id": self.match_id,
            "phases": [p.to_dict() for p in self.phases],
            "turning_points": self.turning_points,
            "dominant_team": self.dominant_team,
            "tempo_profile": self.tempo_profile,
            "key_insights": self.key_insights,
        }


class MatchTimelineEngine:
    """
    Understand football phases. Build match narrative.

    Detects shifts, waves, and tactical patterns over time.
    """

    # Phase detection thresholds
    PHASE_DETECTORS = {
        "momentum_shift": {
            "description_ar": "تحول زخم",
            "description_en": "Momentum shift",
            "min_events": 3,
            "window_minutes": 5,
        },
        "pressing_wave": {
            "description_ar": "موجة ضغط",
            "description_en": "Pressing wave",
            "min_events": 5,
            "window_minutes": 10,
        },
        "transition_burst": {
            "description_ar": "انفجار تحولات",
            "description_en": "Transition burst",
            "min_events": 4,
            "window_minutes": 5,
        },
        "compact_defense": {
            "description_ar": "دفاع مكتظ",
            "description_en": "Compact defense",
            "min_events": 3,
            "window_minutes": 10,
        },
        "overload": {
            "description_ar": "تكدس",
            "description_en": "Overload period",
            "min_events": 3,
            "window_minutes": 8,
        },
        "tactical_dominance": {
            "description_ar": "سيطرة تكتيكية",
            "description_en": "Tactical dominance",
            "min_events": 6,
            "window_minutes": 15,
        },
        "tempo_change": {
            "description_ar": "تغير إيقاع",
            "description_en": "Tempo change",
            "min_events": 2,
            "window_minutes": 5,
        },
        "fatigue_phase": {
            "description_ar": "مرحلة إرهاق",
            "description_en": "Fatigue phase",
            "min_events": 2,
            "window_minutes": 10,
        },
    }

    def analyze_timeline(self, events: List[Dict], match_id: str = "", fps: float = 30.0, total_frames: int = 0) -> MatchNarrative:
        """
        Build match narrative from event stream.

        Args:
            events: List of event dicts with 'event_type', 'frame', 'team', 'confidence'
            match_id: Match identifier
            fps: Video fps for frame→minute conversion
            total_frames: Total frames in video

        Returns:
            MatchNarrative with detected phases and insights
        """
        narrative = MatchNarrative(match_id=match_id)
        if not events:
            return narrative

        # Group events by time windows (5-minute bins)
        total_minutes = total_frames / (fps * 60) if total_frames and fps else 90
        window_size = 5  # minutes
        bins = self._bin_events(events, fps, total_minutes, window_size)

        # Detect phases in each bin
        phase_counter = 0
        for bin_start, bin_events in bins.items():
            detected = self._detect_phases_in_window(bin_events, bin_start, window_size)
            for phase_type, phase_data in detected.items():
                phase_counter += 1
                phase = MatchPhase(
                    phase_id=f"phase_{phase_counter}",
                    phase_type=phase_type,
                    start_minute=bin_start,
                    end_minute=bin_start + window_size,
                    **phase_data,
                )
                narrative.phases.append(phase)

        # Merge overlapping same-type phases
        narrative.phases = self._merge_phases(narrative.phases)

        # Find turning points (high-intensity phase transitions)
        narrative.turning_points = self._find_turning_points(narrative.phases)

        # Determine dominant team
        narrative.dominant_team = self._find_dominant_team(events)

        # Tempo profile
        narrative.tempo_profile = self._compute_tempo(events, fps)

        # Key insights
        narrative.key_insights = self._generate_insights(narrative)

        return narrative

    def _bin_events(self, events: List[Dict], fps: float, total_minutes: float, window: int) -> Dict[float, List[Dict]]:
        """Group events into time bins."""
        bins: Dict[float, List[Dict]] = {}
        for event in events:
            frame = event.get("frame", 0)
            minute = frame / (fps * 60) if fps > 0 else 0
            bin_start = math.floor(minute / window) * window
            if bin_start not in bins:
                bins[bin_start] = []
            bins[bin_start].append(event)
        return bins

    def _detect_phases_in_window(self, events: List[Dict], bin_start: float, window: float) -> Dict[str, dict]:
        """Detect tactical phases in a time window."""
        detected = {}
        event_types = [e.get("event_type", "") for e in events]
        type_counts: Dict[str, int] = {}
        for et in event_types:
            type_counts[et] = type_counts.get(et, 0) + 1

        team_counts: Dict[int, int] = {}
        for e in events:
            t = e.get("team")
            if t is not None:
                team_counts[t] = team_counts.get(t, 0) + 1

        # Momentum shift: sudden concentration of events
        if len(events) >= 3:
            main_team = max(team_counts, key=team_counts.get) if team_counts else None
            detected["momentum_shift"] = {
                "intensity": min(1.0, len(events) / 15),
                "team": main_team,
                "confidence": min(1.0, len(events) / 10),
                "evidence": [f"{len(events)} حدث في {window} دقائق"],
            }

        # Pressing wave: high pressure events
        press_count = type_counts.get("pressure", 0) + type_counts.get("sprint_press", 0)
        if press_count >= 3:
            detected["pressing_wave"] = {
                "intensity": min(1.0, press_count / 8),
                "confidence": min(1.0, press_count / 5),
                "evidence": [f"{press_count} أحداث ضغط"],
            }

        # Transition burst
        transition_count = type_counts.get("transition", 0)
        if transition_count >= 2:
            detected["transition_burst"] = {
                "intensity": min(1.0, transition_count / 5),
                "confidence": min(1.0, transition_count / 3),
                "evidence": [f"{transition_count} تحولات سريعة"],
            }

        # Compact defense: many defensive events
        defensive = type_counts.get("defensive_duel", 0) + type_counts.get("recovery_run", 0)
        if defensive >= 2:
            detected["compact_defense"] = {
                "intensity": min(1.0, defensive / 5),
                "confidence": 0.6,
                "evidence": [f"{defensive} أحداث دفاعية"],
            }

        # Tempo change: high speed events
        speed_events = type_counts.get("sprint", 0)
        if speed_events >= 4:
            detected["tempo_change"] = {
                "intensity": min(1.0, speed_events / 8),
                "confidence": 0.7,
                "evidence": [f"{speed_events} ركض سريع"],
            }

        # Fatigue: low event density in late minutes
        if bin_start >= 70 and len(events) < 3:
            detected["fatigue_phase"] = {
                "intensity": 0.4,
                "confidence": 0.5,
                "evidence": ["انخفاض ملحوظ في نشاط اللاعبين بعد الدقيقة 70"],
            }

        return detected

    def _merge_phases(self, phases: List[MatchPhase]) -> List[MatchPhase]:
        """Merge overlapping phases of same type."""
        if len(phases) <= 1:
            return phases
        phases.sort(key=lambda p: p.start_minute)
        merged = [phases[0]]
        for phase in phases[1:]:
            last = merged[-1]
            if (phase.phase_type == last.phase_type and
                phase.team == last.team and
                phase.start_minute <= last.end_minute + 3):  # 3 min gap tolerance
                last.end_minute = max(last.end_minute, phase.end_minute)
                last.intensity = (last.intensity + phase.intensity) / 2
                last.evidence.extend(phase.evidence)
            else:
                merged.append(phase)
        return merged

    def _find_turning_points(self, phases: List[MatchPhase]) -> List[Dict]:
        """Find high-intensity moments that shifted the match."""
        turning = []
        for phase in phases:
            if phase.intensity >= 0.6 and phase.confidence >= 0.5:
                desc_ar = self.PHASE_DETECTORS.get(phase.phase_type, {}).get("description_ar", phase.phase_type)
                turning.append({
                    "minute": round(phase.start_minute, 1),
                    "phase_type": phase.phase_type,
                    "description_ar": desc_ar,
                    "team": phase.team,
                    "intensity": round(phase.intensity, 3),
                })
        return turning

    def _find_dominant_team(self, events: List[Dict]) -> Optional[int]:
        """Determine which team had more influence."""
        team_scores: Dict[int, float] = {}
        for e in events:
            t = e.get("team")
            if t is not None:
                weight = e.get("confidence", 0.5)
                team_scores[t] = team_scores.get(t, 0) + weight
        if not team_scores:
            return None
        return max(team_scores, key=team_scores.get)

    def _compute_tempo(self, events: List[Dict], fps: float) -> str:
        """Determine match tempo profile."""
        if not events or fps <= 0:
            return "balanced"
        # Event density per 10 minutes
        total_minutes = max(1, max(e.get("frame", 0) for e in events) / (fps * 60))
        density = len(events) / (total_minutes / 10)
        if density > 30:
            return "high_tempo"
        elif density < 10:
            return "low_tempo"
        # Check variance
        return "variable" if density > 15 else "balanced"

    def _generate_insights(self, narrative: MatchNarrative) -> List[str]:
        """Generate Arabic insights from detected phases."""
        insights = []
        phase_type_counts: Dict[str, int] = {}
        for p in narrative.phases:
            phase_type_counts[p.phase_type] = phase_type_counts.get(p.phase_type, 0) + 1

        if phase_type_counts.get("pressing_wave", 0) >= 2:
            insights.append("الضغط العالي ظهر كنمط متكرر — الفريق يعتمد على الاستحواذ الإجباري")

        if phase_type_counts.get("transition_burst", 0) >= 2:
            insights.append("تحولات سريعة متكررة — نمط لعب مبني على المرتدات")

        if phase_type_counts.get("fatigue_phase", 0) >= 1:
            insights.append("علامات إرهاق واضحة في آخر المباراة — يحتاج تعديل بدليّة")

        if narrative.tempo_profile == "high_tempo":
            insights.append("إيقاع المباراة مرتفع — يتطلب لياقة بدنية عالية")

        turning_count = len(narrative.turning_points)
        if turning_count >= 3:
            insights.append(f"مباراة متقلبة — {turning_count} نقاط تحول")

        return insights
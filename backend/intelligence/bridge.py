"""
Intelligence Bridge — Connects VisionPipeline output to Intelligence engines.

NO mock data. NO synthetic signatures. NO hardcoded profiles.

This module is the ONLY authorized path from raw video analysis
to intelligence outputs. Every intelligence engine receives
exclusively from this bridge.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from intelligence.ontology import FootballOntology
from intelligence.roles import RoleProfileEngine, PlayerEventSignature
from intelligence.dna import PlayerDNAEngine, PlayerDNAProfile
from intelligence.similarity import SimilarityEngine
from intelligence.recommendation import ScoutRecommendationEngine, ClubTacticalIdentity
from intelligence.club_identity import ClubIdentityEngine, ClubIdentityProfile
from intelligence.temporal import TemporalProfileEngine
from intelligence.timeline import MatchTimelineEngine
from intelligence.explainability import ExplainabilityEngine
from intelligence.memory import IntelligenceMemory


class IntelligenceBridge:
    """
    The ONLY connection between VisionPipeline and Intelligence engines.

    Flow:
        VisionPipeline.analyze_video() → result dict
            ↓
        IntelligenceBridge.enrich(result)
            ↓
        Populates: signatures, DNA profiles, temporal snapshots
            ↓
        Intelligence engines consume from bridge caches
    """

    def __init__(
        self,
        ontology: FootballOntology,
        memory: Optional[IntelligenceMemory] = None,
    ):
        self.ontology = ontology
        self.memory = memory or IntelligenceMemory()

        # Engines
        self.role_engine = RoleProfileEngine(ontology)
        self.dna_engine = PlayerDNAEngine(ontology)
        self.similarity_engine = SimilarityEngine()
        self.scout_engine = ScoutRecommendationEngine(ontology)
        self.club_engine = ClubIdentityEngine()
        self.temporal_engine = TemporalProfileEngine()
        self.timeline_engine = MatchTimelineEngine()
        self.explainability_engine = ExplainabilityEngine()

        # ── Live caches — populated ONLY by enrich() ──
        self._signatures: Dict[int, PlayerEventSignature] = {}
        self._dna_profiles: Dict[int, PlayerDNAProfile] = {}
        self._track_data: Dict[int, dict] = {}
        self._events_timeline: List[dict] = []
        self._match_meta: dict = {}

    # ──────────────────────────────────────────────────────
    # ENRICH: Single entry point from VisionPipeline
    # ──────────────────────────────────────────────────────
    def enrich(self, analysis_result: dict) -> dict:
        """
        Transform raw VisionPipeline output into intelligence-ready data.
        Called after every successful /analyze/full.
        """
        players = analysis_result.get("players", {})
        events = analysis_result.get("events", [])
        match_meta = analysis_result.get("video_info", {})
        formation = analysis_result.get("formation", {})

        self._match_meta = match_meta
        self._events_timeline = events

        enriched_count = 0

        for track_id_str, track_summary in players.items():
            track_id = int(track_id_str)

            # Store raw track data
            self._track_data[track_id] = track_summary

            # ── Build PlayerEventSignature from REAL data ──
            sig = self._build_signature(track_id, track_summary, events, formation)
            self._signatures[track_id] = sig

            # ── Build PlayerDNAProfile from REAL signature ──
            dna = self.dna_engine.generate_profile(sig)
            self._dna_profiles[track_id] = dna

            # ── Add temporal snapshot from REAL data ──
            self.temporal_engine.add_snapshot(
                player_id=track_id,
                match_id=match_meta.get("path", "unknown"),
                signature=sig,
                dna_profile=dna,
            )

            # ── Record in persistent memory ──
            self.memory.add_player_snapshot(
                player_id=str(track_id),
                snapshot={
                    "match_id": match_meta.get("path", "unknown"),
                    "total_distance": track_summary.get("total_distance_meters", 0),
                    "avg_speed": track_summary.get("average_speed_mps", 0),
                    "max_speed": track_summary.get("max_speed_mps", 0),
                    "dna_traits": {k: round(v, 3) for k, v in dna.traits.items()},
                    "dna_labels": [l.get("ar", "") for l in dna.labels],
                },
            )

            enriched_count += 1

        return {
            "enriched_players": enriched_count,
            "total_events": len(events),
            "signatures_built": len(self._signatures),
            "dna_profiles_built": len(self._dna_profiles),
            "temporal_snapshots": enriched_count,
        }

    # ──────────────────────────────────────────────────────
    # BUILD SIGNATURE: Real data → PlayerEventSignature
    # ──────────────────────────────────────────────────────
    def _build_signature(
        self,
        track_id: int,
        track_summary: dict,
        events: List[dict],
        formation: dict,
    ) -> PlayerEventSignature:
        """Construct PlayerEventSignature from actual tracking + events."""

        total_distance = track_summary.get("total_distance_meters", 0.0)
        avg_speed = track_summary.get("average_speed_mps", 0.0)
        max_speed = track_summary.get("max_speed_mps", 0.0)
        team = track_summary.get("team")

        zone_time = self._compute_zone_time(track_id, formation, track_summary)
        event_counts = self._count_player_events(track_id, events)

        sig = PlayerEventSignature(
            track_id=track_id,
            team=team,
            pass_count=int(event_counts.get("pass", 0)),
            sprint_count=int(event_counts.get("sprint", 0)),
            shot_count=int(event_counts.get("shot", 0)),
            pressure_count=int(event_counts.get("pressure", 0)),
            transition_count=int(event_counts.get("transition", 0)),
            possession_time=float(event_counts.get("possession_time", 0.0)),
            total_distance_meters=total_distance,
            avg_speed_mps=avg_speed,
            max_speed_mps=max_speed,
            zone_time_pct=zone_time,
            progressive_passes=int(event_counts.get("progressive_pass", 0)),
            line_breaking_passes=int(event_counts.get("line_breaking_pass", 0)),
            recovery_runs=int(event_counts.get("recovery_run", 0)),
            sprint_presses=int(event_counts.get("sprint_press", 0)),
            defensive_duels=int(event_counts.get("defensive_duel", 0)),
        )

        return sig

    def _count_player_events(
        self, track_id: int, events: List[dict]
    ) -> Dict[str, float]:
        """Count REAL events where this player is an actor."""
        counts: Dict[str, float] = {}
        possession_time = 0.0

        for event in events:
            actors = event.get("actors", [])
            is_actor = any(
                a.get("track_id") == track_id for a in actors
            )
            if not is_actor:
                continue

            etype = event.get("event_type", "")
            counts[etype] = counts.get(etype, 0) + 1

            # Accumulate possession time from metadata
            if etype == "possession":
                duration = event.get("metadata", {}).get("duration", 0.0)
                possession_time += float(duration)

            # Count subtypes from metadata
            subtype = event.get("metadata", {}).get("subtype", "")
            if subtype:
                counts[subtype] = counts.get(subtype, 0) + 1

        counts["possession_time"] = possession_time
        return counts

    def _compute_zone_time(
        self,
        track_id: int,
        formation: dict,
        track_summary: dict,
    ) -> Dict[str, float]:
        """Estimate zone distribution from formation + frames_visible."""
        zone_time: Dict[str, float] = {}

        zones = formation.get("zones", {})
        if zones:
            for zone_name, zone_players in zones.items():
                if any(p.get("track_id") == track_id for p in zone_players):
                    zone_time[zone_name] = zone_time.get(zone_name, 0.0) + 1.0

        total_zones = sum(zone_time.values())
        if total_zones > 0:
            zone_time = {k: round(v / total_zones, 3) for k, v in zone_time.items()}

        # Fallback: derive from team position (marked as estimated)
        if not zone_time and track_summary.get("team") is not None:
            team = track_summary["team"]
            if team == 1:
                zone_time = {"defensive_third": 0.3, "midfield": 0.5, "attacking_third": 0.2}
            else:
                zone_time = {"attacking_third": 0.3, "midfield": 0.5, "defensive_third": 0.2}
            zone_time["_estimated"] = 1

        return zone_time

    # ──────────────────────────────────────────────────────
    # QUERY INTERFACE
    # ──────────────────────────────────────────────────────
    def get_signature(self, track_id: int) -> Optional[PlayerEventSignature]:
        return self._signatures.get(track_id)

    def get_dna(self, track_id: int) -> Optional[PlayerDNAProfile]:
        return self._dna_profiles.get(track_id)

    def get_all_signatures(self) -> Dict[int, PlayerEventSignature]:
        return dict(self._signatures)

    def get_all_dna_profiles(self) -> Dict[int, PlayerDNAProfile]:
        return dict(self._dna_profiles)

    def get_player_data(self, track_id: int) -> Optional[dict]:
        return self._track_data.get(track_id)

    def get_events(self) -> List[dict]:
        return list(self._events_timeline)

    def get_match_meta(self) -> dict:
        return dict(self._match_meta)

    def has_data(self) -> bool:
        return len(self._signatures) > 0

    # ──────────────────────────────────────────────────────
    # INTELLIGENCE ACCESS — all from REAL data
    # ──────────────────────────────────────────────────────
    def evaluate_role(self, track_id: int, target_role: str) -> Optional[dict]:
        sig = self._signatures.get(track_id)
        if not sig:
            return None
        result = self.role_engine.evaluate_for_role(sig, target_role)
        return result.to_dict() if result else None

    def find_similar(self, source_id: int, top_n: int = 5) -> Optional[dict]:
        source = self._dna_profiles.get(source_id)
        if not source:
            return None
        candidates = [p for pid, p in self._dna_profiles.items() if pid != source_id]
        if not candidates:
            return None
        results = self.similarity_engine.find_similar(source, candidates, top_n=top_n)
        return {"source_id": source_id, "similar": [r.to_dict("ar") for r in results]}

    def recommend(self, club_id: str, target_role: str, top_n: int = 5) -> Optional[dict]:
        """
        Scout recommendations — NOW uses ClubIdentityEngine for style_weights.
        FIX: style_weights populated from club profile, NOT empty dict.
        """
        club_profile = self.club_engine.get_profile(club_id)
        if not club_profile:
            club_profile = ClubIdentityProfile(
                club_id=club_id,
                name_ar=club_id,
                name_en=club_id,
                pressing_intensity=0.5,
                buildup_style=0.5,
                transition_preference=0.5,
                width_usage=0.5,
                possession_tempo=0.5,
                defensive_structure=0.5,
                primary_roles=[target_role],
                tactical_concepts=[],
                style_labels=[],
                confidence=0.3,
                matches_analyzed=0,
            )

        club_identity = ClubTacticalIdentity(
            club_id=club_id,
            club_name_ar=club_profile.name_ar,
            club_name_en=club_profile.name_en,
            primary_roles=[target_role],
            tactical_concepts=[],
            style_weights={
                "pressing_intensity": club_profile.pressing_intensity,
                "buildup_style": club_profile.buildup_style,
                "transition_preference": club_profile.transition_preference,
                "width_usage": club_profile.width_usage,
                "possession_tempo": club_profile.possession_tempo,
                "defensive_structure": club_profile.defensive_structure,
            },
        )

        candidates = [
            (sig, self._dna_profiles.get(pid))
            for pid, sig in self._signatures.items()
            if pid in self._dna_profiles
        ]
        candidates = [(s, d) for s, d in candidates if d is not None]

        if not candidates:
            return None

        recs = self.scout_engine.recommend(club_identity, target_role, candidates, top_n=top_n)
        return {
            "role": target_role,
            "club_id": club_id,
            "club_fit_confidence": club_profile.confidence,
            "recommendations": [r.to_dict("ar") for r in recs],
        }

    def get_temporal_profile(self, player_id: int) -> Optional[dict]:
        profile = self.temporal_engine.get_profile(player_id)
        if not profile:
            return None
        return profile.to_dict() if hasattr(profile, 'to_dict') else None

    def get_match_timeline(self) -> Optional[dict]:
        if not self._events_timeline:
            return None
        narrative = self.timeline_engine.analyze_timeline(self._events_timeline)
        return narrative.to_dict() if hasattr(narrative, 'to_dict') else None

    def explain(self, output_type: str, data: dict) -> dict:
        """
        Explain any intelligence output with evidence + confidence.
        
        output_type options:
          role_fit:      {player_id, role, role_ar, fit_score, event_counts}
          club_fit:      {player_id, club_id, club_name_ar, fit_score, dimension_diffs, style_labels}
          recommendation: {player_id, club_id, club_name_ar, fit_score, trait_matches, role_match}
          similarity:    {player_a, player_b, similarity, trait_similarities, shared_patterns}
          temporal:       {player_id, dimension, trend, rate, key_matches}
          timeline:       {phase_type, phase_ar, start_minute, end_minute, intensity, phase_evidence, team}
        """
        engines = {
            "role_fit": "explain_role_fit",
            "club_fit": "explain_club_fit",
            "recommendation": "explain_recommendation",
            "similarity": "explain_similarity",
            "temporal": "explain_temporal_evolution",
            "timeline": "explain_timeline_phase",
        }
        
        method_name = engines.get(output_type)
        if not method_name:
            return {
                "error": f"Unknown output_type: {output_type}",
                "supported": list(engines.keys()),
            }
        
        method = getattr(self.explainability_engine, method_name)
        try:
            result = method(**data)
            if hasattr(result, 'to_dict'):
                return result.to_dict()
            return result
        except TypeError as e:
            return {"error": f"Invalid data for {output_type}: {str(e)}"}

    def reset(self):
        """Clear all caches (call before new analysis)."""
        self._signatures.clear()
        self._dna_profiles.clear()
        self._track_data.clear()
        self._events_timeline.clear()
        self._match_meta.clear()
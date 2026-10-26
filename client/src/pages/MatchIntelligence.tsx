/**
 * Match Intelligence Dashboard — Production football intelligence view.
 *
 * Sections:
 *   1. Match Overview (teams, score, formations, timeline, events, tactical shifts)
 *   2. Players (player cards, metrics, movement, tactical analysis, strengths/weaknesses, confidence)
 *   3. Teams (attack, midfield, defense, transitions, pressure)
 *   4. Coach (formation, changes, substitutions, impact)
 *   5. Weekly Program (story selection, script, graphics data, reconstruction candidates)
 *
 * All data is labeled by provenance (VERIFIED/DERIVED/HEURISTIC/LLM/NOT_AVAILABLE).
 * No hardcoded statistics. All data comes from the backend API.
 */

import { useState, useEffect, useCallback } from "react";
import { yoloEndpoint, yoloFetch } from "@/lib/yoloApi";

// ── Types ──────────────────────────────────────────────────────────

interface ProvenanceBadge {
  level: string;
  confidence: number;
}

interface PlayerMetric {
  name: string;
  value: number;
  unit: string;
  provenance: string;
  evidence: string;
  confidence: number;
}

interface PlayerIntelligenceData {
  track_id: number;
  team: number | null;
  physical: Record<string, PlayerMetric>;
  technical: Record<string, PlayerMetric>;
  tactical: Record<string, PlayerMetric>;
  strengths: string[];
  weaknesses: string[];
  development_areas: string[];
  match_impact: string | null;
  confidence: number;
}

interface TeamScoreData {
  value: number;
  score_components: Record<string, number>;
  confidence: number;
  provenance: string;
  formula: string;
}

interface TeamIntelligenceData {
  team_id: number;
  team_label: string;
  player_count: number;
  total_events: number;
  overall_performance: TeamScoreData;
  attacking_performance: TeamScoreData;
  midfield_performance: TeamScoreData;
  defensive_performance: TeamScoreData;
  possession_quality: TeamScoreData;
  territorial_control: TeamScoreData;
  transition_behavior: TeamScoreData;
  chance_creation: TeamScoreData;
  pressing_behavior: TeamScoreData;
  defensive_stability: TeamScoreData;
}

interface StoryCard {
  story_type: string;
  headline: string;
  evidence: string[];
  statistics: Record<string, number>;
  affected_players: number[];
  affected_team: number | null;
  confidence: number;
  provenance: string;
  visual_recommendation: string;
}

interface ScriptSection {
  id: string;
  title: string;
  duration_minutes: number;
  content: string;
}

interface WeeklyScript {
  match_id: string | null;
  sections: ScriptSection[];
  story_cards: StoryCard[];
  total_duration_estimate_minutes: number;
  confidence: number;
  provenance: string;
}

interface SubstitutionImpact {
  substitution_ref: number;
  before_metrics: Record<string, number>;
  after_metrics: Record<string, number>;
  impact_assessment: string;
  supporting_metrics: Record<string, string>;
  confidence: number;
  provenance: string;
}

interface CoachIntelligenceData {
  starting_formation: string;
  tactical_shape: string;
  playing_style: string;
  formation_changes: unknown[];
  substitutions: unknown[];
  substitution_impacts: SubstitutionImpact[];
  confidence: number;
  provenance: string;
}

interface ReconstructionData {
  event_type: string;
  timestamp: number;
  original: string;
  decision: string;
  alternatives: { label: string; description: string; expected_effect: string; probability_note: string }[];
  confidence: number;
  provenance: string;
  evidence: string;
  warning: string;
}

interface MatchIntelligenceResponse {
  status: string;
  match_id: string | null;
  run_id?: string;
  calibration: { calibrated: boolean; label: string; status?: string; confidence?: number; note?: string };
  event_provenance: { total_events: number; provenance_counts: Record<string, number> };
  players: Record<string, PlayerIntelligenceData>;
  teams: Record<number, TeamIntelligenceData>;
  lines: Record<string, unknown>;
  coach: CoachIntelligenceData;
  season: Record<string, unknown>;
  reconstructions: ReconstructionData[];
  editorial: {
    stories: StoryCard[];
    script: WeeklyScript;
  };
  graphics: Record<string, unknown>;
  data_quality: {
    calibrated: boolean;
    player_identity_confirmed: boolean;
    track_id_note: string;
    provenance_levels_present: string[];
    not_available_metrics: string[];
    unavailable_events?: string[];
    ball_evidence?: {
      status?: string;
      coverage?: number;
      ball_observed_frames?: number;
      provenance?: string;
    };
    tracking_quality?: {
      person_tracks?: number;
      mean_frames_visible?: number;
      mean_detection_confidence?: number;
      provenance?: string;
    };
    positioning_evidence?: {
      status?: string;
      coordinate_space?: string;
      pitch_coordinates?: string;
      physical_distances_and_speeds?: string;
      provenance?: string;
      note?: string;
    };
  };
  processing_time_seconds?: number;
  evidence_fusion?: Record<string, unknown>;
  tv_package?: Record<string, unknown>;
  player_reports?: Record<string, { player?: { name?: string; status?: string; minutes?: number }; impact?: { classification?: string }; provenance_rules?: string[] }>;
}

// ── Provenance Helpers ──────────────────────────────────────────────

const PROVENANCE_COLORS: Record<string, string> = {
  verified: "#16a34a",
  derived: "#2563eb",
  heuristic: "#d97706",
  llm_interpretation: "#7c3aed",
  not_available: "#6b7280",
};

const PROVENANCE_LABELS: Record<string, string> = {
  verified: "VERIFIED",
  derived: "DERIVED",
  heuristic: "HEURISTIC",
  llm_interpretation: "LLM",
  not_available: "N/A",
};

function ProvenanceTag({ level, confidence }: ProvenanceBadge) {
  const color = PROVENANCE_COLORS[level] || "#6b7280";
  const label = PROVENANCE_LABELS[level] || level.toUpperCase();
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      {label}
      {confidence > 0 && (
        <span className="opacity-60">({(confidence * 100).toFixed(0)}%)</span>
      )}
    </span>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export default function MatchIntelligence() {
  const [data, setData] = useState<MatchIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string>("");
  const [runId, setRunId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "players" | "teams" | "coach" | "weekly"
  >("overview");

  const fetchIntelligence = useCallback(async (id?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = yoloEndpoint(
        id ? `/intelligence/match/${id}` : "/season/intelligence"
      );
      // Fetch one persisted payload so events, lines, provenance, and
      // reconstructions survive a backend restart without recomputation.
      if (id) {
        const response = await yoloFetch(url);
        if (!response.ok) throw new Error(`match intelligence fetch ${response.status}`);
        const persisted = (await response.json()) as MatchIntelligenceResponse;
        if (persisted.status !== "success") throw new Error("No persisted intelligence for this match");
        setData(persisted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch intelligence");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRunArtifact = useCallback(async (id?: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await yoloFetch(yoloEndpoint(`/intelligence/run/${encodeURIComponent(id)}`));
      const artifact = await response.json();
      if (!response.ok || artifact.status === "no_data") {
        throw new Error(`run artifact fetch ${response.status}`);
      }
      // The canonical artifact is the persisted envelope.  The existing tabs
      // consume match_intelligence, while these fields keep the run identity
      // and evidence layers visible to downstream dashboard components.
      const persisted = artifact.match_intelligence
        ? {
            ...artifact.match_intelligence,
            status: artifact.status || "success",
            match_id: artifact.match_id ?? artifact.match_intelligence.match_id ?? null,
            run_id: artifact.run_id,
            processing_time_seconds: artifact.processing_metrics?.processing_time_seconds,
            data_quality: artifact.data_quality ?? artifact.match_intelligence.data_quality,
            evidence_fusion: artifact.evidence_fusion,
            tv_package: artifact.tv_package,
            player_reports: artifact.player_reports,
          }
        : artifact;
      if (persisted.status !== "success") throw new Error("No persisted intelligence for this run");
      setData(persisted as MatchIntelligenceResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch run artifact");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load a requested match/run from the replay deep link, then load the season summary.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedMatch = params.get("match");
    const requestedRun = params.get("run");
    const initialize = async () => {
      if (requestedMatch) {
        setMatchId(requestedMatch);
        await fetchIntelligence(requestedMatch);
      }
      if (requestedRun) {
        setRunId(requestedRun);
        await fetchRunArtifact(requestedRun);
      }
    };
    void initialize();
    yoloFetch(yoloEndpoint("/season/intelligence"))
      .then((r) => r.json())
      .catch(() => {});
  }, [fetchIntelligence, fetchRunArtifact]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            🏟️ Match Intelligence Dashboard
          </h1>
          <p className="text-gray-400 text-sm">
            Football intelligence from real match data. All metrics labeled by
            provenance. No fabricated statistics.
          </p>
        </div>

        {/* Data Quality Banner */}
        {data && (
          <div className="mb-6 p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Calibration:</span>
                <span
                  className={`font-medium ${
                    data.data_quality.calibrated ? "text-green-400" : "text-orange-400"
                  }`}
                >
                  {data.calibration?.label || "NOT VALIDATED"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Positioning:</span>
                <span className="font-medium text-cyan-400">
                  {data.data_quality.positioning_evidence?.status || "image_space_only"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Identity:</span>
                <span
                  className={`font-medium ${
                    data.data_quality.player_identity_confirmed
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {data.data_quality.player_identity_confirmed
                    ? "Confirmed"
                    : "NOT Confirmed"}
                </span>
              </div>
              <div className="text-amber-400 text-xs italic">
                ⚠️ {data.data_quality.track_id_note}
              </div>
            </div>
            {data.data_quality.not_available_metrics.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-gray-400">Not Available metrics:</span>{" "}
                {data.data_quality.not_available_metrics.join(", ")}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-gray-400">Ball-dependent events:</span>{" "}
              {data.data_quality.ball_evidence?.status === "sufficient_for_ball_events"
                ? "Evidence threshold met"
                : "UNAVAILABLE — insufficient raw ball evidence"}
              {data.data_quality.ball_evidence?.coverage !== undefined && (
                <span className="ml-2">({(data.data_quality.ball_evidence.coverage * 100).toFixed(1)}% raw coverage)</span>
              )}
            </div>
            {data.data_quality.tracking_quality && (
              <div className="mt-1 text-xs text-gray-500">
                <span className="text-gray-400">Tracking quality:</span>{" "}
                {data.data_quality.tracking_quality.person_tracks ?? 0} person tracks, {" "}
                {(data.data_quality.tracking_quality.mean_detection_confidence ?? 0).toFixed(2)} mean confidence
              </div>
            )}
          </div>
        )}

        {/* Match Selector */}
        <div className="mb-6 flex gap-3 items-center">
          <input
            type="text"
            placeholder="Match ID"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm w-32"
          />
          <button
            onClick={() => fetchIntelligence(matchId)}
            disabled={loading || !matchId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Loading..." : "Analyze Match"}
          </button>
          <input
            type="text"
            placeholder="Run ID"
            value={runId}
            onChange={(e) => setRunId(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm w-72"
          />
          <button
            onClick={() => fetchRunArtifact(runId.trim())}
            disabled={loading || !runId.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Loading..." : "Load Run Artifact"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 animate-pulse">
              Analyzing match intelligence...
            </div>
          </div>
        )}

        {/* Tabs */}
        {data && !loading && (
          <>
            <div className="flex gap-2 mb-6 border-b border-gray-800">
              {(
                [
                  ["overview", "Match Overview"],
                  ["players", "Players"],
                  ["teams", "Teams"],
                  ["coach", "Coach"],
                  ["weekly", "Weekly Program"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === key
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && <OverviewTab data={data} />}
            {activeTab === "players" && <PlayersTab data={data} />}
            {activeTab === "teams" && <TeamsTab data={data} />}
            {activeTab === "coach" && <CoachTab data={data} />}
            {activeTab === "weekly" && <WeeklyTab data={data} />}
          </>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">No match intelligence loaded</p>
            <p className="text-sm">
              Enter a Match ID above to load football intelligence data.
            </p>
            <p className="text-xs mt-4 text-gray-600">
              Matches must have persisted analysis in Supabase. Run{" "}
              <code className="text-gray-400">/analyze/full</code> with a video
              and match_id first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Overview Tab ────────────────────────────────────────────────────

function OverviewTab({ data }: { data: MatchIntelligenceResponse }) {
  const teamEntries = Object.values(data.teams || {});
  const playerCount = Object.keys(data.players || {}).length;

  return (
    <div className="space-y-6">
      {data.player_reports && Object.keys(data.player_reports).length > 0 && (
        <div className="p-4 rounded-lg bg-gray-900 border border-emerald-900/50">
          <h3 className="text-lg font-semibold mb-3">Target Player Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(data.player_reports).map((report, index) => (
              <div key={`${report.player?.name || "player"}-${index}`} className="p-3 rounded bg-gray-800 text-sm">
                <div className="font-medium">{report.player?.name || "Unnamed player"}</div>
                <div className="text-gray-400">Status: {report.player?.status || "UNAVAILABLE"}</div>
                <div className="text-gray-400">Minutes: {report.player?.minutes ?? "UNAVAILABLE"}</div>
                <ProvenanceTag level={report.player?.status === "did_not_play" ? "verified" : "not_available"} confidence={0} />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Teams Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamEntries.map((team) => (
          <div
            key={team.team_id}
            className="p-4 rounded-lg bg-gray-900 border border-gray-800"
          >
            <h3 className="text-lg font-semibold mb-3">{team.team_label}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Players tracked:</span>
                <span>{team.player_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total events:</span>
                <span>{team.total_events}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Overall score:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {team.overall_performance.value.toFixed(1)}
                  </span>
                  <ProvenanceTag
                    level={team.overall_performance.provenance}
                    confidence={team.overall_performance.confidence}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Provenance Summary */}
      <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
        <h3 className="text-lg font-semibold mb-3">Event Provenance Summary</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(data.event_provenance?.provenance_counts || {}).map(
            ([level, count]) => (
              <div
                key={level}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-gray-800 text-sm"
              >
                <ProvenanceTag level={level} confidence={0} />
                <span className="font-bold">{count}</span>
                <span className="text-gray-400">events</span>
              </div>
            )
          )}
          {Object.keys(data.event_provenance?.provenance_counts || {}).length === 0 && (
            <span className="text-gray-500 text-sm">No events detected</span>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Total events: {data.event_provenance?.total_events || 0}
        </div>
      </div>

      {/* Data Quality */}
      <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
        <h3 className="text-lg font-semibold mb-3">Data Quality</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Calibrated:</span>
            <span
              className={
                data.data_quality.calibrated ? "text-green-400" : "text-orange-400"
              }
            >
              {data.data_quality.calibrated ? "Yes" : "No (uncalibrated)"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Calibration validation:</span>
            <span className="text-orange-400">
              {data.calibration?.status || "not_validated"} ({Math.round((data.calibration?.confidence || 0) * 100)}%)
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {data.data_quality.positioning_evidence?.note || "Pitch coordinates unavailable until independent landmark validation passes."}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Player identity:</span>
            <span
              className={
                data.data_quality.player_identity_confirmed
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {data.data_quality.player_identity_confirmed
                ? "Confirmed"
                : "Not confirmed (track_id ≠ player_id)"}
            </span>
          </div>
          <div className="text-gray-500 text-xs italic mt-2">
            {data.data_quality.track_id_note}
          </div>
        </div>
      </div>

      {/* Processing time */}
      {data.processing_time_seconds !== undefined && (
        <div className="text-xs text-gray-500 text-center">
          Processing time: {data.processing_time_seconds}s
        </div>
      )}
    </div>
  );
}

// ── Players Tab ─────────────────────────────────────────────────────

function PlayersTab({ data }: { data: MatchIntelligenceResponse }) {
  const players = Object.values(data.players || {});
  if (players.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">No player data available</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((player) => (
        <div
          key={player.track_id}
          className="p-4 rounded-lg bg-gray-900 border border-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Track #{player.track_id}</h3>
            <div className="flex items-center gap-2">
              {player.team !== null && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-800">
                  Team {player.team}
                </span>
              )}
              <ProvenanceTag level="derived" confidence={player.confidence} />
            </div>
          </div>

          {/* Identity note */}
          <div className="text-xs text-amber-400 mb-3">
            track_id ≠ player_id — identity NOT confirmed
          </div>

          {/* Physical metrics */}
          <div className="mb-3">
            <h4 className="text-xs text-gray-400 uppercase mb-1">Physical</h4>
            <div className="space-y-1">
              {Object.entries(player.physical || {}).map(([key, metric]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{metric.name || key}:</span>
                  <div className="flex items-center gap-1">
                    <span>
                      {metric.value.toFixed(1)} {metric.unit}
                    </span>
                    <ProvenanceTag
                      level={metric.provenance}
                      confidence={metric.confidence}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical metrics */}
          <div className="mb-3">
            <h4 className="text-xs text-gray-400 uppercase mb-1">Technical</h4>
            <div className="space-y-1">
              {Object.entries(player.technical || {}).map(([key, metric]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{metric.name || key}:</span>
                  <div className="flex items-center gap-1">
                    <span>
                      {metric.provenance === "not_available" ? "N/A" : metric.value} {metric.unit}
                    </span>
                    <ProvenanceTag
                      level={metric.provenance}
                      confidence={metric.confidence}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {player.strengths && player.strengths.length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs text-green-400 uppercase mb-1">Strengths</h4>
              <ul className="text-xs text-gray-300 space-y-0.5">
                {player.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {player.weaknesses && player.weaknesses.length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs text-red-400 uppercase mb-1">Weaknesses</h4>
              <ul className="text-xs text-gray-300 space-y-0.5">
                {player.weaknesses.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Match impact */}
          {player.match_impact && (
            <div className="text-xs text-gray-400 italic border-t border-gray-800 pt-2 mt-2">
              {player.match_impact}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Teams Tab ────────────────────────────────────────────────────────

function TeamsTab({ data }: { data: MatchIntelligenceResponse }) {
  const teams = Object.values(data.teams || {});
  if (teams.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">No team data available</div>
    );
  }

  const scoreKeys: { key: keyof TeamIntelligenceData; label: string }[] = [
    { key: "attacking_performance", label: "Attacking" },
    { key: "midfield_performance", label: "Midfield" },
    { key: "defensive_performance", label: "Defensive" },
    { key: "possession_quality", label: "Possession" },
    { key: "territorial_control", label: "Territory" },
    { key: "transition_behavior", label: "Transition" },
    { key: "chance_creation", label: "Chance Creation" },
    { key: "pressing_behavior", label: "Pressing" },
    { key: "defensive_stability", label: "Def. Stability" },
  ];

  return (
    <div className="space-y-6">
      {teams.map((team) => (
        <div
          key={team.team_id}
          className="p-4 rounded-lg bg-gray-900 border border-gray-800"
        >
          <h3 className="text-lg font-semibold mb-4">{team.team_label}</h3>

          {/* Overall */}
          <div className="mb-4 p-3 rounded bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Performance</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {team.overall_performance.value.toFixed(1)}
                </span>
                <ProvenanceTag
                  level={team.overall_performance.provenance}
                  confidence={team.overall_performance.confidence}
                />
              </div>
            </div>
            {team.overall_performance.formula && (
              <div className="text-xs text-gray-500 italic">
                Formula: {team.overall_performance.formula}
              </div>
            )}
          </div>

          {/* Score Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {scoreKeys.map(({ key, label }) => {
              const score = team[key] as TeamScoreData;
              return (
                <div
                  key={key}
                  className="p-3 rounded bg-gray-800/50 border border-gray-800"
                >
                  <div className="text-xs text-gray-400 mb-1">{label}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {score?.value?.toFixed(1) || "—"}
                    </span>
                    {score && (
                      <ProvenanceTag
                        level={score.provenance}
                        confidence={score.confidence}
                      />
                    )}
                  </div>
                  {/* Bar */}
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(score?.value || 0, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Score components */}
          {Object.keys(team.overall_performance.score_components || {}).length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs text-gray-400 uppercase mb-2">
                Score Components
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(team.overall_performance.score_components).map(
                  ([comp, val]) => (
                    <span
                      key={comp}
                      className="text-xs px-2 py-1 rounded bg-gray-800"
                    >
                      {comp}: {(val as number).toFixed(2)}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Coach Tab ────────────────────────────────────────────────────────

function CoachTab({ data }: { data: MatchIntelligenceResponse }) {
  const coach = data.coach;
  if (!coach) {
    return (
      <div className="text-center py-12 text-gray-500">No coach data available</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formation & Style */}
      <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Formation & Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Starting Formation</div>
            <div className="font-medium">{coach.starting_formation}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Tactical Shape</div>
            <div className="font-medium">{coach.tactical_shape}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Playing Style</div>
            <div className="font-medium">{coach.playing_style}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <ProvenanceTag level={coach.provenance} confidence={coach.confidence} />
        </div>
      </div>

      {/* Substitutions */}
      <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Substitutions & Impact</h3>
        {(!coach.substitutions || coach.substitutions.length === 0) ? (
          <p className="text-gray-500 text-sm">
            No substitutions detected in this match.
          </p>
        ) : (
          <div className="space-y-4">
            {coach.substitution_impacts?.map((impact, i) => (
              <div
                key={i}
                className="p-3 rounded bg-gray-800/50 border border-gray-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Substitution #{impact.substitution_ref + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        impact.impact_assessment.includes("Positive")
                          ? "text-green-400"
                          : impact.impact_assessment.includes("Negative")
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      {impact.impact_assessment}
                    </span>
                    <ProvenanceTag
                      level={impact.provenance}
                      confidence={impact.confidence}
                    />
                  </div>
                </div>

                {/* Before/After metrics */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Before (10 min window)</div>
                    {Object.entries(impact.before_metrics || {}).map(([k, v]) => (
                      <div key={k} className="text-xs flex justify-between">
                        <span className="text-gray-500">{k}:</span>
                        <span>{v.toFixed(3)}</span>
                      </div>
                    ))}
                    {Object.keys(impact.before_metrics || {}).length === 0 && (
                      <div className="text-xs text-gray-500">No data</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">After (10 min window)</div>
                    {Object.entries(impact.after_metrics || {}).map(([k, v]) => (
                      <div key={k} className="text-xs flex justify-between">
                        <span className="text-gray-500">{k}:</span>
                        <span>{v.toFixed(3)}</span>
                      </div>
                    ))}
                    {Object.keys(impact.after_metrics || {}).length === 0 && (
                      <div className="text-xs text-gray-500">No data</div>
                    )}
                  </div>
                </div>

                {/* Supporting metrics */}
                {Object.keys(impact.supporting_metrics || {}).length > 0 && (
                  <div className="mt-2 text-xs">
                    {Object.entries(impact.supporting_metrics).map(([k, v]) => (
                      <div key={k} className="text-gray-400">
                        {k}: {v}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Weekly Program Tab ──────────────────────────────────────────────

function WeeklyTab({ data }: { data: MatchIntelligenceResponse }) {
  const stories = data.editorial?.stories || [];
  const script = data.editorial?.script;
  const reconstructions = data.reconstructions || [];

  return (
    <div className="space-y-6">
      {/* Story Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Editorial Stories</h3>
        {stories.length === 0 ? (
          <p className="text-gray-500 text-sm">No stories generated — insufficient data.</p>
        ) : (
          <div className="space-y-3">
            {stories.map((story, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-gray-900 border border-gray-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{story.headline}</h4>
                  <ProvenanceTag
                    level={story.provenance}
                    confidence={story.confidence}
                  />
                </div>
                <div className="text-xs text-blue-400 mb-2">{story.story_type}</div>

                {/* Evidence */}
                {story.evidence.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-400 mb-1">Evidence:</div>
                    <ul className="text-xs text-gray-300 space-y-0.5">
                      {story.evidence.map((e, j) => (
                        <li key={j}>• {e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Statistics */}
                {Object.keys(story.statistics || {}).length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {Object.entries(story.statistics).map(([k, v]) => (
                      <span
                        key={k}
                        className="text-xs px-2 py-0.5 rounded bg-gray-800"
                      >
                        {k}: {v.toFixed(2)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Visual recommendation */}
                {story.visual_recommendation && (
                  <div className="text-xs text-gray-500 italic mt-2">
                    📊 {story.visual_recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Script */}
      {script && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Weekly Script</h3>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="flex items-center gap-3 mb-4 text-sm">
              <span className="text-gray-400">
                Estimated duration:{" "}
                {script.total_duration_estimate_minutes?.toFixed(1) || "—"} min
              </span>
              <ProvenanceTag
                level={script.provenance}
                confidence={script.confidence}
              />
            </div>

            <div className="space-y-4">
              {script.sections?.map((section, i) => (
                <div key={i} className="border-l-2 border-blue-600 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{section.title}</h4>
                    <span className="text-xs text-gray-500">
                      ({section.duration_minutes} min)
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Reconstruction */}
      {reconstructions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            AI Reconstruction Candidates
          </h3>
          <div className="p-3 mb-4 rounded bg-purple-900/20 border border-purple-800 text-purple-300 text-sm">
            ⚠️ ALL reconstructions are SIMULATION / COUNTERFACTUAL — not historical facts.
          </div>
          <div className="space-y-3">
            {reconstructions.map((recon, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-gray-900 border border-gray-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">
                    {recon.event_type} @ {recon.timestamp.toFixed(1)}s
                  </h4>
                  <ProvenanceTag
                    level={recon.provenance}
                    confidence={recon.confidence}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Original:</span>{" "}
                    {recon.original}
                  </div>
                  <div>
                    <span className="text-gray-400">Decision:</span>{" "}
                    {recon.decision}
                  </div>
                  {recon.alternatives?.map((alt, j) => (
                    <div
                      key={j}
                      className="mt-2 p-2 rounded bg-purple-900/10 border border-purple-900/30"
                    >
                      <div className="text-xs text-purple-400 font-medium mb-1">
                        {alt.label}
                      </div>
                      <div className="text-sm">{alt.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Expected effect: {alt.expected_effect}
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        {alt.probability_note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

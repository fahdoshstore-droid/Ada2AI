/**
 * MatchReplay — real match motion playback from the existing CV artifact.
 *
 * This component renders a neutral 2D surface for calibrated pitch coordinates.
 * It intentionally does not use sample data, random motion, or the image-space
 * intelligence summary. If calibration is missing, the user sees the required
 * calibration state and the replay remains paused.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Play, Pause, Activity, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { yoloEndpoint, yoloFetch } from "@/lib/yoloApi";

interface ReplayObservation {
  timestamp_sec: number;
  class_id?: number | null;
  frame_index?: number | null;
  track_id?: number | null;
  player_id?: number | null;
  team?: number | null;
  confidence?: number | null;
  pitch?: { x?: number; y?: number } | null;
  image?: { x?: number; y?: number; width?: number; height?: number } | null;
  provenance?: string;
  calibration_required?: boolean;
}

interface ReplayTrack {
  track_id: number;
  team?: number | null;
  player_id?: number | null;
}

interface CalibrationPayload {
  validated?: boolean;
  is_calibrated?: boolean;
  calibration_label?: string;
  status?: string;
  note?: string;
}


interface ReplayPayload {
  replay_schema_version?: string;
  match_id: string;
  run_id: string;
  created_at?: string;
  observations: ReplayObservation[];
  tracks: ReplayTrack[];
  calibration?: CalibrationPayload;
  confirmed_identities?: Record<string, number>;
  max_interpolation_gap_sec?: number;
  coordinates_count?: number;
  missing_positions_count?: number;
  provenance?: string;
}

interface MatchOption {
  id: string;
  home_team?: string;
  away_team?: string;
  match_date?: string;
  competition?: string;
  has_replay?: boolean;
}

const TEAM_COLORS: Record<number, string> = {
  1: "#00DCC8",
  2: "#FF6B6B",
};
const UNKNOWN_TEAM_COLOR = "#A3A3A3";
const BALL_COLOR = "#FFB800";

export default function MatchReplay({ lang }: { lang?: "ar" | "en" }) {
  const isRTL = lang !== "en";
  const font = isRTL ? "'Cairo', sans-serif" : "'Space Grotesk', sans-serif";
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchOption | null>(null);
  const [replay, setReplay] = useState<ReplayPayload | null>(null);
  const [replayLoading, setReplayLoading] = useState(false);
  const [replayError, setReplayError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [showTrails, setShowTrails] = useState(false);
  const [showBall, setShowBall] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const labels = {
    title: isRTL ? "إعادة المباراة" : "Match Replay",
    noMatches: isRTL ? "لا توجد مباريات محللة" : "No analyzed matches",
    noArtifact: isRTL ? "لا توجد بيانات تتبع محفوظة" : "No persisted tracking artifact",
    calibrationRequired: isRTL ? "المعايرة مطلوبة" : "Calibration required",
    malformed: isRTL ? "بيانات الإعادة غير صالحة" : "Replay artifact malformed",
    insufficient: isRTL ? "المشاهدات غير كافية لإعادة المباراة" : "Insufficient observations for replay",
    unconfirmed: isRTL ? "هوية اللاعب غير مؤكدة" : "Player identity unconfirmed",
    play: isRTL ? "تشغيل" : "Play",
    pause: isRTL ? "إيقاف" : "Pause",
    ball: isRTL ? "الكرة" : "Ball",
    trails: isRTL ? "المسارات" : "Trails",
  };

  useEffect(() => {
    let active = true;
    const loadMatches = async () => {
      try {
        const response = await yoloFetch(yoloEndpoint("/matches"));
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
        if (!active) return;
        setMatches((payload.matches || []).filter((m: MatchOption) => m.has_replay));
      } catch (err) {
        if (active) setMatchesError(err instanceof Error ? err.message : "Failed to load matches");
      } finally {
        if (active) setMatchesLoading(false);
      }
    };
    loadMatches();
    return () => { active = false; };
  }, []);

  const loadReplay = useCallback(async (match: MatchOption) => {
    setReplayLoading(true);
    setReplayError(null);
    setReplay(null);
    setSelectedTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setSelectedMatch(match);
    try {
      const response = await yoloFetch(yoloEndpoint(`/replay/match/${encodeURIComponent(match.id)}`));
      const payload = await response.json();
      if (!response.ok || payload.status !== "no_replay_data" && !payload.observations) {
        throw new Error(payload?.error || `Replay fetch failed (${response.status})`);
      }
      if (payload.status === "no_replay_data") {
        throw new Error(payload.status);
      }
      const timestamps = payload.observations?.map((o: ReplayObservation) => Number(o.timestamp_sec)) || [];
      const maxTime = timestamps.length ? Math.max(...timestamps) : 0;
      const minTime = timestamps.length ? Math.min(...timestamps) : 0;
      if (!payload.observations?.length || maxTime - minTime < 0.5) {
        throw new Error("insufficient_observations");
      }
      payload.calibration = payload.calibration || {
        validated: false,
        is_calibrated: false,
        status: "missing",
      };
      payload.calibration_required = payload.calibration.validated !== true;
      payload.calibration.label = payload.calibration.calibration_label || (payload.calibration.validated ? "Calibrated" : labels.calibrationRequired);
      setReplay(payload);
      setDuration(Math.max(maxTime - minTime, 0.2));
      setCurrentTime(minTime);
    } catch (err) {
      setReplayError(err instanceof Error ? err.message : "replay_load_failed");
    } finally {
      setReplayLoading(false);
    }
  }, []);

  const calibrationValid = replay?.calibration?.validated === true;
  const usableObservations = useMemo(
    () => (replay?.observations || []).filter((obs) => {
      if (calibrationValid) return obs.pitch && typeof obs.pitch.x === "number" && typeof obs.pitch.y === "number";
      return false;
    }),
    [replay, calibrationValid],
  );

  const minTime = useMemo(() => {
    const values = replay?.observations?.map((obs) => Number(obs.timestamp_sec)) || [];
    return values.length ? Math.min(...values) : 0;
  }, [replay]);

  const maxGap = replay?.max_interpolation_gap_sec ?? 1.0;

  const observationsAtTime = useCallback((time: number) => {
    if (!replay?.observations) return [];
    const active: ReplayObservation[] = [];
    for (const obs of replay.observations) {
      const gap = Math.abs(Number(obs.timestamp_sec) - time);
      if (!Number.isFinite(gap) || gap > maxGap) continue;
      if (obs.pitch?.x == null || obs.pitch.y == null) continue;
      active.push(obs);
    }
    return active;
  }, [replay, maxGap]);

  const trailForTrack = useCallback((trackId: number, time: number) => {
    if (!showTrails || !replay?.observations) return [];
    const maxDelay = Math.min(1.0, maxGap);
    return replay.observations.filter((obs) =>
      obs.track_id === trackId &&
      Number(obs.timestamp_sec) <= time &&
      Number(obs.timestamp_sec) >= time - maxDelay &&
      obs.pitch?.x != null && obs.pitch?.y != null
    ).sort((a, b) => Number(a.timestamp_sec) - Number(b.timestamp_sec));
  }, [replay, selectedTrack, showTrails, maxGap]);

  const ballObservation = useMemo(() => {
    if (!showBall || !calibrationValid) return null;
    const candidates = observationsAtTime(currentTime).filter(obs => obs.class_id === 32);
    return candidates.length ? candidates[candidates.length - 1] : null;
  }, [observationsAtTime, currentTime, showBall, calibrationValid]);

  const events = useMemo(() => {
    // Events are not persisted in the compact replay artifact yet; the UI keeps
    // event controls disabled rather than fabricating timestamps.
    return [] as { timestamp_sec: number; label: string; type: string }[];
  }, []);

  useEffect(() => {
    if (!isPlaying || !replay || !calibrationValid) return;
    const step = (now: number) => {
      if (lastTickRef.current == null) lastTickRef.current = now;
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      setCurrentTime(prev => {
        const next = prev + dt * speed;
        if (next >= minTime + duration) {
          setIsPlaying(false);
          return minTime + duration;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
    };
  }, [isPlaying, replay, calibrationValid, minTime, duration, speed]);

  const progress = duration > 0 ? Math.min(1, Math.max(0, (currentTime - minTime) / duration)) : 0;
  const trackEntries = replay?.tracks || [];
  const activeLabels = new Set(observationsAtTime(currentTime).map(obs => obs.track_id));

  const formatTime = (value: number) => {
    const minutes = Math.floor(Math.max(0, value) / 60);
    const seconds = Math.floor(Math.max(0, value) % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const replayState = !matchesLoading && !matchesError && matches.length === 0
    ? "no_matches"
    : replayError === "no_replay_data"
      ? "no_artifact"
      : replayError === "malformed_replay_data"
        ? "malformed"
        : replayError === "insufficient_observations"
          ? "insufficient"
          : replayError
            ? "load_error"
            : replay && !calibrationValid
              ? "calibration_required"
              : "ready";

  return (
    <div className="rounded-2xl p-4" style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Activity size={18} style={{ color: "#00DCC8" }} />
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: font }}>{labels.title}</h2>
        <span className="text-xs px-2 py-1 rounded-full" style={{ color: "#A3A3A3", background: "rgba(255,255,255,0.05)" }}>
          {replay?.run_id ? `Run ${replay.run_id.slice(0, 8)}` : isRTL ? "بدون تشغيل" : "No run"}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontFamily: font }}
          value={selectedMatch?.id || ""}
          onChange={(event) => {
            const match = matches.find(m => m.id === event.target.value);
            if (match) void loadReplay(match);
          }}
        >
          <option value="">— {isRTL ? "اختر مباراة" : "Select match"} —</option>
          {matches.map(match => (
            <option key={match.id} value={match.id}>
              {match.home_team || "Home"} vs {match.away_team || "Away"} · {match.competition || match.match_date || match.id}
            </option>
          ))}
        </select>
        {replayLoading && <Loader2 size={16} className="animate-spin text-white/50" />}
      </div>

      {replayState === "no_matches" && (
        <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(255,184,0,0.08)", color: "#FFB800", border: "1px solid rgba(255,184,0,0.15)" }}>
          <AlertTriangle size={14} className="inline me-2" />{labels.noMatches}
        </div>
      )}
      {replayState === "no_artifact" && (
        <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(255,184,0,0.08)", color: "#FFB800", border: "1px solid rgba(255,184,0,0.15)" }}>
          <AlertTriangle size={14} className="inline me-2" />{labels.noArtifact}
        </div>
      )}
      {replayState === "malformed" && (
        <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.15)" }}>
          <AlertTriangle size={14} className="inline me-2" />{labels.malformed}
        </div>
      )}
      {replayState === "insufficient" && (
        <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(255,184,0,0.08)", color: "#FFB800", border: "1px solid rgba(255,184,0,0.15)" }}>
          <AlertTriangle size={14} className="inline me-2" />{labels.insufficient}
        </div>
      )}
      {replayState === "calibration_required" && (
        <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(255,184,0,0.08)", color: "#FFB800", border: "1px solid rgba(255,184,0,0.15)" }}>
          <AlertTriangle size={14} className="inline me-2" />{labels.calibrationRequired}
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {isRTL
              ? "لا تُعرض الإحداثيات التكتيكية بدون معايرة صالحة. الإحصاءات والتقارير الأخرى لا تتغير."
              : "No tactical coordinates are shown without valid calibration. Existing stats and reports are unchanged."}
          </p>
        </div>
      )}

      {replay && replayState === "ready" && (
        <>
          <div
            className="relative rounded-xl overflow-hidden"
            style={{ paddingTop: "62%", background: "linear-gradient(180deg,#1a4a2e,#1e5233,#1a4a2e)" }}
          >
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 105 68" preserveAspectRatio="none">
              <rect x="0.5" y="0.5" width="104" height="67" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
              <line x1="52.5" y1="0.5" x2="52.5" y2="67.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
              <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
              <rect x="86" y="19.8" width="18.4" height="28.4" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
              <rect x="0.6" y="19.8" width="18.4" height="28.4" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />

              {showTrails && selectedTrack != null && (
                <polyline
                  points={trailForTrack(selectedTrack, currentTime)
                    .map(obs => `${52.5 + Number(obs.pitch?.x)},${34 + Number(obs.pitch?.y)}`).join(" ")}
                  fill="none" stroke="#00DCC8" strokeWidth="0.3" opacity="0.75"
                />
              )}

              {ballObservation?.pitch?.x != null && (
                <circle
                  cx={52.5 + Number(ballObservation.pitch.x)}
                  cy={34 + Number(ballObservation.pitch.y)}
                  r="0.35" fill="#FFF" opacity="0.9"
                />
              )}
            </svg>

            {observationsAtTime(currentTime).map((obs, index) => {
              const track = trackEntries.find(t => t.track_id === obs.track_id);
              const confirmedPlayerId = obs.player_id ?? track?.player_id ?? null;
              const color = TEAM_COLORS[obs.team ?? -1] || track && TEAM_COLORS[track.team ?? -1] || UNKNOWN_TEAM_COLOR;
              const label = confirmedPlayerId != null ? `P${confirmedPlayerId}` : `Track #${obs.track_id}`;
              const isSelected = selectedTrack === obs.track_id;
              return (
                <button
                  key={`${obs.track_id}-${index}`}
                  onClick={() => obs.track_id != null && setSelectedTrack(obs.track_id)}
                  className="absolute flex items-center justify-center rounded-full text-white font-bold text-[9px]"
                  style={{
                    left: `${((52.5 + Number(obs.pitch?.x)) / 105) * 100}%`,
                    top: `${((34 + Number(obs.pitch?.y)) / 68) * 100}%`,
                    width: isSelected ? 22 : 18,
                    height: isSelected ? 22 : 18,
                    transform: "translate(-50%,-50%)",
                    background: color,
                    border: isSelected ? "2px solid #FFF" : "1px solid rgba(0,0,0,0.5)",
                    opacity: selectedTrack == null || isSelected ? 1 : 0.55,
                    fontFamily: font,
                  }}
                  title={`${label} · ${obs.provenance}`}
                >
                  {confirmedPlayerId != null ? confirmedPlayerId : obs.track_id}
                </button>
              );
            })}

            <div className="absolute top-2 start-2 text-xs px-2 py-1 rounded-lg"
              style={{ background: "rgba(0,0,0,0.6)", color: calibrationValid ? "#22C55E" : "#FFB800" }}>
              {replay?.calibration?.calibration_label || (calibrationValid ? "Calibrated" : labels.calibrationRequired)}
            </div>
            <div className="absolute bottom-2 start-2 text-xs" style={{ color: "rgba(255,255,255,0.65)", fontFamily: font }}>
              {formatTime(currentTime)} / {formatTime(minTime + duration)}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <button onClick={() => setIsPlaying(p => !p)} className="px-3 py-2 rounded-lg text-sm font-bold"
              style={{ background: isPlaying ? "rgba(255,68,68,0.15)" : "rgba(0,220,200,0.15)", color: isPlaying ? "#FF6B6B" : "#00DCC8" }}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span className="ms-2">{isPlaying ? labels.pause : labels.play}</span>
            </button>
            <div className="flex items-center gap-1">
              {[0.5, 1, 2].map(value => (
                <button key={value} onClick={() => setSpeed(value)}
                  className="px-2 py-1 rounded-lg text-xs"
                  style={{
                    background: speed === value ? "rgba(0,220,200,0.18)" : "rgba(255,255,255,0.05)",
                    color: speed === value ? "#00DCC8" : "#A3A3A3",
                  }}>{value}×</button>
              ))}
            </div>
            <label className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              <input type="checkbox" checked={showBall} onChange={(e) => setShowBall(e.target.checked)} />
              {labels.ball}
            </label>
            <label className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              <input type="checkbox" checked={showTrails} onChange={(e) => setShowTrails(e.target.checked)} />
              {labels.trails}
            </label>
          </div>

          <div className="mt-3">
            <input
              type="range" min={minTime} max={minTime + duration} step={0.01}
              value={currentTime}
              onChange={(event) => {
                setIsPlaying(false);
                setCurrentTime(Number(event.target.value));
              }}
              className="w-full"
            />
            <div className="h-1.5 mt-2 rounded-full relative" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="absolute inset-y-0 start-0 rounded-full"
                style={{ width: `${progress * 100}%`, background: "linear-gradient(90deg,#00DCC8,#00A651)" }} />
              {events.length > 0 && events.map((event, index) => (
                <button key={index}
                  onClick={() => { setIsPlaying(false); setCurrentTime(event.timestamp_sec); }}
                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 rounded-sm"
                  style={{ left: `${((event.timestamp_sec - minTime) / Math.max(duration, 0.1)) * 100}%`, background: "#FFB800" }}
                  title={event.label} />
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="font-bold text-white mb-1">{isRTL ? "المشاهدات" : "Observations"}</div>
              <div style={{ color: "rgba(255,255,255,0.55)" }}>{usableObservations.length} / {replay?.observations?.length || 0}</div>
              <div style={{ color: "rgba(255,255,255,0.35)" }}>{labels.insufficient}</div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="font-bold text-white mb-1">{isRTL ? "الهوية" : "Identity"}</div>
              <div style={{ color: "rgba(255,255,255,0.55)" }}>{labels.unconfirmed}</div>
              <div style={{ color: "rgba(255,255,255,0.35)" }}>track_id ≠ player_id</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs">
            <LinkIcon size={12} />
            <a href={`/match-intelligence?match=${encodeURIComponent(replay.match_id)}&run=${encodeURIComponent(replay.run_id)}`}
              className="text-[#00DCC8] underline">
              {isRTL ? "تحليل المباراة والتقارير" : "Match intelligence and reports"}
            </a>
          </div>
        </>
      )}

      {!replayLoading && replayState === "ready" && !replay && (
        <div className="p-3 rounded-lg text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          {isRTL ? "اختر مباراة لبدء الإعادة" : "Select a match to start replay"}
        </div>
      )}
    </div>
  );
}

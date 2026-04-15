/**
 * useTacticalAnimation — Animates players on the pitch based on tactical scenarios
 * 
 * Computes player positions, passes, presses, and runs from keyframe data.
 * Interpolates smoothly between keyframes with easing.
 */
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type {
  PitchPlayer,
  TacticalScenario,
  TacticalKeyframe,
  TacticalAnimationState,
  UseTacticalAnimationReturn,
  PressureZone,
} from "./CoachDashboard.types";

// ─── Built-in Scenarios: Al-Ahli vs Al-Hilal tactical patterns ──────────
// Player numbers follow 4-3-3: GK=1, RB=2, CB1=4, CB2=5, LB=3,
//                             RCM=8, CDM=6, LCM=7, RW=10, ST=9, LW=11

export const BUILTIN_SCENARIOS: TacticalScenario[] = [
  // ── Scenario 1: High Press from Left ──
  {
    id: "high-press-left",
    nameAr: "ضغط عالي — الجهة اليسرى",
    nameEn: "High Press — Left Side",
    descriptionAr: "الظهير الأيسر وخط الوسط يضغطون على حامل الكرة من الجهة اليسرى. المحور يغطي المساحة.",
    descriptionEn: "LB, LW, and LCM press the ball carrier on the left. CDM provides cover.",
    phase: "high-press",
    pressureSide: "left",
    ballDirection: "right",
    intensity: 0.8,
    duration: 5,
    keyframes: [
      { t: 0, offsets: {} },
      { t: 0.3, offsets: { 3: { dx: -10, dy: 5 }, 7: { dx: -8, dy: 3 }, 11: { dx: -6, dy: -4 }, 6: { dx: -3, dy: 2 } } },
      { t: 0.6, offsets: { 3: { dx: -14, dy: 8 }, 7: { dx: -12, dy: 5 }, 11: { dx: -10, dy: -6 }, 6: { dx: -5, dy: 4 }, 9: { dx: -4, dy: 0 } } },
      { t: 1.0, offsets: { 3: { dx: -14, dy: 8 }, 7: { dx: -12, dy: 5 }, 11: { dx: -10, dy: -6 }, 6: { dx: -5, dy: 4 }, 9: { dx: -4, dy: 0 } } },
    ],
    passes: [{ fromPlayer: 7, toPlayer: 3, at: 0.15, type: "short" }],
    presses: [
      { fromPlayer: 3, targetLabelAr: "حامل الكرة", targetLabelEn: "Ball carrier", targetX: 10, targetY: 60, from: 0.2, to: 0.7 },
      { fromPlayer: 11, targetLabelAr: "خط التمرير", targetLabelEn: "Passing lane", targetX: 12, targetY: 45, from: 0.3, to: 0.8 },
    ],
    runs: [{ playerNumber: 6, from: { dx: 0, dy: 0 }, to: { dx: -5, dy: 4 }, atFrom: 0.1, atTo: 0.5, type: "cover" as const }],
  },

  // ── Scenario 2: Build-up from Back ──
  {
    id: "build-up",
    nameAr: "بناء من الخلف",
    nameEn: "Build-up from the Back",
    descriptionAr: "المدافعون يوزعون الكرة. الظهيران يصعدان. المحور يهبط للاستلام.",
    descriptionEn: "CBs spread, FBs push high. CDM drops to receive.",
    phase: "build-up",
    pressureSide: "center",
    ballDirection: "forward",
    intensity: 0.4,
    duration: 6,
    keyframes: [
      { t: 0, offsets: {} },
      { t: 0.3, offsets: { 4: { dx: -6, dy: 0 }, 5: { dx: 6, dy: 0 }, 2: { dx: 5, dy: -8 }, 3: { dx: 5, dy: 8 }, 6: { dx: 0, dy: 3 } } },
      { t: 0.6, offsets: { 4: { dx: -8, dy: 0 }, 5: { dx: 8, dy: 0 }, 2: { dx: 8, dy: -15 }, 3: { dx: 8, dy: 15 }, 6: { dx: 0, dy: 5 }, 8: { dx: 3, dy: -4 }, 7: { dx: 3, dy: 4 } } },
      { t: 1.0, offsets: { 4: { dx: -8, dy: 0 }, 5: { dx: 8, dy: 0 }, 2: { dx: 8, dy: -15 }, 3: { dx: 8, dy: 15 }, 6: { dx: 0, dy: 5 }, 8: { dx: 3, dy: -4 }, 7: { dx: 3, dy: 4 } } },
    ],
    passes: [
      { fromPlayer: 1, toPlayer: 4, at: 0.05, type: "short" },
      { fromPlayer: 4, toPlayer: 6, at: 0.2, type: "short" },
      { fromPlayer: 6, toPlayer: 2, at: 0.4, type: "long" },
    ],
    presses: [],
    runs: [
      { playerNumber: 2, from: { dx: 0, dy: 0 }, to: { dx: 8, dy: -15 }, atFrom: 0.15, atTo: 0.55, type: "overlap" },
      { playerNumber: 3, from: { dx: 0, dy: 0 }, to: { dx: 8, dy: 15 }, atFrom: 0.15, atTo: 0.55, type: "overlap" },
    ],
  },

  // ── Scenario 3: Counter Attack ──
  {
    id: "counter-attack",
    nameAr: "هجمة مرتدة",
    nameEn: "Counter Attack",
    descriptionAr: "استلام الكرة بعد خطأ الخصم. المهاجمون يتحركون للأمام بسرعة. تمريرة طولية خلف الدفاع.",
    descriptionEn: "Win ball, quick forward. Strikers run behind the defense. Through ball.",
    phase: "counter-attack",
    pressureSide: "center",
    ballDirection: "forward",
    intensity: 1.0,
    duration: 5,
    keyframes: [
      { t: 0, offsets: { 6: { dx: -2, dy: 0 } } },
      { t: 0.25, offsets: { 6: { dx: 2, dy: 0 }, 9: { dx: 15, dy: -3 }, 10: { dx: 12, dy: -10 }, 11: { dx: 12, dy: 10 } } },
      { t: 0.5, offsets: { 6: { dx: 5, dy: 0 }, 9: { dx: 28, dy: -5 }, 10: { dx: 22, dy: -14 }, 11: { dx: 22, dy: 14 }, 8: { dx: 10, dy: -3 } } },
      { t: 0.75, offsets: { 9: { dx: 32, dy: -8 }, 10: { dx: 28, dy: -18 }, 11: { dx: 26, dy: 16 } } },
      { t: 1.0, offsets: { 9: { dx: 32, dy: -8 }, 10: { dx: 28, dy: -18 }, 11: { dx: 26, dy: 16 } } },
    ],
    passes: [
      { fromPlayer: 6, toPlayer: 8, at: 0.1, type: "short" },
      { fromPlayer: 8, toPlayer: 10, at: 0.3, type: "through" },
      { fromPlayer: 10, toPlayer: 9, at: 0.55, type: "through" },
    ],
    presses: [],
    runs: [
      { playerNumber: 9, from: { dx: 0, dy: 0 }, to: { dx: 32, dy: -8 }, atFrom: 0.15, atTo: 0.65, type: "run-behind" },
      { playerNumber: 10, from: { dx: 0, dy: 0 }, to: { dx: 28, dy: -18 }, atFrom: 0.1, atTo: 0.65, type: "run-behind" },
      { playerNumber: 11, from: { dx: 0, dy: 0 }, to: { dx: 26, dy: 16 }, atFrom: 0.15, atTo: 0.6, type: "drift-wide" },
    ],
  },

  // ── Scenario 4: Mid Block (compact shape) ──
  {
    id: "mid-block",
    nameAr: "كتلة وسطية مضغوطة",
    nameEn: "Mid Block — Compact Shape",
    descriptionAr: "الفريق يضغط المساحة في المنتصف. كل لاعب يقترب من الكرة. تحولات سريعة.",
    descriptionEn: "Team compresses space centrally. Everyone tucks in. Quick shifts.",
    phase: "mid-block",
    pressureSide: "center",
    ballDirection: "neutral",
    intensity: 0.6,
    duration: 6,
    keyframes: [
      { t: 0, offsets: {} },
      { t: 0.3, offsets: { 8: { dx: -3, dy: 5 }, 7: { dx: -3, dy: -5 }, 6: { dx: -2, dy: 0 }, 10: { dx: -4, dy: 6 }, 11: { dx: -4, dy: -6 } } },
      { t: 0.5, offsets: { 8: { dx: -3, dy: 8 }, 7: { dx: -3, dy: -8 }, 6: { dx: -3, dy: 0 }, 10: { dx: -5, dy: 10 }, 11: { dx: -5, dy: -10 }, 9: { dx: -3, dy: 0 } } },
      // Then shift right (ball moved)
      { t: 0.7, offsets: { 8: { dx: 3, dy: 5 }, 7: { dx: 3, dy: -5 }, 6: { dx: 2, dy: 0 }, 10: { dx: 4, dy: 6 }, 11: { dx: 4, dy: -6 } } },
      { t: 1.0, offsets: { 8: { dx: 3, dy: 8 }, 7: { dx: 3, dy: -8 }, 6: { dx: 3, dy: 0 }, 10: { dx: 5, dy: 10 }, 11: { dx: 5, dy: -10 } } },
    ],
    passes: [],
    presses: [
      { fromPlayer: 6, targetLabelAr: "حامل الكرة", targetLabelEn: "Ball carrier", targetX: 28, targetY: 50, from: 0.15, to: 0.45 },
      { fromPlayer: 6, targetLabelAr: "حامل الكرة", targetLabelEn: "Ball carrier", targetX: 22, targetY: 50, from: 0.55, to: 0.85 },
    ],
    runs: [],
  },

  // ── Scenario 5: Transition to Defense ──
  {
    id: "transition-def",
    nameAr: "انتقال دفاعي سريع",
    nameEn: "Quick Defensive Transition",
    descriptionAr: "خسارة الكرة. الجميع يتراجع فوراً. تشكيل ضغط فوري على حامل الكرة.",
    descriptionEn: "Ball lost. Everyone drops instantly. Immediate press on ball carrier.",
    phase: "transition-def",
    pressureSide: "center",
    ballDirection: "backward",
    intensity: 0.9,
    duration: 4,
    keyframes: [
      { t: 0, offsets: { 9: { dx: 15, dy: 0 }, 10: { dx: 10, dy: -8 }, 11: { dx: 10, dy: 8 } } },
      { t: 0.3, offsets: { 9: { dx: 5, dy: 0 }, 10: { dx: 0, dy: -3 }, 11: { dx: 0, dy: 3 }, 8: { dx: -5, dy: 0 }, 7: { dx: -5, dy: 0 }, 6: { dx: -3, dy: 0 } } },
      { t: 0.6, offsets: { 9: { dx: -5, dy: 0 }, 10: { dx: -8, dy: -2 }, 11: { dx: -8, dy: 2 }, 8: { dx: -10, dy: 2 }, 7: { dx: -10, dy: -2 }, 6: { dx: -8, dy: 0 }, 2: { dx: -3, dy: 0 }, 3: { dx: -3, dy: 0 } } },
      { t: 1.0, offsets: { 9: { dx: -8, dy: 0 }, 10: { dx: -12, dy: -3 }, 11: { dx: -12, dy: 3 }, 8: { dx: -12, dy: 4 }, 7: { dx: -12, dy: -4 }, 6: { dx: -8, dy: 0 }, 2: { dx: -3, dy: 0 }, 3: { dx: -3, dy: 0 } } },
    ],
    passes: [],
    presses: [
      { fromPlayer: 9, targetLabelAr: "مطاردة", targetLabelEn: "Chase", targetX: 15, targetY: 50, from: 0.05, to: 0.4 },
      { fromPlayer: 6, targetLabelAr: "ضغط محوري", targetLabelEn: "Central press", targetX: 20, targetY: 50, from: 0.3, to: 0.9 },
    ],
    runs: [
      { playerNumber: 9, from: { dx: 15, dy: 0 }, to: { dx: -8, dy: 0 }, atFrom: 0.0, atTo: 0.8, type: "cut-inside" },
    ],
  },
];

// ─── Utility: Smoothstep easing ──
function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// ─── Utility: Interpolate keyframes ──
function interpolateKeyframes(
  keyframes: TacticalKeyframe[],
  progress: number,
): Record<number, { dx: number; dy: number }> {
  if (keyframes.length === 0) return {};

  // Find the two keyframes we're between
  let k0 = keyframes[0];
  let k1 = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].t && progress <= keyframes[i + 1].t) {
      k0 = keyframes[i];
      k1 = keyframes[i + 1];
      break;
    }
  }

  const range = k1.t - k0.t;
  const localT = range > 0 ? smoothstep((progress - k0.t) / range) : 0;
  const result: Record<number, { dx: number; dy: number }> = {};

  // Collect all player numbers from both keyframes
  const allPlayers = Array.from(new Set([...Object.keys(k0.offsets), ...Object.keys(k1.offsets)]));

  for (const pNum of allPlayers) {
    const a = k0.offsets[Number(pNum)] || { dx: 0, dy: 0 };
    const b = k1.offsets[Number(pNum)] || { dx: 0, dy: 0 };
    result[Number(pNum)] = {
      dx: a.dx + (b.dx - a.dx) * localT,
      dy: a.dy + (b.dy - a.dy) * localT,
    };
  }

  return result;
}

// ─── Utility: Generate pressure zones from scenario ──
function computePressureZones(scenario: TacticalScenario | null): PressureZone[] {
  if (!scenario) return [];
  const zones: PressureZone[] = [];
  const intensity = scenario.intensity;

  if (scenario.pressureSide === "left") {
    zones.push({ x: 0, y: 20, width: 35, height: 60, intensity: intensity * 0.6, color: "255,60,60" });
  } else if (scenario.pressureSide === "right") {
    zones.push({ x: 65, y: 20, width: 35, height: 60, intensity: intensity * 0.6, color: "255,60,60" });
  } else {
    zones.push({ x: 25, y: 20, width: 50, height: 60, intensity: intensity * 0.4, color: "255,120,40" });
  }

  return zones;
}

// ─── The Hook ────────────────────────────────────────────────────────────────
export function useTacticalAnimation(
  players: PitchPlayer[],
  scenarios: TacticalScenario[] = BUILTIN_SCENARIOS,
): UseTacticalAnimationReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  const currentScenario = scenarios[scenarioIndex] || null;
  const totalScenarios = scenarios.length;

  // ── Compute animated positions ──
  const animatedPositions = useMemo(() => {
    if (!currentScenario || !isPlaying && progress === 0) return {};

    const offsets = interpolateKeyframes(currentScenario.keyframes, progress);
    const positions: Record<number, { x: number; y: number }> = {};

    for (const player of players) {
      const offset = offsets[player.number];
      if (offset) {
        positions[player.id] = {
          x: Math.max(2, Math.min(98, player.x + offset.dx)),
          y: Math.max(3, Math.min(97, player.y + offset.dy)),
        };
      }
    }

    return positions;
  }, [players, currentScenario, progress, isPlaying]);

  // ── Active passes (within ±0.1 of their at time) ──
  const activePasses = useMemo(() => {
    if (!currentScenario) return [];
    return currentScenario.passes.filter(p => Math.abs(progress - p.at) < 0.12);
  }, [currentScenario, progress]);

  // ── Active presses ──
  const activePresses = useMemo(() => {
    if (!currentScenario) return [];
    return currentScenario.presses.filter(p => progress >= p.from && progress <= p.to);
  }, [currentScenario, progress]);

  // ── Active runs ──
  const activeRuns = useMemo(() => {
    if (!currentScenario) return [];
    return currentScenario.runs.filter(r => progress >= r.atFrom && progress <= r.atTo);
  }, [currentScenario, progress]);

  // ── Pressure zones ──
  const pressureZones = useMemo(() => computePressureZones(currentScenario), [currentScenario]);

  // ── Phase label ──
  const phaseLabel = currentScenario?.nameAr || "";

  // ── Animation loop ──
  const animate = useCallback((timestamp: number) => {
    if (!currentScenario) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp - pausedAtRef.current;
    }

    const elapsed = (timestamp - startTimeRef.current) * speed;
    const durationMs = currentScenario.duration * 1000;
    const p = Math.min(1, elapsed / durationMs);

    setProgress(p);

    if (p < 1) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      // Scenario complete — auto-advance to next
      if (scenarioIndex < totalScenarios - 1) {
        setScenarioIndex(prev => prev + 1);
        setProgress(0);
        startTimeRef.current = 0;
        pausedAtRef.current = 0;
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setProgress(0);
        startTimeRef.current = 0;
        pausedAtRef.current = 0;
      }
    }
  }, [currentScenario, speed, scenarioIndex, totalScenarios]);

  // ── Controls ──
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    pausedAtRef.current = progress * (currentScenario?.duration || 5) * 1000;
    startTimeRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [progress, currentScenario]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    setScenarioIndex(0);
    startTimeRef.current = 0;
    pausedAtRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause(); else play();
  }, [isPlaying, pause, play]);

  const nextScenario = useCallback(() => {
    if (scenarioIndex < totalScenarios - 1) {
      setScenarioIndex(prev => prev + 1);
      setProgress(0);
      startTimeRef.current = 0;
      pausedAtRef.current = 0;
      if (isPlaying) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
      }
    }
  }, [scenarioIndex, totalScenarios, isPlaying, animate]);

  const prevScenario = useCallback(() => {
    if (scenarioIndex > 0) {
      setScenarioIndex(prev => prev - 1);
      setProgress(0);
      startTimeRef.current = 0;
      pausedAtRef.current = 0;
      if (isPlaying) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
      }
    }
  }, [scenarioIndex, isPlaying, animate]);

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s);
  }, []);

  const setScenarioIdx = useCallback((idx: number) => {
    if (idx >= 0 && idx < totalScenarios) {
      setScenarioIndex(idx);
      setProgress(0);
      startTimeRef.current = 0;
      pausedAtRef.current = 0;
    }
  }, [totalScenarios]);

  // ── RAF lifecycle ──
  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, animate]);

  return {
    isPlaying,
    currentScenario,
    progress,
    phaseLabel,
    animatedPositions,
    activePasses,
    activePresses,
    activeRuns,
    pressureZones,
    speed,
    scenarioIndex,
    totalScenarios,
    play,
    pause,
    stop,
    nextScenario,
    prevScenario,
    setSpeed,
    setScenarioIndex: setScenarioIdx,
    togglePlay,
  };
}

/**
 * CoachDashboard — Interactive Tactical Board (Enhanced)
 * Features:
 *  - Drag-and-drop players on a realistic football pitch
 *  - Formation presets (4-3-3, 4-4-2, 3-5-2, 4-2-3-1)
 *  - Real player assignment from /data/players.ts
 *  - Save/load formations (localStorage + ready for DB)
 *  - Team performance chart (last 5 matches)
 *  - Opponent analysis panel (presets + custom opponent form)
 *  - Video analysis upload panel (POST /api/v1/football/analyze-football)
 *  - Possession bars + Voronoi field visualization from analysis
 *  - Bilingual (Arabic / English)
 */

import { useState, useRef, useCallback, useEffect } from "react";
// VisualGuide - Arabic AI Teaching Overlay
import { VisualGuide, HighlightOverlay, createFormationGuide, analyzeFormation, generateGuideStepsFromAnalysis, presetHighlights } from "@/components/VisualGuide";
import type { HighlightConfig, HighlightZone } from "@/components/VisualGuide";
// DHEEB Eye - Voice + Vision AI companion
import { EyeOverlay, EyeEngine } from "@/components/Eye";
import type { EyeAction } from "@/components/Eye";
import {
  Brain, RotateCcw, ChevronDown, ChevronUp,
  TrendingUp, Shield, Swords, Eye, Target,
  AlertTriangle, CheckCircle, Activity, Save,
  FolderOpen, Plus, Upload, Video, X, Loader2,
  Users, UserCheck, BarChart3
} from "lucide-react";
import TeamAnalysisTab from "../components/TeamAnalysisTab";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { Link } from "wouter";
import { allPlayers, type Player as DataPlayer } from "@/data/players";
import { useTacticalAnimation, BUILTIN_SCENARIOS } from "./useTacticalAnimation";
import { useA2AAgent } from "../hooks/useA2AAgent";
import AgentTracePanel from "@/components/AgentTracePanel";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CoachDashboardProps {
  onNavigate?: (page: string, context?: unknown) => void;
  lang?: "ar" | "en";
}

type Formation = "4-3-3" | "4-4-2" | "3-5-2" | "4-2-3-1";
type PlayerRole = "GK" | "DEF" | "MID" | "FWD";

interface PitchPlayer {
  id: number;
  number: number;
  nameAr: string;
  nameEn: string;
  role: PlayerRole;
  rating: number;
  x: number;
  y: number;
  hasWarning?: boolean;
  linkedPlayerId?: number; // link to /data/players.ts
}

interface SavedFormation {
  id: string;
  name: string;
  formation: Formation;
  players: PitchPlayer[];
  savedAt: string;
}

interface CustomOpponent {
  nameAr: string;
  nameEn: string;
  formation: string;
  styleAr: string;
  styleEn: string;
  strengthsAr: string;
  strengthsEn: string;
  weaknessesAr: string;
  weaknessesEn: string;
}

interface VideoAnalysisResult {
  team_0_name: string;
  team_1_name: string;
  team_0_possession: number;
  team_1_possession: number;
  team_0_area: number;
  team_1_area: number;
  team_0_goals?: number;
  team_1_goals?: number;
  team_0_shots?: number;
  team_1_shots?: number;
}

// ─── Formation Templates ──────────────────────────────────────────────────────
const formationTemplates: Record<Formation, Omit<PitchPlayer, "id" | "nameAr" | "nameEn" | "rating" | "hasWarning">[]> = {
  "4-3-3": [
    { number: 1,  role: "GK",  x: 50, y: 88 },
    { number: 3,  role: "DEF", x: 15, y: 68 },
    { number: 5,  role: "DEF", x: 35, y: 68 },
    { number: 4,  role: "DEF", x: 65, y: 68 },
    { number: 2,  role: "DEF", x: 85, y: 68 },
    { number: 6,  role: "MID", x: 25, y: 45 },
    { number: 8,  role: "MID", x: 50, y: 42 },
    { number: 10, role: "MID", x: 75, y: 45 },
    { number: 11, role: "FWD", x: 18, y: 18 },
    { number: 9,  role: "FWD", x: 50, y: 12 },
    { number: 7,  role: "FWD", x: 82, y: 18 },
  ],
  "4-4-2": [
    { number: 1,  role: "GK",  x: 50, y: 88 },
    { number: 3,  role: "DEF", x: 15, y: 68 },
    { number: 5,  role: "DEF", x: 35, y: 68 },
    { number: 4,  role: "DEF", x: 65, y: 68 },
    { number: 2,  role: "DEF", x: 85, y: 68 },
    { number: 6,  role: "MID", x: 15, y: 45 },
    { number: 8,  role: "MID", x: 35, y: 45 },
    { number: 10, role: "MID", x: 65, y: 45 },
    { number: 11, role: "MID", x: 85, y: 45 },
    { number: 9,  role: "FWD", x: 35, y: 15 },
    { number: 7,  role: "FWD", x: 65, y: 15 },
  ],
  "3-5-2": [
    { number: 1,  role: "GK",  x: 50, y: 88 },
    { number: 5,  role: "DEF", x: 25, y: 68 },
    { number: 4,  role: "DEF", x: 50, y: 68 },
    { number: 3,  role: "DEF", x: 75, y: 68 },
    { number: 2,  role: "MID", x: 10, y: 45 },
    { number: 6,  role: "MID", x: 30, y: 45 },
    { number: 8,  role: "MID", x: 50, y: 42 },
    { number: 10, role: "MID", x: 70, y: 45 },
    { number: 11, role: "MID", x: 90, y: 45 },
    { number: 9,  role: "FWD", x: 35, y: 15 },
    { number: 7,  role: "FWD", x: 65, y: 15 },
  ],
  "4-2-3-1": [
    { number: 1,  role: "GK",  x: 50, y: 88 },
    { number: 3,  role: "DEF", x: 15, y: 68 },
    { number: 5,  role: "DEF", x: 35, y: 68 },
    { number: 4,  role: "DEF", x: 65, y: 68 },
    { number: 2,  role: "DEF", x: 85, y: 68 },
    { number: 6,  role: "MID", x: 35, y: 52 },
    { number: 8,  role: "MID", x: 65, y: 52 },
    { number: 11, role: "MID", x: 18, y: 32 },
    { number: 10, role: "MID", x: 50, y: 30 },
    { number: 7,  role: "MID", x: 82, y: 32 },
    { number: 9,  role: "FWD", x: 50, y: 12 },
  ],
};

// ─── Default Player Data ──────────────────────────────────────────────────────
const defaultPlayerData: Record<number, { nameAr: string; nameEn: string; rating: number; hasWarning?: boolean }> = {
  1:  { nameAr: "الحارس",   nameEn: "GK",    rating: 82 },
  2:  { nameAr: "ظهير أ",   nameEn: "RB",    rating: 77 },
  3:  { nameAr: "ظهير ي",   nameEn: "LB",    rating: 75 },
  4:  { nameAr: "قلب دفاع", nameEn: "CB",    rating: 78 },
  5:  { nameAr: "قلب دفاع", nameEn: "CB",    rating: 80 },
  6:  { nameAr: "وسط دف",   nameEn: "CDM",   rating: 81 },
  7:  { nameAr: "جناح أ",   nameEn: "RW",    rating: 83, hasWarning: true },
  8:  { nameAr: "وسط",      nameEn: "CM",    rating: 85 },
  9:  { nameAr: "مهاجم",    nameEn: "ST",    rating: 86 },
  10: { nameAr: "خلاق",     nameEn: "CAM",   rating: 88, hasWarning: true },
  11: { nameAr: "جناح ي",   nameEn: "LW",    rating: 84 },
};

// ─── Role Colors ──────────────────────────────────────────────────────────────
const roleColors: Record<PlayerRole, { bg: string; border: string; label: string; labelAr: string }> = {
  GK:  { bg: "#F59E0B",   border: "#F59E0B",   label: "GK",  labelAr: "حارس" },
  DEF: { bg: "#3B82F6",   border: "#60A5FA",   label: "DEF", labelAr: "مدافع" },
  MID: { bg: "#22C55E",   border: "#4ADE80",   label: "MID", labelAr: "وسط" },
  FWD: { bg: "#EF4444",   border: "#F87171",   label: "FWD", labelAr: "مهاجم" },
};

// ─── Performance Data ─────────────────────────────────────────────────────────
const performanceData = [
  { match: "م1", matchEn: "M1", attack: 62, defense: 58, possession: 48 },
  { match: "م2", matchEn: "M2", attack: 68, defense: 64, possession: 52 },
  { match: "م3", matchEn: "M3", attack: 74, defense: 70, possession: 58 },
  { match: "م4", matchEn: "M4", attack: 71, defense: 75, possession: 61 },
  { match: "م5", matchEn: "M5", attack: 82, defense: 78, possession: 67 },
];

// ─── Opponent Presets ─────────────────────────────────────────────────────────
const opponentPresets = [
  {
    nameAr: "الهلال",
    nameEn: "Al-Hilal",
    formation: "4-2-3-1",
    style: { ar: "ضغط عالٍ، هجوم مرتد سريع", en: "High press, fast counter-attack" },
    strengths: {
      ar: ["الضغط العالي في الملعب", "السرعة على الأجنحة", "الدقة في التمرير"],
      en: ["High press across the pitch", "Speed on the wings", "Passing accuracy"],
    },
    weaknesses: {
      ar: ["الفراغات خلف الدفاع", "ضعف الكرات الثابتة دفاعياً", "الإرهاق في الشوط الثاني"],
      en: ["Space behind the defense", "Defensive set-pieces", "Fatigue in second half"],
    },
    radar: [
      { stat: "هجوم", statEn: "Attack",     value: 88 },
      { stat: "دفاع", statEn: "Defense",    value: 82 },
      { stat: "وسط",  statEn: "Midfield",   value: 85 },
      { stat: "سرعة", statEn: "Speed",      value: 90 },
      { stat: "ثبات", statEn: "Composure",  value: 78 },
    ],
  },
  {
    nameAr: "النصر",
    nameEn: "Al-Nassr",
    formation: "4-3-3",
    style: { ar: "حيازة الكرة، بناء من الخلف", en: "Possession-based, build from back" },
    strengths: {
      ar: ["الحيازة الطويلة للكرة", "الاستحواذ في الوسط", "الدقة في التسديد"],
      en: ["Long ball possession", "Midfield dominance", "Shooting accuracy"],
    },
    weaknesses: {
      ar: ["بطء الانتقال من دفاع لهجوم", "ضعف الكرات العالية", "الاعتماد على لاعب واحد"],
      en: ["Slow transition defense-to-attack", "Aerial weakness", "Over-reliance on one player"],
    },
    radar: [
      { stat: "هجوم", statEn: "Attack",     value: 92 },
      { stat: "دفاع", statEn: "Defense",    value: 75 },
      { stat: "وسط",  statEn: "Midfield",   value: 88 },
      { stat: "سرعة", statEn: "Speed",      value: 85 },
      { stat: "ثبات", statEn: "Composure",  value: 90 },
    ],
  },
  {
    nameAr: "الاتحاد",
    nameEn: "Al-Ittihad",
    formation: "4-4-2",
    style: { ar: "دفاع منظم، هجمات مباشرة", en: "Organized defense, direct attacks" },
    strengths: {
      ar: ["الدفاع المنظم والمتماسك", "الكرات الثابتة الهجومية", "القوة الجسدية"],
      en: ["Organized and compact defense", "Offensive set-pieces", "Physical strength"],
    },
    weaknesses: {
      ar: ["ضعف في بناء اللعب من الخلف", "قلة الإبداع في الوسط", "الفراغات على الأجنحة"],
      en: ["Weak build-up from the back", "Lack of creativity in midfield", "Wing spaces"],
    },
    radar: [
      { stat: "هجوم", statEn: "Attack",     value: 78 },
      { stat: "دفاع", statEn: "Defense",    value: 87 },
      { stat: "وسط",  statEn: "Midfield",   value: 76 },
      { stat: "سرعة", statEn: "Speed",      value: 72 },
      { stat: "ثبات", statEn: "Composure",  value: 83 },
    ],
  },
];

// ─── Football players from data/players.ts ────────────────────────────────────
const footballPlayers = allPlayers.filter(p => p.sport === "Football");

// ─── Component ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CoachDashboard(props: any = {}) {
  const onNavigate: ((page: string, ctx?: unknown) => void) | undefined = props.onNavigate;
  const lang: "ar" | "en" = props.lang || "ar";
  const isRTL = lang === "ar";
  const font = isRTL ? "'Cairo', sans-serif" : "'Space Grotesk', sans-serif";

  // ── Pitch State ──────────────────────────────────────────────────────────────
  const [formation, setFormation] = useState<Formation>("4-4-2");
  const [players, setPlayers] = useState<PitchPlayer[]>(() => buildPlayers("4-4-2"));
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [tacticalNotes, setTacticalNotes] = useState("");
  const pitchRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: number } | null>(null);

  // ── Tactical Animation ──────────────────────────────────────────────────
  const [tacticalMode, setTacticalMode] = useState(false);
  const tactical = useTacticalAnimation(players);
  const a2a = useA2AAgent();

  // ── VisualGuide State ────────────────────────────────────────────────────────
  const [guideActive, setGuideActive] = useState(false);
  const [guideSession, setGuideSession] = useState<ReturnType<typeof createFormationGuide> | null>(null);
  const [guideStep, setGuideStep] = useState(0);
  const [highlightActive, setHighlightActive] = useState(false);
  const [currentHighlights, setCurrentHighlights] = useState<HighlightConfig[]>([]);

  // ── DHEEB Eye State ──────────────────────────────────────────────────────────
  const [eyeActive, setEyeActive] = useState(false);
  const [eyeEngine] = useState(() => new EyeEngine({
    context: 'coach',
    language: lang === 'ar' ? 'ar' : 'en',
    voiceEnabled: true,
    ttsEnabled: true,
    visionEnabled: true,
    visionEndpoint: '/api/eye/vision',
    onActionComplete: (action: EyeAction) => {
      // Feed Eye highlight/point actions back into HighlightOverlay
      if (action.type === 'highlight') {
        setCurrentHighlights(prev => [...prev, {
          zone: (action.payload.zone as HighlightZone) || 'center',
          color: (action.payload.color as string) || '#00DCC8',
          opacity: 0.4,
          pulse: true,
        }]);
      }
    },
    onSessionEnd: (session) => {
      // Auto-save voice transcript and analysis as tactical notes
      if (session.transcript) {
        setTacticalNotes(prev => {
          const timestamp = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US');
          const note = `[${timestamp}] 🎙️ ${session.transcript}`;
          return prev ? `${prev}\n${note}` : note;
        });
      }
    },
  }));

  const startGuide = () => {
    // Analyze current formation and generate smart guidance
    const analysis = analyzeFormation(players);
    const aiSteps = generateGuideStepsFromAnalysis(analysis, players);
    
    // Activate highlights for this formation
    const formationHighlights = presetHighlights[formation] || [];
    setCurrentHighlights(formationHighlights);
    setHighlightActive(true);
    
    const session = {
      id: `guide-${Date.now()}`,
      name: 'ai-formation-guide',
      level: 'beginner' as const,
      steps: aiSteps,
      completedSteps: [],
    };
    
    setGuideSession(session);
    setGuideStep(0);
    setGuideActive(true);
  };

  // ── Player Assignment Modal ──────────────────────────────────────────────────
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningPlayerId, setAssigningPlayerId] = useState<number | null>(null);

  // ── Save/Load Formations ─────────────────────────────────────────────────────
  const [savedFormations, setSavedFormations] = useState<SavedFormation[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("ada2ai_formations") || "[]");
    } catch { return []; }
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [formationName, setFormationName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Opponent Analysis ────────────────────────────────────────────────────────
  const [showOpponent, setShowOpponent] = useState(false);
  const [opponentIdx, setOpponentIdx] = useState(0);
  const [showCustomOpponent, setShowCustomOpponent] = useState(false);
  const [customOpponents, setCustomOpponents] = useState<typeof opponentPresets>([]);
  const [customForm, setCustomForm] = useState<CustomOpponent>({
    nameAr: "", nameEn: "", formation: "4-4-2",
    styleAr: "", styleEn: "",
    strengthsAr: "", strengthsEn: "",
    weaknessesAr: "", weaknessesEn: "",
  });

  // ── Video Analysis ───────────────────────────────────────────────────────────
  const [showVideoPanel, setShowVideoPanel] = useState(false);
  const [showTeamAnalysis, setShowTeamAnalysis] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [teamAName, setTeamAName] = useState(isRTL ? "فريقنا" : "Our Team");
  const [teamBName, setTeamBName] = useState(isRTL ? "الخصم" : "Opponent");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ─── Build players from formation template ───────────────────────────────────
  function buildPlayers(f: Formation): PitchPlayer[] {
    return formationTemplates[f].map((t, i) => ({
      id: i,
      ...t,
      ...(defaultPlayerData[t.number] ?? { nameAr: `لاعب ${t.number}`, nameEn: `Player ${t.number}`, rating: 75 }),
    }));
  }

  const changeFormation = (f: Formation) => {
    setFormation(f);
    setPlayers(buildPlayers(f));
    setSelectedPlayer(null);
  };

  // ─── Assign real player to pitch position ────────────────────────────────────
  const assignPlayer = (pitchId: number, dataPlayer: DataPlayer) => {
    setPlayers(prev => prev.map(p => p.id === pitchId ? {
      ...p,
      nameAr: dataPlayer.nameAr,
      nameEn: dataPlayer.nameEn,
      rating: dataPlayer.rating,
      linkedPlayerId: dataPlayer.id,
    } : p));
    setShowAssignModal(false);
    setAssigningPlayerId(null);
  };

  // ─── Save formation ──────────────────────────────────────────────────────────
  const saveFormation = () => {
    if (!formationName.trim()) return;
    const saved: SavedFormation = {
      id: Date.now().toString(),
      name: formationName.trim(),
      formation,
      players,
      savedAt: new Date().toISOString(),
    };
    const updated = [...savedFormations, saved];
    setSavedFormations(updated);
    localStorage.setItem("ada2ai_formations", JSON.stringify(updated));
    setFormationName("");
    setShowSaveModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const loadFormation = (saved: SavedFormation) => {
    setFormation(saved.formation);
    setPlayers(saved.players);
    setSelectedPlayer(null);
    setShowLoadModal(false);
  };

  const deleteFormation = (id: string) => {
    const updated = savedFormations.filter(f => f.id !== id);
    setSavedFormations(updated);
    localStorage.setItem("ada2ai_formations", JSON.stringify(updated));
  };

  // ─── Add custom opponent ─────────────────────────────────────────────────────
  const addCustomOpponent = () => {
    if (!customForm.nameAr && !customForm.nameEn) return;
    const newOpp = {
      nameAr: customForm.nameAr || customForm.nameEn,
      nameEn: customForm.nameEn || customForm.nameAr,
      formation: customForm.formation,
      style: { ar: customForm.styleAr, en: customForm.styleEn },
      strengths: {
        ar: customForm.strengthsAr.split("\n").filter(Boolean),
        en: customForm.strengthsEn.split("\n").filter(Boolean),
      },
      weaknesses: {
        ar: customForm.weaknessesAr.split("\n").filter(Boolean),
        en: customForm.weaknessesEn.split("\n").filter(Boolean),
      },
      radar: [
        { stat: "هجوم", statEn: "Attack",    value: 75 },
        { stat: "دفاع", statEn: "Defense",   value: 75 },
        { stat: "وسط",  statEn: "Midfield",  value: 75 },
        { stat: "سرعة", statEn: "Speed",     value: 75 },
        { stat: "ثبات", statEn: "Composure", value: 75 },
      ],
    };
    setCustomOpponents(prev => [...prev, newOpp]);
    setOpponentIdx(opponentPresets.length + customOpponents.length);
    setShowCustomOpponent(false);
    setCustomForm({ nameAr: "", nameEn: "", formation: "4-4-2", styleAr: "", styleEn: "", strengthsAr: "", strengthsEn: "", weaknessesAr: "", weaknessesEn: "" });
  };

  // ─── Video analysis ──────────────────────────────────────────────────────────
  const analyzeVideo = async () => {
    if (!videoFile) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      // Step 1: Convert video to base64
      const reader = new FileReader();
      const videoBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(videoFile);
      });

      // Step 2: Upload video to get frame URLs
      const uploadResponse = await fetch("/api/scout/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: videoBase64.split(",")[1], // Remove data:mime;base64, prefix
          mimeType: videoFile.type || "video/mp4",
          fileName: videoFile.name,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadResponse.json();
      const frameUrls = uploadData.frameUrls || [];
      const videoUrl = uploadData.url;

      if (frameUrls.length === 0) {
        throw new Error(isRTL ? "لم يتم استخراج إطارات من الفيديو" : "No frames extracted from video");
      }

      // Step 3: Analyze frames using Scout AI
      const analyzeResponse = await fetch("/api/scout/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frameUrls }),
      });

      if (!analyzeResponse.ok) {
        throw new Error("Analysis failed");
      }

      const report = await analyzeResponse.json();

      // Step 4: Transform report to VideoAnalysisResult format
      const result: VideoAnalysisResult = {
        team_0_name: teamAName || (isRTL ? "الفريق أ" : "Team A"),
        team_1_name: teamBName || (isRTL ? "الفريق ب" : "Team B"),
        team_0_possession: report.possession?.team_a || report.overallRating || 50,
        team_1_possession: report.possession?.team_b || (100 - (report.overallRating || 50)),
        team_0_area: report.area_control?.team_a || 50,
        team_1_area: report.area_control?.team_b || 50,
        team_0_goals: report.goals?.team_a || 0,
        team_1_goals: report.goals?.team_b || 0,
        team_0_shots: report.shots?.team_a || 0,
        team_1_shots: report.shots?.team_b || 0,
      };

      setAnalysisResult(result);
    } catch (err) {
      console.error("[Video Analysis] Error:", err);
      setAnalysisError(
        isRTL 
          ? "فشل تحليل الفيديو. تحقق من الاتصال." 
          : "Video analysis failed. Check connection."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ─── Drag logic (mouse + touch) ──────────────────────────────────────────────
  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = { id };
    setSelectedPlayer(id);
  }, []);

  const onMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingRef.current || !pitchRef.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = Math.min(98, Math.max(2, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(97, Math.max(3, ((clientY - rect.top) / rect.height) * 100));
    const id = draggingRef.current.id;
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
  }, []);

  const endDrag = useCallback(() => { draggingRef.current = null; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", endDrag);
    };
  }, [onMove, endDrag]);

  // ─── All opponents (presets + custom) ────────────────────────────────────────
  const allOpponents = [...opponentPresets, ...customOpponents];
  const opponent = allOpponents[Math.min(opponentIdx, allOpponents.length - 1)];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
    <div className="h-full overflow-y-auto" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
      <div className="p-4 lg:p-6 space-y-5">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: font }}>
              {isRTL ? "لوحة المدرب" : "Coach Dashboard"}
            </h1>
            <button
              onClick={startGuide}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
              style={{
                background: guideActive ? "rgba(0,220,200,0.15)" : "rgba(0,220,200,0.08)",
                color: "#00DCC8",
                border: "1px solid rgba(0,220,200,0.2)",
              }}
            >
              🐺 {isRTL ? "تفعيل المدرب الذكي" : "Activate AI Coach"}
            </button>{" "}
            <button
              onClick={() => setEyeActive(!eyeActive)}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
              style={{
                background: eyeActive ? "rgba(0,220,200,0.15)" : "rgba(0,220,200,0.08)",
                color: "#00DCC8",
                border: "1px solid rgba(0,220,200,0.2)",
              }}
            >
              👁 {isRTL ? "تفعيل العين" : "Activate Eye"}
            </button>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
              {isRTL ? "التكتيكات · أداء الفريق · تحليل الخصم · تحليل الفيديو" : "Tactics · Team Performance · Opponent Analysis · Video Analysis"}
            </p>
          </div>
        </div>

        {/* ── Save Success Toast ──────────────────────────────────────────────── */}
        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm" style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)", fontFamily: font }}>
            <CheckCircle size={14} />
            {isRTL ? "تم حفظ التشكيل بنجاح" : "Formation saved successfully"}
          </div>
        )}

        {/* ── Main Grid ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* ── Tactical Pitch ─────────────────────────────────────────────── */}
          <div className="xl:col-span-2 rounded-2xl p-4" style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>

            {/* Formation selector + actions */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
                {isRTL ? "التشكيل:" : "Formation:"}
              </span>
              {(["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"] as Formation[]).map(f => (
                <button key={f} onClick={() => changeFormation(f)}
                  className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: formation === f ? "rgba(0,220,200,0.15)" : "rgba(255,255,255,0.04)",
                    color: formation === f ? "#00DCC8" : "rgba(255,255,255,0.5)",
                    border: formation === f ? "1px solid rgba(0,220,200,0.3)" : "1px solid transparent",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}>
                  {f}
                </button>
              ))}
              <button onClick={() => { setPlayers(buildPlayers(formation)); setSelectedPlayer(null); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
                style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
                <RotateCcw size={11} /> {isRTL ? "إعادة" : "Reset"}
              </button>
              <button
                onClick={() => setTacticalMode(!tacticalMode)}
                title={isRTL ? "تبديل الوضع التكتيكي" : "Toggle Tactical Mode"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ms-auto"
                style={{
                  background: tacticalMode ? "#00A651" : "transparent",
                  color: tacticalMode ? "#fff" : "rgba(255,255,255,0.4)",
                  border: tacticalMode ? "1px solid #00A651" : "1px solid rgba(255,255,255,0.15)",
                  fontFamily: font,
                }}>
                🎯 {isRTL ? "تكتيكي" : "Tactical"}
              </button>
            </div>

            {/* Tactical Animation Controls */}
            {tacticalMode && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button onClick={tactical.togglePlay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: tactical.isPlaying ? "rgba(255,68,68,0.15)" : "rgba(0,220,200,0.15)",
                  color: tactical.isPlaying ? "#ff4444" : "#00DCC8",
                  border: tactical.isPlaying ? "1px solid rgba(255,68,68,0.3)" : "1px solid rgba(0,220,200,0.3)",
                  fontFamily: font,
                }}>
                {tactical.isPlaying ? (isRTL ? "⏸ إيقاف" : "⏸ Pause") : (isRTL ? "▶ تشغيل" : "▶ Play")}
              </button>
              <button onClick={tactical.stop}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all"
                style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", fontFamily: font }}>
                ⏹ {isRTL ? "إيقاف" : "Stop"}
              </button>
              <button onClick={tactical.prevScenario}
                className="px-2 py-1.5 rounded-lg text-xs transition-all"
                style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", fontFamily: font }}>
                ◀
              </button>
              <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.6)", fontFamily: font }}>
                {tactical.scenarioIndex + 1}/{tactical.totalScenarios}
              </span>
              <button onClick={tactical.nextScenario}
                className="px-2 py-1.5 rounded-lg text-xs transition-all"
                style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", fontFamily: font }}>
                ▶
              </button>
              {tactical.currentScenario && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: "#FFB800", background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.2)", fontFamily: font }}>
                  {isRTL ? tactical.currentScenario.nameAr : tactical.currentScenario.nameEn}
                </span>
              )}
              <div className="flex items-center gap-1 ms-auto">
                {[0, 1, 2, 3, 4].map(i => (
                  <button key={i} onClick={() => tactical.setScenarioIndex(i)}
                    className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center transition-all"
                    style={{
                      background: tactical.scenarioIndex === i ? "rgba(0,220,200,0.2)" : "rgba(255,255,255,0.04)",
                      color: tactical.scenarioIndex === i ? "#00DCC8" : "rgba(255,255,255,0.4)",
                      border: tactical.scenarioIndex === i ? "1px solid rgba(0,220,200,0.3)" : "1px solid transparent",
                    }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {(["GK", "DEF", "MID", "FWD"] as PlayerRole[]).map(r => (
                <div key={r} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: roleColors[r].bg }} />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: font }}>
                    {isRTL ? roleColors[r].labelAr : roleColors[r].label}
                  </span>
                </div>
              ))}
              <div className="ms-auto flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: font }}>
                <UserCheck size={11} />
                {isRTL ? "انقر مرتين لتعيين لاعب" : "Double-click to assign player"}
              </div>
            </div>

            {/* Pitch */}
            <div
              ref={pitchRef}
              data-pitch="true"
              className="relative rounded-xl overflow-hidden select-none"
              style={{ paddingTop: "62%", background: "linear-gradient(180deg, #1a4a2e 0%, #1e5233 50%, #1a4a2e 100%)", cursor: "default" }}
            >
              {/* SVG markings */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="1" y="1" width="98" height="98" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
                <line x1="1" y1="50" x2="99" y2="50" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
                <circle cx="50" cy="50" r="11" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
                <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.4)" />
                <rect x="22" y="1" width="56" height="17" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                <rect x="35" y="1" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                <circle cx="50" cy="12" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" strokeDasharray="2 2" />
                <rect x="22" y="82" width="56" height="17" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                <rect x="35" y="92" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                <circle cx="50" cy="88" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" strokeDasharray="2 2" />
                <rect x="42" y="0" width="16" height="2" fill="rgba(255,255,255,0.15)" />
                <rect x="42" y="98" width="16" height="2" fill="rgba(255,255,255,0.15)" />
                {[10, 20, 30, 40, 60, 70, 80, 90].map(y => (
                  <rect key={y} x="1" y={y - 5} width="98" height="10" fill="rgba(0,0,0,0.04)" />
                ))}

                {/* Tactical animation overlays */}
                {tacticalMode && (<>
                {/* SVG defs for arrow markers */}
                <defs>
                  <marker id="passArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#00ff88" />
                  </marker>
                  <marker id="pressArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff4444" />
                  </marker>
                </defs>

                {/* Pressure zone heatmap */}
                {tactical.pressureZones.map((zone, i) => (
                  <rect key={`pz-${i}`} x={zone.x} y={zone.y} width={zone.width} height={zone.height}
                    fill={`rgba(${zone.color},${zone.intensity * 0.35})`}
                    rx="1" ry="1"
                  />
                ))}

                {/* Pass arrows */}
                {tactical.activePasses.map((pass, i) => {
                  const fromP = players.find(p => p.number === pass.fromPlayer);
                  const toP = players.find(p => p.number === pass.toPlayer);
                  if (!fromP || !toP) return null;
                  const passColors: Record<string, string> = { short: "#00ff88", long: "#00ccff", through: "#ffcc00", cross: "#ff88ff", back: "#888888" };
                  const color = passColors[pass.type] || "#00ff88";
                  const fromPos = tactical.animatedPositions[fromP.id] || { x: fromP.x, y: fromP.y };
                  const toPos = tactical.animatedPositions[toP.id] || { x: toP.x, y: toP.y };
                  return (
                    <line key={`pass-${i}`}
                      x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y}
                      stroke={color} strokeWidth="0.6" markerEnd="url(#passArrow)" opacity="0.8"
                    />
                  );
                })}

                {/* Press arrows */}
                {tactical.activePresses.map((press, i) => {
                  const fromP = players.find(p => p.number === press.fromPlayer);
                  if (!fromP) return null;
                  const fromPos = tactical.animatedPositions[fromP.id] || { x: fromP.x, y: fromP.y };
                  return (
                    <line key={`press-${i}`}
                      x1={fromPos.x} y1={fromPos.y} x2={press.targetX} y2={press.targetY}
                      stroke="#ff4444" strokeWidth="0.5" strokeDasharray="1.5 1" markerEnd="url(#pressArrow)" opacity="0.7"
                    />
                  );
                })}
                </>)}
              </svg>

              {/* Highlight Overlay */}
              <HighlightOverlay
                highlights={currentHighlights.map(h => ({
                  ...h,
                  label: typeof h.label === 'function' ? h.label(isRTL) : h.label,
                }))}
                isActive={highlightActive}
                language={isRTL ? "ar" : "en"}
              />

              {/* Formation label */}
              <div className="absolute bottom-2 start-3 text-xs font-black" style={{ color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif", zIndex: 10 }}>
                {formation}
              </div>
              <div className="absolute bottom-2 end-3 text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font, zIndex: 10 }}>
                {tacticalMode && tactical.isPlaying
                  ? "🔄 " + (isRTL ? "تشغيل تكتيكي—" + tactical.phaseLabel : "Tactical: " + (tactical.currentScenario?.nameEn || ""))
                  : (isRTL ? "اسحب اللاعبين لتحريكهم" : "Drag players to move")}
              </div>

              {/* Players */}
              {players.map(player => {
                const rc = roleColors[player.role];
                const isSelected = selectedPlayer === player.id;
                const isLinked = !!player.linkedPlayerId;
                return (
                  <div
                    key={player.id}
                    className="absolute flex flex-col items-center"
                    data-role={player.role}
                    style={{
                      left: `${(tacticalMode ? tactical.animatedPositions[player.id]?.x ?? player.x : player.x)}%`,
                      top: `${(tacticalMode ? tactical.animatedPositions[player.id]?.y ?? player.y : player.y)}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isSelected ? 20 : 10,
                      cursor: "grab",
                      userSelect: "none",
                    }}
                    onMouseDown={e => startDrag(e, player.id)}
                    onTouchStart={e => startDrag(e, player.id)}
                    onDoubleClick={() => { setAssigningPlayerId(player.id); setShowAssignModal(true); }}
                  >
                    {player.hasWarning && (
                      <div className="absolute -top-2 -end-1 text-yellow-400" style={{ fontSize: "9px", zIndex: 21 }}>⚠</div>
                    )}
                    {isLinked && (
                      <div className="absolute -top-2 start-0 text-teal-400" style={{ fontSize: "8px", zIndex: 21 }}>✓</div>
                    )}
                    <div
                      className="absolute -top-2.5 start-1/2 -translate-x-1/2 text-white font-black rounded-full px-1"
                      style={{
                        fontSize: "7px",
                        background: "#0A0E1A",
                        border: `1px solid ${rc.border}`,
                        whiteSpace: "nowrap",
                        zIndex: 21,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {player.rating}
                    </div>
                    <div
                      className="flex items-center justify-center font-black rounded-full border-2 transition-transform"
                      style={{
                        width: isSelected ? "34px" : "30px",
                        height: isSelected ? "34px" : "30px",
                        background: rc.bg,
                        borderColor: isSelected ? "#fff" : isLinked ? "#00DCC8" : rc.border,
                        color: "#fff",
                        fontSize: "11px",
                        fontFamily: "'Space Grotesk', sans-serif",
                        boxShadow: isSelected ? `0 0 12px ${rc.bg}` : isLinked ? "0 0 8px rgba(0,220,200,0.4)" : `0 2px 8px rgba(0,0,0,0.4)`,
                        transform: isSelected ? "scale(1.1)" : "scale(1)",
                        transition: tacticalMode && tactical.isPlaying ? "left 0.3s ease, top 0.3s ease, transform 0.15s ease" : "transform 0.15s ease",
                      }}
                    >
                      {player.number}
                    </div>
                    <div
                      className="mt-0.5 px-1 rounded text-white text-center"
                      style={{
                        fontSize: "6.5px",
                        background: "rgba(0,0,0,0.7)",
                        fontFamily: font,
                        whiteSpace: "nowrap",
                        maxWidth: "44px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {isRTL ? player.nameAr : player.nameEn}
                    </div>
                  </div>
                );
              })}
            </div>
            {tacticalMode && tactical.isPlaying && (
              <div className="mt-2 relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="absolute inset-y-0 start-0 rounded-full transition-all duration-100"
                  style={{ width: (tactical.progress * 100) + "%", background: "linear-gradient(90deg, #00DCC8, #00A651)" }}
                />
              </div>
            )}
          </div>

          {/* ── Right Panel ────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Selected player info */}
            {selectedPlayer !== null && (() => {
              const p = players.find(pl => pl.id === selectedPlayer);
              if (!p) return null;
              const rc = roleColors[p.role];
              return (
                <div className="rounded-2xl p-4" style={{ background: "#0D1220", border: `1px solid ${rc.border}30` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm"
                      style={{ background: rc.bg, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {p.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm truncate" style={{ fontFamily: font }}>
                        {isRTL ? p.nameAr : p.nameEn}
                      </div>
                      <div className="text-xs" style={{ color: rc.border, fontFamily: font }}>
                        {isRTL ? roleColors[p.role].labelAr : roleColors[p.role].label} · {p.rating}
                      </div>
                    </div>
                    <button
                      onClick={() => { setAssigningPlayerId(p.id); setShowAssignModal(true); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                      style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.15)", fontFamily: font }}
                    >
                      <Users size={10} />
                      {isRTL ? "تعيين" : "Assign"}
                    </button>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${p.rating}%`, background: `linear-gradient(90deg, ${rc.bg}, ${rc.border})` }} />
                  </div>
                  {p.hasWarning && (
                    <div className="flex items-center gap-1.5 mt-2 text-yellow-400 text-xs" style={{ fontFamily: font }}>
                      <AlertTriangle size={11} />
                      {isRTL ? "يحتاج متابعة" : "Needs attention"}
                    </div>
                  )}
                  {p.linkedPlayerId && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "#00DCC8", fontFamily: font }}>
                      <CheckCircle size={11} />
                      {isRTL ? "مرتبط بقاعدة البيانات" : "Linked to database"}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Formation stats */}
            <div className="rounded-2xl p-4" style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2" style={{ fontFamily: font }}>
                <Activity size={14} style={{ color: "#00DCC8" }} />
                {isRTL ? "إحصائيات التشكيل" : "Formation Stats"}
              </h3>
              {[
                { labelAr: "الهجوم",    labelEn: "Attack",     value: formation === "4-3-3" ? 85 : formation === "4-4-2" ? 78 : formation === "3-5-2" ? 72 : 80, color: "#EF4444" },
                { labelAr: "الدفاع",    labelEn: "Defense",    value: formation === "4-3-3" ? 70 : formation === "4-4-2" ? 80 : formation === "3-5-2" ? 88 : 75, color: "#3B82F6" },
                { labelAr: "الاستحواذ", labelEn: "Possession", value: formation === "4-3-3" ? 75 : formation === "4-4-2" ? 72 : formation === "3-5-2" ? 80 : 87, color: "#22C55E" },
                { labelAr: "الضغط",     labelEn: "Press",      value: formation === "4-3-3" ? 82 : formation === "4-4-2" ? 70 : formation === "3-5-2" ? 76 : 78, color: "#F59E0B" },
              ].map((s, i) => (
                <div key={i} className="mb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)", fontFamily: font }}>{isRTL ? s.labelAr : s.labelEn}</span>
                    <span className="text-xs font-bold" style={{ color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.value}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Tactical notes */}
            <div className="rounded-2xl p-4" style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="font-bold text-white text-sm mb-2" style={{ fontFamily: font }}>
                {isRTL ? "ملاحظات تكتيكية" : "Tactical Notes"}
              </h3>
              <textarea
                rows={3}
                value={tacticalNotes}
                onChange={e => setTacticalNotes(e.target.value)}
                placeholder={isRTL ? "اكتب ملاحظاتك التكتيكية هنا..." : "Write your tactical notes here..."}
                className="w-full text-sm text-white placeholder-white/25 resize-none focus:outline-none rounded-lg p-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: font, direction: isRTL ? "rtl" : "ltr" }}
              />

            {/* AI Agent Ask */}
            <div className="rounded-2xl p-4 mt-3" style={{ background: "#0D1220", border: "1px solid rgba(0,212,255,0.12)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Brain size={14} style={{ color: "#00D4FF" }} />
                <h3 className="font-bold text-white text-sm" style={{ fontFamily: font }}>
                  {isRTL ? "اسأل الذكاء الاصطناعي" : "Ask AI"}
                </h3>
                {a2a.isLoading && <Loader2 size={14} className="animate-spin" style={{ color: "#00D4FF" }} />}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={e => setAiQuestion(e.target.value)}
                  onKeyDown={async e => {
                    if (e.key === "Enter" && aiQuestion.trim()) {
                      const res = await a2a.ask(aiQuestion.trim());
                      setAiAnswer(res.text || res.error || "");
                      setAiQuestion("");
                    }
                  }}
                  placeholder={isRTL ? "اسأل عن التكتيك، اللاعبين، الأداء..." : "Ask about tactics, players, performance..."}
                  className="flex-1 text-sm text-white placeholder-white/25 focus:outline-none rounded-lg px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,212,255,0.15)", fontFamily: font, direction: isRTL ? "rtl" : "ltr" }}
                  disabled={a2a.isLoading}
                />
                <button
                  onClick={async () => {
                    if (aiQuestion.trim()) {
                      const res = await a2a.ask(aiQuestion.trim());
                      setAiAnswer(res.text || res.error || "");
                      setAiQuestion("");
                    }
                  }}
                  disabled={!aiQuestion.trim() || a2a.isLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0A0E1A", fontFamily: font }}
                >
                  <Brain size={12} />
                  {isRTL ? "اسأل" : "Ask"}
                </button>
              </div>
              {(a2a.streamingText || aiAnswer) && (
                <div className="mt-2 rounded-lg p-3 text-sm" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)", color: "rgba(255,255,255,0.85)", fontFamily: font, direction: isRTL ? "rtl" : "ltr" }}>
                  {a2a.streamingText || aiAnswer}
                </div>
              )}
              {a2a.lastTrace && <AgentTracePanel trace={a2a.lastTrace} totalDurationMs={a2a.lastDuration ?? undefined} lang={isRTL ? "ar" : "en"} compact />}
            </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap mt-3">
                {/* Save Formation */}
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "rgba(34,197,94,0.08)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)", fontFamily: font }}
                >
                  <Save size={13} />
                  {isRTL ? "حفظ التشكيل" : "Save"}
                </button>
                {/* Load Formation */}
                <button
                  onClick={() => setShowLoadModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "rgba(59,130,246,0.08)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)", fontFamily: font }}
                >
                  <FolderOpen size={13} />
                  {isRTL ? `التشكيلات (${savedFormations.length})` : `Load (${savedFormations.length})`}
                </button>
                {/* Ask AI */}
                <button
                  onClick={() => (onNavigate || (() => {}))("ai-chat", {
                    prompt: isRTL ? "اقترح أفضل تشكيل للمباراة القادمة بناءً على أداء الفريق" : "Suggest the best formation for the next match based on team performance"
                  })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.2)", fontFamily: font }}
                >
                  <Brain size={13} />
                  {isRTL ? "استشر AI" : "Ask AI"}
                </button>
                {/* Demo Video */}
                <Link href="/demo-video">
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(168,85,247,0.08)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.2)", fontFamily: font }}
                  >
                    <Video size={13} />
                    Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Team Performance Chart ──────────────────────────────────────────── */}
        <div className="rounded-2xl p-5" style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} style={{ color: "#00DCC8" }} />
            <h2 className="font-bold text-white text-base" style={{ fontFamily: font }}>
              {isRTL ? "أداء الفريق — آخر 5 مباريات" : "Team Performance — Last 5 Matches"}
            </h2>
          </div>
          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={isRTL ? "match" : "matchEn"} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: font }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "'Space Grotesk', sans-serif" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontFamily: font }} labelStyle={{ color: "#fff", fontWeight: "bold" }} itemStyle={{ fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontFamily: font, fontSize: "11px", paddingTop: "8px" }}
                  formatter={(value) => {
                    const map: Record<string, { ar: string; en: string }> = {
                      attack: { ar: "هجوم", en: "Attack" },
                      defense: { ar: "دفاع", en: "Defense" },
                      possession: { ar: "استحواذ", en: "Possession" },
                    };
                    return isRTL ? (map[value]?.ar ?? value) : (map[value]?.en ?? value);
                  }}
                />
                <Line type="monotone" dataKey="attack"     stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4, fill: "#EF4444" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="defense"    stroke="#60A5FA" strokeWidth={2.5} dot={{ r: 4, fill: "#60A5FA" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="possession" stroke="#4ADE80" strokeWidth={2.5} dot={{ r: 4, fill: "#4ADE80" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Video Analysis Panel ────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            className="w-full flex items-center justify-between p-5"
            onClick={() => setShowVideoPanel(!showVideoPanel)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,122,186,0.12)" }}>
                <Video size={16} style={{ color: "#60A5FA" }} />
              </div>
              <div className="text-start">
                <h2 className="font-bold text-white text-base" style={{ fontFamily: font }}>
                  {isRTL ? "تحليل فيديو المباراة" : "Match Video Analysis"}
                </h2>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
                  {isRTL ? "YOLO + Kmeans + Voronoi — استحواذ، مناطق، إحصائيات" : "YOLO + Kmeans + Voronoi — possession, areas, stats"}
                </p>
              </div>
            </div>
            {showVideoPanel ? <ChevronUp size={18} style={{ color: "rgba(255,255,255,0.4)" }} /> : <ChevronDown size={18} style={{ color: "rgba(255,255,255,0.4)" }} />}
          </button>

          {showVideoPanel && (
            <div className="px-5 pb-5 space-y-4">
              {/* Team names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.5)", fontFamily: font }}>
                    {isRTL ? "اسم فريقنا" : "Our Team Name"}
                  </label>
                  <input
                    value={teamAName}
                    onChange={e => setTeamAName(e.target.value)}
                    className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: font, direction: isRTL ? "rtl" : "ltr" }}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.5)", fontFamily: font }}>
                    {isRTL ? "اسم الخصم" : "Opponent Name"}
                  </label>
                  <input
                    value={teamBName}
                    onChange={e => setTeamBName(e.target.value)}
                    className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: font, direction: isRTL ? "rtl" : "ltr" }}
                  />
                </div>
              </div>

              {/* Video upload */}
              <div
                className="rounded-xl p-6 text-center cursor-pointer transition-all"
                style={{ background: videoFile ? "rgba(0,220,200,0.05)" : "rgba(255,255,255,0.02)", border: videoFile ? "1px solid rgba(0,220,200,0.2)" : "2px dashed rgba(255,255,255,0.1)" }}
                onClick={() => videoInputRef.current?.click()}
              >
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files?.[0] ?? null)} />
                {videoFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <Video size={20} style={{ color: "#00DCC8" }} />
                    <div className="text-start">
                      <div className="text-sm font-semibold text-white" style={{ fontFamily: font }}>{videoFile.name}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
                        {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setVideoFile(null); setAnalysisResult(null); }}
                      className="ms-auto p-1 rounded-full" style={{ color: "rgba(255,255,255,0.4)" }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: font }}>
                      {isRTL ? "انقر لرفع فيديو المباراة" : "Click to upload match video"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)", fontFamily: font }}>
                      MP4, MOV, AVI — {isRTL ? "حتى 500 ميجابايت" : "up to 500 MB"}
                    </p>
                  </>
                )}
              </div>

              {/* Analyze button */}
              <button
                onClick={analyzeVideo}
                disabled={!videoFile || analyzing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: !videoFile || analyzing ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #007ABA, #00DCC8)",
                  color: !videoFile || analyzing ? "rgba(255,255,255,0.3)" : "#fff",
                  fontFamily: font,
                  cursor: !videoFile || analyzing ? "not-allowed" : "pointer",
                }}
              >
                {analyzing ? (
                  <><Loader2 size={16} className="animate-spin" /> {isRTL ? "جاري التحليل..." : "Analyzing..."}</>
                ) : (
                  <><Brain size={16} /> {isRTL ? "تحليل الفيديو بالذكاء الاصطناعي" : "Analyze with AI"}</>
                )}
              </button>

              {/* Analysis error */}
              {analysisError && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.15)", fontFamily: font }}>
                  <AlertTriangle size={14} />
                  {analysisError}
                </div>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: "#22C55E" }} />
                    <span className="text-sm font-semibold" style={{ color: "#22C55E", fontFamily: font }}>
                      {isRTL ? "اكتمل التحليل" : "Analysis Complete"}
                    </span>
                  </div>

                  {/* Score */}
                  {(analysisResult.team_0_goals !== undefined) && (
                    <div className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>{analysisResult.team_0_name}</div>
                          <div className="text-4xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{analysisResult.team_0_goals}</div>
                        </div>
                        <div className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Space Grotesk', sans-serif" }}>:</div>
                        <div className="text-center">
                          <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>{analysisResult.team_1_name}</div>
                          <div className="text-4xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{analysisResult.team_1_goals}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Possession bars */}
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h4 className="text-xs font-bold mb-3" style={{ color: "rgba(255,255,255,0.6)", fontFamily: font }}>
                      {isRTL ? "الاستحواذ" : "Ball Possession"}
                    </h4>
                    <div className="space-y-3">
                      {[
                        { name: analysisResult.team_0_name, value: analysisResult.team_0_possession, color: "#00DCC8" },
                        { name: analysisResult.team_1_name, value: analysisResult.team_1_possession, color: "#EF4444" },
                      ].map((t, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)", fontFamily: font }}>{t.name}</span>
                            <span className="text-xs font-bold" style={{ color: t.color, fontFamily: "'Space Grotesk', sans-serif" }}>{t.value.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${t.value}%`, background: t.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Voronoi field visualization */}
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h4 className="text-xs font-bold mb-3" style={{ color: "rgba(255,255,255,0.6)", fontFamily: font }}>
                      {isRTL ? "مناطق السيطرة (Voronoi)" : "Control Areas (Voronoi)"}
                    </h4>
                    <div className="relative rounded-lg overflow-hidden" style={{ paddingTop: "45%", background: "linear-gradient(180deg, #1a4a2e 0%, #1e5233 100%)" }}>
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                        {/* Team 0 area */}
                        <rect x="0" y="0" width={analysisResult.team_0_area} height="50" fill="rgba(0,220,200,0.25)" />
                        {/* Team 1 area */}
                        <rect x={analysisResult.team_0_area} y="0" width={analysisResult.team_1_area} height="50" fill="rgba(239,68,68,0.25)" />
                        {/* Dividing line */}
                        <line x1={analysisResult.team_0_area} y1="0" x2={analysisResult.team_0_area} y2="50" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" strokeDasharray="2 1" />
                        {/* Pitch markings */}
                        <rect x="1" y="1" width="98" height="48" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                        <line x1="1" y1="25" x2="99" y2="25" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                        <circle cx="50" cy="25" r="6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                        {/* Labels */}
                        <text x={analysisResult.team_0_area / 2} y="26" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="4" fontWeight="bold">
                          {analysisResult.team_0_area.toFixed(0)}%
                        </text>
                        <text x={analysisResult.team_0_area + analysisResult.team_1_area / 2} y="26" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="4" fontWeight="bold">
                          {analysisResult.team_1_area.toFixed(0)}%
                        </text>
                      </svg>
                      {/* Team labels */}
                      <div className="absolute bottom-1 start-2 text-xs font-bold" style={{ color: "#00DCC8", fontFamily: font, fontSize: "10px" }}>
                        {analysisResult.team_0_name}
                      </div>
                      <div className="absolute bottom-1 end-2 text-xs font-bold" style={{ color: "#EF4444", fontFamily: font, fontSize: "10px" }}>
                        {analysisResult.team_1_name}
                      </div>
                    </div>
                  </div>

                  {/* Shots stats */}
                  {analysisResult.team_0_shots !== undefined && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: isRTL ? "تسديدات فريقنا" : "Our Shots", value: analysisResult.team_0_shots, color: "#00DCC8" },
                        { label: isRTL ? "تسديدات الخصم" : "Opponent Shots", value: analysisResult.team_1_shots, color: "#EF4444" },
                      ].map((s, i) => (
                        <div key={i} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="text-2xl font-black" style={{ color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                          <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ask AI about results */}
                  <button
                    onClick={() => (onNavigate || (() => {}))("ai-chat", {
                      prompt: isRTL
                        ? `حلل نتائج المباراة: ${analysisResult.team_0_name} (استحواذ ${analysisResult.team_0_possession.toFixed(1)}%, مساحة ${analysisResult.team_0_area.toFixed(0)}%) مقابل ${analysisResult.team_1_name} (استحواذ ${analysisResult.team_1_possession.toFixed(1)}%, مساحة ${analysisResult.team_1_area.toFixed(0)}%). ما هي التوصيات التكتيكية للمباراة القادمة؟`
                        : `Analyze match results: ${analysisResult.team_0_name} (possession ${analysisResult.team_0_possession.toFixed(1)}%, area ${analysisResult.team_0_area.toFixed(0)}%) vs ${analysisResult.team_1_name} (possession ${analysisResult.team_1_possession.toFixed(1)}%, area ${analysisResult.team_1_area.toFixed(0)}%). What are the tactical recommendations for the next match?`
                    })}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.2)", fontFamily: font }}
                  >
                    <Brain size={14} />
                    {isRTL ? "تحليل AI للنتائج" : "AI Analysis of Results"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Opponent Analysis ───────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            className="w-full flex items-center justify-between p-5"
            onClick={() => setShowOpponent(!showOpponent)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
                <Eye size={16} style={{ color: "#EF4444" }} />
              </div>
              <div className="text-start">
                <h2 className="font-bold text-white text-base" style={{ fontFamily: font }}>
                  {isRTL ? "تحليل الفريق الخصم" : "Opponent Analysis"}
                </h2>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
                  {isRTL ? "نقاط القوة والضعف وأسلوب اللعب" : "Strengths, weaknesses & playing style"}
                </p>
              </div>
            </div>
            {showOpponent ? <ChevronUp size={18} style={{ color: "rgba(255,255,255,0.4)" }} /> : <ChevronDown size={18} style={{ color: "rgba(255,255,255,0.4)" }} />}
          </button>

          {showOpponent && (
            <div className="px-5 pb-5 space-y-5">
              {/* Opponent selector + Add custom */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
                  {isRTL ? "الخصم:" : "Opponent:"}
                </span>
                {allOpponents.map((op, i) => (
                  <button key={i} onClick={() => setOpponentIdx(i)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: opponentIdx === i ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                      color: opponentIdx === i ? "#EF4444" : "rgba(255,255,255,0.5)",
                      border: opponentIdx === i ? "1px solid rgba(239,68,68,0.3)" : "1px solid transparent",
                      fontFamily: font,
                    }}>
                    {isRTL ? op.nameAr : op.nameEn}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomOpponent(!showCustomOpponent)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.2)", fontFamily: font }}
                >
                  <Plus size={11} />
                  {isRTL ? "إضافة خصم" : "Add Opponent"}
                </button>
              </div>

              {/* Custom opponent form */}
              {showCustomOpponent && (
                <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(0,220,200,0.04)", border: "1px solid rgba(0,220,200,0.15)" }}>
                  <h4 className="font-bold text-sm" style={{ color: "#00DCC8", fontFamily: font }}>
                    {isRTL ? "إضافة فريق خصم مخصص" : "Add Custom Opponent"}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.5)", fontFamily: font }}>{isRTL ? "الاسم عربي" : "Name (Arabic)"}</label>
                      <input value={customForm.nameAr} onChange={e => setCustomForm(f => ({ ...f, nameAr: e.target.value }))}
                        className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: font, direction: "rtl" }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.5)", fontFamily: font }}>{isRTL ? "الاسم إنجليزي" : "Name (English)"}</label>
                      <input value={customForm.nameEn} onChange={e => setCustomForm(f => ({ ...f, nameEn: e.target.value }))}
                        className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Space Grotesk', sans-serif" }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.5)", fontFamily: font }}>{isRTL ? "التشكيل" : "Formation"}</label>
                    <select value={customForm.formation} onChange={e => setCustomForm(f => ({ ...f, formation: e.target.value }))}
                      className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {["4-3-3", "4-4-2", "3-5-2", "4-2-3-1", "5-3-2", "4-5-1"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.5)", fontFamily: font }}>{isRTL ? "أسلوب اللعب (عربي)" : "Style (Arabic)"}</label>
                      <input value={customForm.styleAr} onChange={e => setCustomForm(f => ({ ...f, styleAr: e.target.value }))}
                        className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: font, direction: "rtl" }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.5)", fontFamily: font }}>{isRTL ? "أسلوب اللعب (إنجليزي)" : "Style (English)"}</label>
                      <input value={customForm.styleEn} onChange={e => setCustomForm(f => ({ ...f, styleEn: e.target.value }))}
                        className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Space Grotesk', sans-serif" }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "#22C55E", fontFamily: font }}>{isRTL ? "نقاط القوة (عربي، سطر لكل نقطة)" : "Strengths (Arabic, one per line)"}</label>
                      <textarea rows={3} value={customForm.strengthsAr} onChange={e => setCustomForm(f => ({ ...f, strengthsAr: e.target.value }))}
                        className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2 resize-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", fontFamily: font, direction: "rtl" }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "#22C55E", fontFamily: font }}>{isRTL ? "نقاط القوة (إنجليزي)" : "Strengths (English, one per line)"}</label>
                      <textarea rows={3} value={customForm.strengthsEn} onChange={e => setCustomForm(f => ({ ...f, strengthsEn: e.target.value }))}
                        className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2 resize-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", fontFamily: "'Space Grotesk', sans-serif" }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "#EF4444", fontFamily: font }}>{isRTL ? "نقاط الضعف (عربي)" : "Weaknesses (Arabic, one per line)"}</label>
                      <textarea rows={3} value={customForm.weaknessesAr} onChange={e => setCustomForm(f => ({ ...f, weaknessesAr: e.target.value }))}
                        className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2 resize-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(239,68,68,0.2)", fontFamily: font, direction: "rtl" }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "#EF4444", fontFamily: font }}>{isRTL ? "نقاط الضعف (إنجليزي)" : "Weaknesses (English, one per line)"}</label>
                      <textarea rows={3} value={customForm.weaknessesEn} onChange={e => setCustomForm(f => ({ ...f, weaknessesEn: e.target.value }))}
                        className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2 resize-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "'Space Grotesk', sans-serif" }} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowCustomOpponent(false)}
                      className="px-4 py-2 rounded-lg text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
                      {isRTL ? "إلغاء" : "Cancel"}
                    </button>
                    <button onClick={addCustomOpponent}
                      className="px-4 py-2 rounded-lg text-xs font-bold"
                      style={{ background: "rgba(0,220,200,0.15)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.3)", fontFamily: font }}>
                      {isRTL ? "إضافة الفريق" : "Add Team"}
                    </button>
                  </div>
                </div>
              )}

              {/* Opponent details */}
              {opponent && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="rounded-xl p-4" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={14} style={{ color: "#22C55E" }} />
                      <h3 className="font-bold text-sm" style={{ color: "#22C55E", fontFamily: font }}>{isRTL ? "نقاط القوة" : "Strengths"}</h3>
                    </div>
                    <ul className="space-y-2">
                      {(isRTL ? opponent.strengths.ar : opponent.strengths.en).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgba(255,255,255,0.7)", fontFamily: font }}>
                          <span style={{ color: "#22C55E", marginTop: "2px", flexShrink: 0 }}>●</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={14} style={{ color: "#EF4444" }} />
                      <h3 className="font-bold text-sm" style={{ color: "#EF4444", fontFamily: font }}>{isRTL ? "نقاط الضعف" : "Weaknesses"}</h3>
                    </div>
                    <ul className="space-y-2">
                      {(isRTL ? opponent.weaknesses.ar : opponent.weaknesses.en).map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgba(255,255,255,0.7)", fontFamily: font }}>
                          <span style={{ color: "#EF4444", marginTop: "2px", flexShrink: 0 }}>●</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl p-4" style={{ background: "rgba(0,122,186,0.06)", border: "1px solid rgba(0,122,186,0.2)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Swords size={14} style={{ color: "#60A5FA" }} />
                        <h3 className="font-bold text-sm" style={{ color: "#60A5FA", fontFamily: font }}>{isRTL ? "أسلوب اللعب" : "Playing Style"}</h3>
                      </div>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)", fontFamily: font, lineHeight: "1.6" }}>
                        {isRTL ? opponent.style.ar : opponent.style.en}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Shield size={11} style={{ color: "rgba(255,255,255,0.4)" }} />
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>{opponent.formation}</span>
                      </div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ height: "160px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={opponent.radar}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey={isRTL ? "stat" : "statEn"} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 9, fontFamily: font }} />
                            <Radar name={isRTL ? opponent.nameAr : opponent.nameEn} dataKey="value" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} strokeWidth={1.5} />
                            <Tooltip contentStyle={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontFamily: font, fontSize: "11px" }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Recommendation */}
              {opponent && (
                <div className="rounded-xl p-4" style={{ background: "rgba(0,220,200,0.05)", border: "1px solid rgba(0,220,200,0.15)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={14} style={{ color: "#00DCC8" }} />
                    <h3 className="font-bold text-sm" style={{ color: "#00DCC8", fontFamily: font }}>
                      {isRTL ? "توصية AI للمباراة" : "AI Match Recommendation"}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontFamily: font }}>
                    {isRTL
                      ? `بناءً على تحليل ${opponent.nameAr} (${opponent.formation})، يُنصح باستخدام تشكيل ${formation} مع التركيز على استغلال ${(opponent.weaknesses.ar[0] || "نقاط الضعف").toLowerCase()}. استخدم الضغط العالي في الشوط الأول للاستفادة من ${(opponent.weaknesses.ar[2] || "الإرهاق").toLowerCase()}.`
                      : `Based on ${opponent.nameEn}'s analysis (${opponent.formation}), it's recommended to use ${formation} focusing on exploiting ${(opponent.weaknesses.en[0] || "weaknesses").toLowerCase()}. Apply high press in the first half to take advantage of ${(opponent.weaknesses.en[2] || "fatigue").toLowerCase()}.`
                    }
                  </p>
                  <button
                    onClick={() => (onNavigate || (() => {}))("ai-chat", {
                      prompt: isRTL
                        ? `حلل فريق ${opponent.nameAr} وأعطني خطة تكتيكية مفصلة للفوز عليهم باستخدام تشكيل ${formation}`
                        : `Analyze ${opponent.nameEn} and give me a detailed tactical plan to beat them using ${formation} formation`
                    })}
                    className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(0,220,200,0.1)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.2)", fontFamily: font }}
                  >
                    <Brain size={12} />
                    {isRTL ? "تحليل AI مفصل" : "Detailed AI Analysis"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Team Analysis Panel (نادي النهضة) ───────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0D1220", border: "1px solid rgba(0,194,168,0.15)" }}>
        <button
          className="w-full flex items-center justify-between p-5"
          onClick={() => setShowTeamAnalysis(!showTeamAnalysis)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,194,168,0.12)" }}>
              <BarChart3 size={16} style={{ color: "#00C2A8" }} />
            </div>
            <div className="text-start">
              <h2 className="font-bold text-white text-base" style={{ fontFamily: font }}>
                {isRTL ? "تحليل الفريق — نادي النهضة" : "Team Analysis — Nahda FC"}
              </h2>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
                {isRTL ? "بالتعاون مع Ada2ai · معايير SAFF + FIFA · Radar Chart + تصدير PDF" : "In partnership with Ada2ai · SAFF + FIFA standards · Radar Chart + PDF export"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(0,194,168,0.1)", color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>
              نادي النهضة
            </div>
            {showTeamAnalysis ? <ChevronUp size={18} style={{ color: "rgba(255,255,255,0.4)" }} /> : <ChevronDown size={18} style={{ color: "rgba(255,255,255,0.4)" }} />}
          </div>
        </button>
        {showTeamAnalysis && (
          <div className="px-5 pb-5">
            <TeamAnalysisTab lang={lang} />
          </div>
        )}
      </div>

      {/* ── Save Formation Modal ────────────────────────────────────────────────────── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 className="font-bold text-white text-base mb-4" style={{ fontFamily: font }}>
              {isRTL ? "حفظ التشكيل" : "Save Formation"}
            </h3>
            <input
              value={formationName}
              onChange={e => setFormationName(e.target.value)}
              placeholder={isRTL ? "اسم التشكيل (مثال: تشكيل المباراة الكبيرة)" : "Formation name (e.g. Big Match Setup)"}
              className="w-full text-sm text-white focus:outline-none rounded-lg px-3 py-2.5 mb-4"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", fontFamily: font, direction: isRTL ? "rtl" : "ltr" }}
              onKeyDown={e => e.key === "Enter" && saveFormation()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-lg text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button onClick={saveFormation} disabled={!formationName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)", fontFamily: font, opacity: formationName.trim() ? 1 : 0.4 }}>
                {isRTL ? "حفظ" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Load Formation Modal ──────────────────────────────────────────────── */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base" style={{ fontFamily: font }}>
                {isRTL ? "التشكيلات المحفوظة" : "Saved Formations"}
              </h3>
              <button onClick={() => setShowLoadModal(false)} style={{ color: "rgba(255,255,255,0.4)" }}>
                <X size={18} />
              </button>
            </div>
            {savedFormations.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.3)", fontFamily: font }}>
                {isRTL ? "لا توجد تشكيلات محفوظة بعد" : "No saved formations yet"}
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedFormations.map(sf => (
                  <div key={sf.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate" style={{ fontFamily: font }}>{sf.name}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Grotesk', sans-serif" }}>
                        {sf.formation} · {new Date(sf.savedAt).toLocaleDateString(isRTL ? "ar-SA" : "en-US")}
                      </div>
                    </div>
                    <button onClick={() => loadFormation(sf)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "rgba(59,130,246,0.12)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)", fontFamily: font }}>
                      {isRTL ? "تحميل" : "Load"}
                    </button>
                    <button onClick={() => deleteFormation(sf.id)}
                      className="p-1.5 rounded-lg" style={{ color: "rgba(239,68,68,0.6)" }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Assign Player Modal ───────────────────────────────────────────────── */}
      {showAssignModal && assigningPlayerId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base" style={{ fontFamily: font }}>
                {isRTL ? "تعيين لاعب حقيقي" : "Assign Real Player"}
              </h3>
              <button onClick={() => setShowAssignModal(false)} style={{ color: "rgba(255,255,255,0.4)" }}>
                <X size={18} />
              </button>
            </div>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
              {isRTL ? "اختر لاعباً من قاعدة بيانات كرة القدم" : "Choose a player from the football database"}
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {footballPlayers.map(dp => (
                <button
                  key={dp.id}
                  onClick={() => assignPlayer(assigningPlayerId, dp)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-start transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)" }}>
                    {dp.rating}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate" style={{ fontFamily: font }}>
                      {isRTL ? dp.nameAr : dp.nameEn}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: font }}>
                      {isRTL ? dp.positionAr : dp.positionEn} · {isRTL ? dp.cityAr : dp.cityEn}
                    </div>
                  </div>
                  <div className="text-xs font-bold" style={{ color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {dp.score}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* DHEEB Eye Overlay */}
    {eyeActive && (
      <EyeOverlay
        engine={eyeEngine}
        language={lang === 'ar' ? 'ar' : 'en'}
        position="bottom-left"
        onSessionEnd={(session) => {
          // Auto-save voice transcript as tactical notes
          if (session.transcript) {
            setTacticalNotes(prev => {
              const timestamp = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US');
              const note = `[${timestamp}] 🎙️ ${session.transcript}`;
              return prev ? `${prev}\n${note}` : note;
            });
          }
        }}
      />
    )}
    </>
  );
}

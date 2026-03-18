/**
 * Training Hub — usePlayers hook
 * Bilingual player data (Arabic + English)
 */
import { useState } from "react";

export interface Player {
  id: string;
  nameAr: string;
  nameEn: string;
  positionAr: string;
  positionEn: string;
  team: string;
  age: number;
  avatar: string;
  progress: number;
  lastSession: string;
  stats: {
    speed: number;
    strength: number;
    technique: number;
    stamina: number;
    teamwork: number;
  };
  rating: number;
  potential: number;
  speed: number;
  strength: number;
  stamina: number;
  injured?: boolean;
}

export interface TrainingSession {
  id: string;
  date: string;
  typeAr: string;
  typeEn: string;
  duration: number;
  intensityAr: string;
  intensityEn: string;
  notes: string;
  playerId: string;
}

const INITIAL_PLAYERS: Player[] = [
  {
    id: "1",
    nameAr: "محمد العمري",
    nameEn: "Mohammed Al-Omari",
    positionAr: "مهاجم",
    positionEn: "Forward",
    team: "أكاديمية كابتن",
    age: 16,
    avatar: "م",
    progress: 87,
    lastSession: "اليوم",
    stats: { speed: 92, strength: 78, technique: 88, stamina: 85, teamwork: 82 },
    rating: 8.4,
    potential: 94,
    speed: 92,
    strength: 78,
    stamina: 85,
  },
  {
    id: "2",
    nameAr: "عبدالله الشهري",
    nameEn: "Abdullah Al-Shahri",
    positionAr: "وسط",
    positionEn: "Midfielder",
    team: "أكاديمية الموهبة",
    age: 14,
    avatar: "ع",
    progress: 82,
    lastSession: "أمس",
    stats: { speed: 78, strength: 72, technique: 85, stamina: 80, teamwork: 93 },
    rating: 8.1,
    potential: 91,
    speed: 78,
    strength: 72,
    stamina: 80,
  },
  {
    id: "3",
    nameAr: "فيصل القحطاني",
    nameEn: "Faisal Al-Qahtani",
    positionAr: "حارس مرمى",
    positionEn: "Goalkeeper",
    team: "أكاديمية الظهران",
    age: 17,
    avatar: "ف",
    progress: 79,
    lastSession: "قبل يومين",
    stats: { speed: 74, strength: 84, technique: 87, stamina: 84, teamwork: 83 },
    rating: 7.9,
    potential: 89,
    speed: 74,
    strength: 84,
    stamina: 84,
    injured: false,
  },
  {
    id: "4",
    nameAr: "خالد المطيري",
    nameEn: "Khalid Al-Mutairi",
    positionAr: "مدافع",
    positionEn: "Defender",
    team: "مدرسة الأبطال",
    age: 15,
    avatar: "خ",
    progress: 74,
    lastSession: "3 أيام",
    stats: { speed: 80, strength: 83, technique: 76, stamina: 83, teamwork: 74 },
    rating: 7.6,
    potential: 86,
    speed: 80,
    strength: 83,
    stamina: 83,
    injured: true,
  },
];

const INITIAL_SESSIONS: TrainingSession[] = [
  { id: "1", date: "2026-03-16", typeAr: "تدريب تقني", typeEn: "Technical Training", duration: 90, intensityAr: "عالية", intensityEn: "High", notes: "أداء ممتاز في التمرير", playerId: "1" },
  { id: "2", date: "2026-03-15", typeAr: "تدريب تكتيكي", typeEn: "Tactical Training", duration: 75, intensityAr: "متوسطة", intensityEn: "Medium", notes: "تحسن ملحوظ في التمرير", playerId: "2" },
  { id: "3", date: "2026-03-14", typeAr: "تدريب قوة", typeEn: "Strength Training", duration: 60, intensityAr: "عالية", intensityEn: "High", notes: "بحاجة لتحسين اللياقة", playerId: "3" },
  { id: "4", date: "2026-03-16", typeAr: "تدريب ردود الفعل", typeEn: "Reaction Training", duration: 80, intensityAr: "متوسطة", intensityEn: "Medium", notes: "تحسن في الاستجابة", playerId: "4" },
];

export function usePlayers() {
  const [players] = useState<Player[]>(INITIAL_PLAYERS);
  const [sessions] = useState<TrainingSession[]>(INITIAL_SESSIONS);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const getPlayerById = (id: string) => players.find((p) => p.id === id);
  const getPlayerSessions = (playerId: string) => sessions.filter((s) => s.playerId === playerId);

  return {
    players,
    sessions,
    selectedPlayer,
    setSelectedPlayer,
    getPlayerById,
    getPlayerSessions,
  };
}

/**
 * Demo Data — Ada2AI
 * Mock data used in presentation mode (?demo=true).
 * No Supabase dependency.
 */
import type { Player, Match } from '../lib/supabase'

export const demoPlayers: Player[] = [
  {
    id: 'd1', name: 'سلمان الفرج', name_en: 'Salman Al-Faraj', position: 'CM', age: 24, rating: 88,
    speed: 82, passing: 91, shooting: 76, fitness: 85, dribbling: 83, defense: 78,
    goals: 5, assists: 12, appearances: 28, club: 'الهلال', nationality: '🇸🇦 السعودية',
  },
  {
    id: 'd2', name: 'مصعب الجوير', name_en: 'Musab Al-Juwayr', position: 'CAM', age: 22, rating: 85,
    speed: 87, passing: 86, shooting: 82, fitness: 80, dribbling: 90, defense: 55,
    goals: 14, assists: 8, appearances: 26, club: 'الشباب', nationality: '🇸🇦 السعودية',
  },
  {
    id: 'd3', name: 'عبدالإله العمري', name_en: 'Abdulelah Al-Amri', position: 'CB', age: 27, rating: 86,
    speed: 72, passing: 80, shooting: 45, fitness: 88, dribbling: 58, defense: 92,
    goals: 2, assists: 1, appearances: 30, club: 'النصر', nationality: '🇸🇦 السعودية',
  },
  {
    id: 'd4', name: 'فيصل الغامدي', name_en: 'Faisal Al-Ghamdi', position: 'CDM', age: 23, rating: 83,
    speed: 76, passing: 84, shooting: 68, fitness: 87, dribbling: 75, defense: 85,
    goals: 3, assists: 5, appearances: 24, club: 'الاتحاد', nationality: '🇸🇦 السعودية',
  },
  {
    id: 'd5', name: 'أيمن يحيى', name_en: 'Ayman Yahya', position: 'RW', age: 23, rating: 82,
    speed: 93, passing: 79, shooting: 80, fitness: 82, dribbling: 88, defense: 40,
    goals: 11, assists: 9, appearances: 22, club: 'النصر', nationality: '🇸🇦 السعودية',
  },
  {
    id: 'd6', name: 'حسان تمبكتي', name_en: 'Hassan Tambakti', position: 'CB', age: 26, rating: 84,
    speed: 74, passing: 77, shooting: 42, fitness: 86, dribbling: 55, defense: 90,
    goals: 1, assists: 0, appearances: 27, club: 'الهلال', nationality: '🇸🇦 السعودية',
  },
  {
    id: 'd7', name: 'أحمد الغامدي', name_en: 'Ahmed Al-Ghamdi', position: 'LW', age: 21, rating: 80,
    speed: 91, passing: 78, shooting: 76, fitness: 79, dribbling: 86, defense: 38,
    goals: 8, assists: 7, appearances: 20, club: 'الاتفاق', nationality: '🇸🇦 السعودية',
  },
  {
    id: 'd8', name: 'زياد الجهني', name_en: 'Ziyad Al-Johani', position: 'CM', age: 22, rating: 81,
    speed: 79, passing: 85, shooting: 70, fitness: 84, dribbling: 80, defense: 72,
    goals: 6, assists: 10, appearances: 25, club: 'الأهلي', nationality: '🇸🇦 السعودية',
  },
  {
    id: 'd9', name: 'محمد الربيعي', name_en: 'Mohammed Al-Rubaie', position: 'GK', age: 25, rating: 83,
    speed: 60, passing: 65, shooting: 25, fitness: 84, dribbling: 45, defense: 30, goalkeeping: 88,
    goals: 0, assists: 0, appearances: 29, saves: 72, clean_sheets: 12, club: 'الأهلي', nationality: '🇸🇦 السعودية',
  },
  {
    id: 'd10', name: 'عبدالله رديف', name_en: 'Abdullah Radif', position: 'ST', age: 22, rating: 82,
    speed: 88, passing: 74, shooting: 86, fitness: 81, dribbling: 83, defense: 28,
    goals: 18, assists: 4, appearances: 26, club: 'الهلال', nationality: '🇸🇦 السعودية',
  },
]

export const demoMatches: Match[] = [
  {
    id: 'm1', home_team: 'الهلال', away_team: 'النصر', home_score: 3, away_score: 1,
    competition: 'دوري روشن', match_date: '2026-05-10', venue: 'المملكة أرينا', is_completed: true,
  },
  {
    id: 'm2', home_team: 'الأهلي', away_team: 'الاتحاد', home_score: 2, away_score: 2,
    competition: 'دوري روشن', match_date: '2026-05-08', venue: 'الجوهرة', is_completed: true,
  },
  {
    id: 'm3', home_team: 'الشباب', away_team: 'الاتفاق', home_score: 4, away_score: 0,
    competition: 'كأس الملك', match_date: '2026-05-05', venue: 'الملك فهد', is_completed: true,
  },
]

export const demoClubs = ['الهلال', 'النصر', 'الأهلي', 'الاتحاد', 'الشباب', 'الاتفاق']

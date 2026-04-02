import type { Athlete, Facility, MinistryKPI, CheckIn } from './types';

export const mockAthletes: Athlete[] = [
  {
    id: 'ATH-001',
    sportId: '**********',
    name: '',
    nameAr: '',
    age: 0,
    city: '',
    region: '',
    sports: ['Football', 'Swimming'],
    sportPoints: 1240,
    level: 'Gold',
    joinedAt: '2025-09-01',
    careerScore: 87,
    guardianConsent: true,
    certifications: [
      { id: 'C1', name: 'Junior Football License', sport: 'Football', issuedBy: 'Saudi Football Federation', issuedAt: '2025-11-01', points: 100, verified: true },
      { id: 'C2', name: 'Swimming Level 3', sport: 'Swimming', issuedBy: 'Saudi Aquatics', issuedAt: '2026-01-15', points: 100, verified: true },
    ],
    achievements: [
      { id: 'A1', title: 'Regional Champion', description: 'U16 Riyadh Regional Football Championship', sport: 'Football', date: '2025-12-10', points: 50, icon: '🏆' },
      { id: 'A2', title: '50m Sprint Record', description: 'Club record in 50m freestyle', sport: 'Swimming', date: '2026-02-05', points: 50, icon: '🥇' },
      { id: 'A3', title: 'Consistency Badge', description: '30 sessions in a month', sport: 'Football', date: '2026-01-31', points: 10, icon: '⭐' },
    ],
    sessions: [
      { id: 'S1', facilityId: 'FAC-001', facilityName: 'Prince Faisal Sports Center', sport: 'Football', date: '2026-03-10', duration: 90, points: 10, verifiedAt: '2026-03-10T09:02:15Z' },
      { id: 'S2', facilityId: 'FAC-002', facilityName: 'Riyadh Aquatic Center', sport: 'Swimming', date: '2026-03-08', duration: 60, points: 10, verifiedAt: '2026-03-08T07:32:10Z' },
      { id: 'S3', facilityId: 'FAC-001', facilityName: 'Prince Faisal Sports Center', sport: 'Football', date: '2026-03-06', duration: 90, points: 10, verifiedAt: '2026-03-06T09:01:45Z' },
    ],
  },
  {
    id: 'ATH-002',
    sportId: '1123456789',
    name: 'Khalid Al-Rashidi',
    nameAr: 'خالد الرشيدي',
    age: 19,
    city: 'Jeddah',
    region: 'Makkah',
    sports: ['Basketball', 'Athletics'],
    sportPoints: 890,
    level: 'Silver',
    joinedAt: '2025-10-15',
    careerScore: 74,
    guardianConsent: true,
    certifications: [
      { id: 'C3', name: 'Basketball Referee Grade 1', sport: 'Basketball', issuedBy: 'Saudi Basketball Federation', issuedAt: '2026-01-20', points: 100, verified: true },
    ],
    achievements: [
      { id: 'A4', title: 'MVP Award', description: 'Jeddah League Season MVP', sport: 'Basketball', date: '2026-02-28', points: 50, icon: '🏅' },
    ],
    sessions: [
      { id: 'S4', facilityId: 'FAC-003', facilityName: 'Al-Ittihad Sports Hall', sport: 'Basketball', date: '2026-03-10', duration: 120, points: 10, verifiedAt: '2026-03-10T18:02:00Z' },
    ],
  },
  {
    id: 'ATH-003',
    sportId: '1098712345',
    name: 'Noura Al-Zahrani',
    nameAr: 'نورة الزهراني',
    age: 22,
    city: 'Dammam',
    region: 'Eastern Province',
    sports: ['Athletics', 'Volleyball'],
    sportPoints: 2140,
    level: 'Platinum',
    joinedAt: '2025-09-01',
    careerScore: 95,
    guardianConsent: true,
    certifications: [
      { id: 'C5', name: 'Athletics Coach Level 2', sport: 'Athletics', issuedBy: 'Saudi Athletics Federation', issuedAt: '2025-12-01', points: 150, verified: true },
      { id: 'C6', name: 'Volleyball Referee Grade 2', sport: 'Volleyball', issuedBy: 'Saudi Volleyball Federation', issuedAt: '2026-02-10', points: 100, verified: true },
    ],
    achievements: [
      { id: 'A6', title: 'National Record', description: '400m National Junior Record Holder', sport: 'Athletics', date: '2026-01-15', points: 100, icon: '🏅' },
      { id: 'A7', title: 'Platinum Tier', description: 'Reached 2000+ Sport Points', sport: 'Athletics', date: '2026-03-01', points: 50, icon: '💎' },
      { id: 'A8', title: 'Eastern Region Champion', description: 'Eastern Province Athletics Championship', sport: 'Athletics', date: '2025-11-20', points: 50, icon: '🏆' },
    ],
    sessions: [
      { id: 'S5', facilityId: 'FAC-004', facilityName: 'Dammam Athletics Track', sport: 'Athletics', date: '2026-03-11', duration: 75, points: 10, verifiedAt: '2026-03-11T07:00:00Z' },
      { id: 'S6', facilityId: 'FAC-005', facilityName: 'Eastern Sports Complex', sport: 'Volleyball', date: '2026-03-09', duration: 90, points: 10, verifiedAt: '2026-03-09T18:00:00Z' },
      { id: 'S7', facilityId: 'FAC-004', facilityName: 'Dammam Athletics Track', sport: 'Athletics', date: '2026-03-07', duration: 75, points: 10, verifiedAt: '2026-03-07T07:05:00Z' },
    ],
  },
];

export const mockFacility: Facility = {
  id: 'FAC-001',
  name: 'Prince Faisal Sports Center',
  nameAr: 'مركز الأمير فيصل الرياضي',
  city: 'Jeddah',
  region: 'Makkah',
  sports: ['Football', 'Basketball', 'Tennis', 'Swimming'],
  managerId: 'MGR-001',
  monthlyRevenue: 485000,
  activeAthletes: 1247,
  checkins: [
    { id: 'CI-001', athleteId: 'ATH-001', athleteName: 'Omar Al-Saud', sport: 'Football', timestamp: '2026-03-11T09:02:15Z', verified: true, pointsAwarded: 10 },
    { id: 'CI-002', athleteId: 'ATH-002', athleteName: 'Khalid Al-Rashidi', sport: 'Basketball', timestamp: '2026-03-11T09:15:22Z', verified: true, pointsAwarded: 10 },
    { id: 'CI-003', athleteId: 'ATH-003', athleteName: 'Mohammed Al-Ghamdi', sport: 'Tennis', timestamp: '2026-03-11T10:01:05Z', verified: true, pointsAwarded: 10 },
    { id: 'CI-004', athleteId: 'ATH-004', athleteName: 'Noura Al-Zahrani', sport: 'Swimming', timestamp: '2026-03-11T10:30:44Z', verified: true, pointsAwarded: 10 },
    { id: 'CI-005', athleteId: 'ATH-005', athleteName: 'Faisal Al-Dossari', sport: 'Football', timestamp: '2026-03-11T11:05:18Z', verified: true, pointsAwarded: 10 },
  ],
};

export const mockMinistryKPI: MinistryKPI = {
  totalAthletes: 98750,
  activeThisMonth: 67230,
  totalFacilities: 843,
  totalSessions: 1240500,
  avgPointsPerAthlete: 640,
  vision2030Progress: 68,
  youthEngagement: 72,
  talentPipelineScore: 81,
  regionBreakdown: [
    { region: 'Riyadh', athletes: 28400, facilities: 210, sessions: 356000 },
    { region: 'Makkah', athletes: 22100, facilities: 165, sessions: 278000 },
    { region: 'Eastern Province', athletes: 16800, facilities: 130, sessions: 211000 },
    { region: 'Madinah', athletes: 9200, facilities: 89, sessions: 116000 },
    { region: 'Asir', athletes: 7100, facilities: 68, sessions: 89000 },
    { region: 'Others', athletes: 15150, facilities: 181, sessions: 190500 },
  ],
  sportBreakdown: [
    { sport: 'Football', athletes: 42300, sessions: 534000, growth: 18 },
    { sport: 'Basketball', athletes: 18200, sessions: 229000, growth: 24 },
    { sport: 'Swimming', athletes: 14100, sessions: 178000, growth: 31 },
    { sport: 'Athletics', athletes: 11600, sessions: 146000, growth: 15 },
    { sport: 'Tennis', athletes: 7800, sessions: 98000, growth: 12 },
    { sport: 'Other', athletes: 4750, sessions: 55500, growth: 9 },
  ],
  monthlyGrowth: [
    { month: 'Sep 25', athletes: 58000, sessions: 720000, points: 37120000 },
    { month: 'Oct 25', athletes: 63000, sessions: 790000, points: 40320000 },
    { month: 'Nov 25', athletes: 69000, sessions: 865000, points: 44160000 },
    { month: 'Dec 25', athletes: 74000, sessions: 928000, points: 47360000 },
    { month: 'Jan 26', athletes: 81000, sessions: 1015000, points: 51840000 },
    { month: 'Feb 26', athletes: 90000, sessions: 1128000, points: 57600000 },
    { month: 'Mar 26', athletes: 98750, sessions: 1240500, points: 63200000 },
  ],
};

export function getLevelInfo(points: number) {
  if (points >= 2000) return { level: 'Platinum' as const, color: '#E5E4E2', next: null, needed: 0 };
  if (points >= 1000) return { level: 'Gold' as const, color: '#FFD700', next: 'Platinum', needed: 2000 - points };
  if (points >= 500) return { level: 'Silver' as const, color: '#C0C0C0', next: 'Gold', needed: 1000 - points };
  return { level: 'Bronze' as const, color: '#CD7F32', next: 'Silver', needed: 500 - points };
}

export const SAUDI_REGIONS = [
  'Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Asir',
  'Tabuk', 'Hail', 'Northern Borders', 'Jazan', 'Najran', 'Al Bahah', 'Al Jawf', 'Qassim'
];

export const SPORTS = ['Football', 'Basketball', 'Swimming', 'Athletics', 'Tennis', 'Volleyball', 'Badminton', 'Martial Arts'];

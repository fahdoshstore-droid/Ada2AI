import { Router } from 'express';
import { getSupabase } from './db';

const router = Router();

// Mock career data fallback (career_history table doesn't exist yet in Supabase)
const mockCareers: Record<string, any> = {
  'ATH-001': {
    id: 'ATH-001',
    name: 'Omar Al-Saud',
    nameAr: '',
    level: 'Gold',
    careerScore: 87,
    sportPoints: 1240,
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
  'ATH-002': {
    id: 'ATH-002',
    name: 'Khalid Al-Rashidi',
    nameAr: 'خالد الرشيدي',
    level: 'Silver',
    careerScore: 74,
    sportPoints: 890,
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
  'ATH-003': {
    id: 'ATH-003',
    name: 'Noura Al-Zahrani',
    nameAr: 'نورة الزهراني',
    level: 'Platinum',
    careerScore: 95,
    sportPoints: 2140,
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
};

// Build mock career for any ID not in the map
function getMockCareer(id: string) {
  if (mockCareers[id]) return mockCareers[id];
  return {
    id,
    name: 'Unknown Athlete',
    nameAr: '',
    level: 'Bronze',
    careerScore: 0,
    sportPoints: 0,
    certifications: [],
    achievements: [],
    sessions: [],
  };
}

// GET /api/athletes/:id/career — player career data
router.get('/:id/career', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    const { data, error } = await supabase
      .from('career_history')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    // If table doesn't exist yet, fall back to mock data
    if (error) {
      console.warn('[AthleteCareer] Table not available, returning mock data:', error.message);
      return res.json(getMockCareer(req.params.id));
    }

    if (!data) {
      return res.status(404).json({ error: 'Athlete career not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('[AthleteCareer] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function registerAthleteCareerRoutes(app: import('express').Express) {
  app.use('/api/athletes', router);
}
import { Router } from 'express';
import { getSupabase } from './db';

const router = Router();

// Mock data fallback (facilities table doesn't exist yet in Supabase)
const mockFacilities = [
  {
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
  },
  {
    id: 'FAC-002',
    name: 'Riyadh Aquatic Center',
    nameAr: 'مركز الرياض المائي',
    city: 'Riyadh',
    region: 'Riyadh',
    sports: ['Swimming', 'Water Polo'],
    managerId: 'MGR-002',
    monthlyRevenue: 320000,
    activeAthletes: 680,
    checkins: [],
  },
  {
    id: 'FAC-003',
    name: 'Al-Ittihad Sports Hall',
    nameAr: 'قاعة الاتحاد الرياضية',
    city: 'Jeddah',
    region: 'Makkah',
    sports: ['Basketball', 'Volleyball'],
    managerId: 'MGR-003',
    monthlyRevenue: 210000,
    activeAthletes: 520,
    checkins: [],
  },
  {
    id: 'FAC-004',
    name: 'Dammam Athletics Track',
    nameAr: 'مضمار الدمام لألعاب القوى',
    city: 'Dammam',
    region: 'Eastern Province',
    sports: ['Athletics'],
    managerId: 'MGR-004',
    monthlyRevenue: 150000,
    activeAthletes: 390,
    checkins: [],
  },
  {
    id: 'FAC-005',
    name: 'Eastern Sports Complex',
    nameAr: 'مجمع الشرق الرياضي',
    city: 'Dammam',
    region: 'Eastern Province',
    sports: ['Volleyball', 'Basketball', 'Football'],
    managerId: 'MGR-005',
    monthlyRevenue: 290000,
    activeAthletes: 750,
    checkins: [],
  },
];

// GET /api/facilities — list facilities
router.get('/', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    let query = supabase.from('facilities').select('*');

    if (req.query.region) {
      query = query.eq('region', req.query.region as string);
    }
    if (req.query.city) {
      query = query.eq('city', req.query.city as string);
    }
    if (req.query.sport) {
      query = query.contains('sports', [req.query.sport as string]);
    }

    const { data, error } = await query;

    // If table doesn't exist yet, fall back to mock data
    if (error) {
      console.warn('[Facilities] Table not available, returning mock data:', error.message);
      let results = mockFacilities;
      if (req.query.region) results = results.filter(f => f.region === req.query.region);
      if (req.query.city) results = results.filter(f => f.city === req.query.city);
      if (req.query.sport) results = results.filter(f => f.sports.includes(req.query.sport as string));
      return res.json(results);
    }

    res.json(data);
  } catch (err) {
    console.error('[Facilities] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/facilities/:id — single facility
router.get('/:id', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    // If table doesn't exist yet, fall back to mock data
    if (error) {
      console.warn('[Facilities] Table not available, returning mock data:', error.message);
      const mock = mockFacilities.find(f => f.id === req.params.id);
      if (!mock) return res.status(404).json({ error: 'Facility not found' });
      return res.json(mock);
    }

    if (!data) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('[Facilities] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function registerFacilityRoutes(app: import('express').Express) {
  app.use('/api/facilities', router);
}
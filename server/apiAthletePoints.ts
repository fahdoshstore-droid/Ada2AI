import { Router } from 'express';
import { getSupabase } from './db';

const router = Router();

// Mock point transactions fallback (point_transactions table doesn't exist yet in Supabase)
const mockPointTransactions: Record<string, any[]> = {
  'ATH-001': [
    { id: 'PT-001', athleteId: 'ATH-001', type: 'session', points: 10, description: 'Football session at Prince Faisal Sports Center', date: '2026-03-10', sport: 'Football' },
    { id: 'PT-002', athleteId: 'ATH-001', type: 'session', points: 10, description: 'Swimming session at Riyadh Aquatic Center', date: '2026-03-08', sport: 'Swimming' },
    { id: 'PT-003', athleteId: 'ATH-001', type: 'session', points: 10, description: 'Football session at Prince Faisal Sports Center', date: '2026-03-06', sport: 'Football' },
    { id: 'PT-004', athleteId: 'ATH-001', type: 'competition', points: 50, description: 'U16 Riyadh Regional Football Championship', date: '2025-12-10', sport: 'Football' },
    { id: 'PT-005', athleteId: 'ATH-001', type: 'competition', points: 50, description: 'Club record in 50m freestyle', date: '2026-02-05', sport: 'Swimming' },
    { id: 'PT-006', athleteId: 'ATH-001', type: 'certification', points: 100, description: 'Junior Football License', date: '2025-11-01', sport: 'Football' },
    { id: 'PT-007', athleteId: 'ATH-001', type: 'certification', points: 100, description: 'Swimming Level 3', date: '2026-01-15', sport: 'Swimming' },
    { id: 'PT-008', athleteId: 'ATH-001', type: 'session', points: 10, description: '30 sessions in a month — Consistency Badge', date: '2026-01-31', sport: 'Football' },
  ],
  'ATH-002': [
    { id: 'PT-009', athleteId: 'ATH-002', type: 'session', points: 10, description: 'Basketball session at Al-Ittihad Sports Hall', date: '2026-03-10', sport: 'Basketball' },
    { id: 'PT-010', athleteId: 'ATH-002', type: 'competition', points: 50, description: 'Jeddah League Season MVP', date: '2026-02-28', sport: 'Basketball' },
    { id: 'PT-011', athleteId: 'ATH-002', type: 'certification', points: 100, description: 'Basketball Referee Grade 1', date: '2026-01-20', sport: 'Basketball' },
  ],
  'ATH-003': [
    { id: 'PT-012', athleteId: 'ATH-003', type: 'session', points: 10, description: 'Athletics session at Dammam Athletics Track', date: '2026-03-11', sport: 'Athletics' },
    { id: 'PT-013', athleteId: 'ATH-003', type: 'session', points: 10, description: 'Volleyball session at Eastern Sports Complex', date: '2026-03-09', sport: 'Volleyball' },
    { id: 'PT-014', athleteId: 'ATH-003', type: 'session', points: 10, description: 'Athletics session at Dammam Athletics Track', date: '2026-03-07', sport: 'Athletics' },
    { id: 'PT-015', athleteId: 'ATH-003', type: 'competition', points: 100, description: '400m National Junior Record Holder', date: '2026-01-15', sport: 'Athletics' },
    { id: 'PT-016', athleteId: 'ATH-003', type: 'competition', points: 50, description: 'Reached 2000+ Sport Points — Platinum Tier', date: '2026-03-01', sport: 'Athletics' },
    { id: 'PT-017', athleteId: 'ATH-003', type: 'competition', points: 50, description: 'Eastern Province Athletics Championship', date: '2025-11-20', sport: 'Athletics' },
    { id: 'PT-018', athleteId: 'ATH-003', type: 'certification', points: 150, description: 'Athletics Coach Level 2', date: '2025-12-01', sport: 'Athletics' },
    { id: 'PT-019', athleteId: 'ATH-003', type: 'certification', points: 100, description: 'Volleyball Referee Grade 2', date: '2026-02-10', sport: 'Volleyball' },
  ],
};

// GET /api/athletes/:id/points — point transactions for an athlete
router.get('/:id/points', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    let query = supabase
      .from('point_transactions')
      .select('*')
      .eq('athleteId', req.params.id);

    if (req.query.type) {
      query = query.eq('type', req.query.type as string);
    }
    if (req.query.sport) {
      query = query.eq('sport', req.query.sport as string);
    }

    const { data, error } = await query;

    // If table doesn't exist yet, fall back to mock data
    if (error) {
      console.warn('[AthletePoints] Table not available, returning mock data:', error.message);
      let transactions = mockPointTransactions[req.params.id] || [];
      if (req.query.type) transactions = transactions.filter(t => t.type === req.query.type);
      if (req.query.sport) transactions = transactions.filter(t => t.sport === req.query.sport);
      return res.json(transactions);
    }

    res.json(data);
  } catch (err) {
    console.error('[AthletePoints] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function registerAthletePointsRoutes(app: import('express').Express) {
  app.use('/api/athletes', router);
}
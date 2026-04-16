import { Router } from 'express';
import { getSupabase } from './db';

const router = Router();

// Mock ministry KPI data fallback (ministry_stats table doesn't exist yet in Supabase)
const mockMinistryKPI = {
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

// GET /api/ministry/kpi — ministry KPI stats
router.get('/kpi', async (_req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    const { data, error } = await supabase
      .from('ministry_stats')
      .select('*')
      .maybeSingle();

    // If table doesn't exist yet, fall back to mock data
    if (error) {
      console.warn('[Ministry] Table not available, returning mock data:', error.message);
      return res.json(mockMinistryKPI);
    }

    if (!data) {
      // No row in table yet — return mock data
      return res.json(mockMinistryKPI);
    }

    res.json(data);
  } catch (err) {
    console.error('[Ministry] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function registerMinistryRoutes(app: import('express').Express) {
  app.use('/api/ministry', router);
}
import { Router } from 'express';
import { getSupabase } from './db';

const router = Router();

// GET /api/players — list with optional filters ?sport=Football&region=Riyadh&search=keyword
router.get('/', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    let query = supabase.from('players').select('*');

    if (req.query.sport) {
      query = query.eq('sport', req.query.sport as string);
    }
    if (req.query.region) {
      query = query.eq('region', req.query.region as string);
    }
    if (req.query.search) {
      const pattern = `%${req.query.search}%`;
      query = query.or(`name.ilike.${pattern},name_ar.ilike.${pattern}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Players] Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch players' });
    }

    res.json(data);
  } catch (err) {
    console.error('[Players] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/players/:id — single player
router.get('/:id', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      console.error('[Players] Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch player' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('[Players] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function registerPlayerRoutes(app: import('express').Express) {
  app.use('/api/players', router);
}
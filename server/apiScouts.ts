import { Router } from 'express';
import { getSupabase } from './db';

const router = Router();

// GET /api/scouts — list with optional filters ?sport=Football&region=Riyadh&search=keyword
router.get('/', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    let query = supabase.from('scouts').select('*');

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
      console.error('[Scouts] Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch scouts' });
    }

    res.json(data);
  } catch (err) {
    console.error('[Scouts] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/scouts/:id — single scout
router.get('/:id', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    const { data, error } = await supabase
      .from('scouts')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      console.error('[Scouts] Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch scout' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Scout not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('[Scouts] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function registerScoutRoutes(app: import('express').Express) {
  app.use('/api/scouts', router);
}
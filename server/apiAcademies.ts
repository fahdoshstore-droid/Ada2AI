import { Router } from 'express';
import { getSupabase } from './db';
import { requireAuth } from './_core/auth';

const router = Router();

// GET /api/academies — list with optional filters ?sport=Football&region=Riyadh&search=keyword
router.get('/', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    let query = supabase.from('academies').select('*');

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
      console.error('[Academies] Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch academies' });
    }

    res.json(data);
  } catch (err) {
    console.error('[Academies] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/academies/:id — single academy
router.get('/:id', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    const { data, error } = await supabase
      .from('academies')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      console.error('[Academies] Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch academy' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Academy not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('[Academies] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/academies — create new academy (requires auth)
router.post('/', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    const { name, name_ar, sport, region, rating } = req.body;
    if (!name) return res.status(400).json({ error: 'Academy name is required' });

    const { data, error } = await supabase
      .from('academies')
      .insert({ name, name_ar, sport: sport || 'Football', region, rating: rating || 0 })
      .select()
      .single();

    if (error) {
      console.error('[Academies] Insert error:', error);
      return res.status(500).json({ error: 'Failed to create academy' });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('[Academies] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/academies/:id — delete academy (requires auth)
router.delete('/:id', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    const { error } = await supabase
      .from('academies')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('[Academies] Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete academy' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Academies] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function registerAcademyRoutes(app: import('express').Express) {
  app.use('/api/academies', router);
}
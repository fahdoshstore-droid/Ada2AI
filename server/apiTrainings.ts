import { Router } from 'express';
import { getSupabase } from './db';

const router = Router();

// GET /api/trainings — list training sessions
router.get('/', async (_req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    const { data, error } = await supabase.from('trainings').select('*').order('date', { ascending: false });

    if (error) {
      // Table may not exist yet — return empty array instead of 500
      console.warn('[Trainings] Query error (table may not exist):', error.message);
      return res.json([]);
    }

    res.json(data);
  } catch (err) {
    console.error('[Trainings] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/trainings — create new training session
router.post('/', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  try {
    const { title, titleEn, date, time, maxAttendance } = req.body;
    if (!title) return res.status(400).json({ error: 'Training title is required' });

    const { data, error } = await supabase
      .from('trainings')
      .insert({ title, titleEn: titleEn || title, date, time, attendance: [], maxAttendance: maxAttendance || 25 })
      .select()
      .single();

    if (error) {
      console.error('[Trainings] Insert error:', error);
      return res.status(500).json({ error: 'Failed to create training' });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('[Trainings] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function registerTrainingRoutes(app: import('express').Express) {
  app.use('/api/trainings', router);
}
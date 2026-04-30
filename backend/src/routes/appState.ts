import { Router, Request, Response } from 'express';
import { query } from '../db/pool';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT payload FROM app_state WHERE key = 'signacore-demo'`
    );

    res.json(result.rows[0]?.payload || null);
  } catch (err) {
    console.error('Failed to load app state:', err);
    res.status(500).json({ error: 'Failed to load app state' });
  }
});

router.put('/', async (req: Request, res: Response): Promise<void> => {
  try {
    await query(
      `INSERT INTO app_state (key, payload, updated_at)
       VALUES ('signacore-demo', $1, NOW())
       ON CONFLICT (key)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [req.body]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save app state:', err);
    res.status(500).json({ error: 'Failed to save app state' });
  }
});

export default router;

import { getUnitMix, saveUnitMix, initDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDb();
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.query as { id: string };

    if (req.method === 'GET') {
      const rows = await getUnitMix(id);
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const { rows } = req.body;
      await saveUnitMix(id, rows);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Unit mix error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import { getDashboardStats, initDb } from '@/lib/db';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDb();
if (req.method === 'GET') {
      const stats = await getDashboardStats();
      return res.status(200).json(stats);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

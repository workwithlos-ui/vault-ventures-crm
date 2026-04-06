import { getDeals, createDeal, initDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDb();
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
      const deals = await getDeals();
      return res.status(200).json(deals);
    }
    if (req.method === 'POST') {
      const id = await createDeal(req.body);
      return res.status(200).json({ id, success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Deals error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import { getDealById, updateDeal, deleteDeal, initDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDb();
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.query as { id: string };

    if (req.method === 'GET') {
      const deal = await getDealById(id);
      if (!deal) return res.status(404).json({ error: 'Deal not found' });
      return res.status(200).json(deal);
    }
    if (req.method === 'PUT') {
      await updateDeal(id, req.body);
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      await deleteDeal(id);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Deal error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

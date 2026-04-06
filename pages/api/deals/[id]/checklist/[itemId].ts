import { updateChecklistItem, initDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await initDb();
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    const { itemId } = req.query as { itemId: string };
    await updateChecklistItem(itemId, req.body);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Checklist item error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

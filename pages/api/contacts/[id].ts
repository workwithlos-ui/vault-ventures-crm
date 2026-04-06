import { updateContact, deleteContact, initDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDb();
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.query as { id: string };

    if (req.method === 'PUT') {
      await updateContact(id, req.body);
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      await deleteContact(id);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

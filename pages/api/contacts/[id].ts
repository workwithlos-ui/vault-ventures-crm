import { getContactById, updateContact, deleteContact, initDb } from '@/lib/db';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDb();
const { id } = req.query;
    if (req.method === 'GET') {
      const contact = await getContactById(id as string);
      if (!contact) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(contact);
    }
    if (req.method === 'PUT') {
      await updateContact(id as string, req.body);
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      await deleteContact(id as string);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

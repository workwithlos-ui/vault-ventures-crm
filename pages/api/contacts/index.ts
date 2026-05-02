import { getContacts, createContact, initDb } from '@/lib/db';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDb();
if (req.method === 'GET') {
      const contacts = await getContacts();
      return res.status(200).json(contacts);
    }
    if (req.method === 'POST') {
      const id = await createContact(req.body);
      return res.status(200).json({ id, success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Contacts error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

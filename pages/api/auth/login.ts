import { generateToken, verifyPassword } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { password } = req.body;
    if (!verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = generateToken();
    return res.status(200).json({ token, success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

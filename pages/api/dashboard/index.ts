import { getDeals, getContacts, initDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

const STAGE_NAMES: Record<number, string> = {
  1: 'Initial Contact', 2: 'Intro Call Scheduled', 3: 'Intro Call Complete',
  4: 'LOI Sent', 5: 'LOI Accepted', 6: 'PSA Sent',
  7: 'PSA Executed', 8: 'Due Diligence', 9: 'Financing',
  10: 'Clear to Close', 11: 'Closed',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await initDb();
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    const [deals, contacts] = await Promise.all([
      getDeals() as Promise<any[]>,
      getContacts() as Promise<any[]>,
    ]);

    const totalDeals = deals.length;
    const closedDeals = deals.filter((d) => Number(d.stage) === 11).length;
    const activeDeals = totalDeals - closedDeals;
    const totalContacts = contacts.length;

    const stageCounts: Record<number, number> = {};
    for (let i = 1; i <= 11; i++) stageCounts[i] = 0;
    for (const d of deals) {
      const s = Number(d.stage) || 1;
      stageCounts[s] = (stageCounts[s] || 0) + 1;
    }
    const dealsByStage = Object.entries(stageCounts).map(([stage, count]) => ({
      stage: Number(stage),
      name: STAGE_NAMES[Number(stage)] || `Stage ${stage}`,
      count,
    }));

    const recentDeals = [...deals]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 10)
      .map((d) => ({
        id: d.id,
        propertyName: d.propertyName,
        city: d.city,
        state: d.state,
        stage: Number(d.stage) || 1,
        leadRating: d.leadRating,
        sellerAskingPrice: Number(d.sellerAskingPrice) || 0,
      }));

    return res.status(200).json({ totalDeals, activeDeals, closedDeals, totalContacts, dealsByStage, recentDeals });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

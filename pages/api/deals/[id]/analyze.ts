import { getDealById, initDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await initDb();
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.query as { id: string };
    const deal = await getDealById(id) as any;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ analysis: 'AI analysis not configured. Please set OPENAI_API_KEY in your environment variables.' });
    }

    const prompt = `You are a self-storage acquisition analyst. Analyze this deal and provide a concise but thorough assessment:

Property: ${deal.propertyName || 'N/A'}
Location: ${[deal.address, deal.city, deal.state, deal.zip].filter(Boolean).join(', ')}
Units: ${deal.units || 'N/A'}
Year Built: ${deal.yearBuilt || 'N/A'}
Building SF: ${deal.buildingSqFt || 'N/A'}
Occupancy: ${deal.occupancyRate ? deal.occupancyRate + '%' : 'N/A'}
Avg Rent/Unit: ${deal.avgRent ? '$' + deal.avgRent : 'N/A'}
Gross Revenue: ${deal.grossRevenue ? '$' + deal.grossRevenue : 'N/A'}
NOI: ${deal.noi ? '$' + deal.noi : 'N/A'}
Cap Rate: ${deal.capRate ? deal.capRate + '%' : 'N/A'}
Seller Asking Price: ${deal.sellerAskingPrice ? '$' + deal.sellerAskingPrice : 'N/A'}
Purchase Price: ${deal.purchasePrice ? '$' + deal.purchasePrice : 'N/A'}
Management Type: ${deal.managementType || 'N/A'}
Climate Control: ${deal.hasClimateControl ? 'Yes' : 'No'}
Lead Rating: ${deal.leadRating || 'N/A'}
Notes: ${deal.notes || 'None'}
Value-Add Notes: ${deal.valueAddNotes || 'None'}

Please provide:
1. **Deal Summary** - Key metrics and overall assessment
2. **Strengths** - What makes this deal attractive
3. **Red Flags / Risks** - Concerns or issues to investigate
4. **Value-Add Opportunities** - Ways to increase NOI
5. **Recommendation** - Buy / Pass / Negotiate with reasoning
6. **Suggested Offer Price** - Based on available data`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      return res.status(200).json({ analysis: 'Failed to analyze deal. Please try again.' });
    }

    const data = await response.json() as any;
    const analysis = data.choices?.[0]?.message?.content || 'Unable to generate analysis';
    return res.status(200).json({ analysis });
  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

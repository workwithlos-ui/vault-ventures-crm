import { getDealById, initDb } from '@/lib/db';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await initDb();
const { id } = req.query as { id: string };
    const deal = await getDealById(id) as any;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ analysis: '**AI analysis not configured.** Please set OPENAI_API_KEY in your environment variables.' });
    }

    const prompt = `You are a senior self-storage acquisition analyst at a private equity firm. Analyze this deal and provide a structured investment recommendation.

PROPERTY DATA:
- Property: ${deal.propertyName || deal.companyName || deal.sellerName || 'Unknown'}
- Location: ${[deal.propertyAddress || deal.address, deal.city, deal.state, deal.zip].filter(Boolean).join(', ') || 'N/A'}
- Units: ${deal.nccUnits || deal.units || 'N/A'} NCC + ${deal.climateControlUnits || 'N/A'} CC
- Year Built: ${deal.yearBuilt || 'N/A'}
- Gross SF: ${deal.grossSqft || deal.buildingSqFt || 'N/A'}
- Net Rentable SF: ${deal.netRentableSqft || 'N/A'}
- Parcel Size: ${deal.parcelSize || 'N/A'} acres
- Room for Expansion: ${deal.roomForExpansion || 'N/A'}

FINANCIAL DATA:
- Asking Price: ${deal.askingPrice || deal.sellerAskingPrice ? '$' + (deal.askingPrice || deal.sellerAskingPrice).toLocaleString() : 'N/A'}
- Monthly Gross Income: ${deal.monthlyGrossIncome ? '$' + Number(deal.monthlyGrossIncome).toLocaleString() : 'N/A'}
- Yearly NOI: ${deal.yearlyNOI || deal.noi ? '$' + Number(deal.yearlyNOI || deal.noi).toLocaleString() : 'N/A'}
- Current Occupancy: ${deal.currentOccupancy || deal.occupancyRate ? (deal.currentOccupancy || deal.occupancyRate) + '%' : 'N/A'}
- Financial Occupancy: ${deal.financialOccupancy ? deal.financialOccupancy + '%' : 'N/A'}
- Yearly Taxes: ${deal.yearlyTaxes ? '$' + Number(deal.yearlyTaxes).toLocaleString() : 'N/A'}
- Yearly Insurance: ${deal.yearlyInsurance ? '$' + Number(deal.yearlyInsurance).toLocaleString() : 'N/A'}
- Payroll: ${deal.payroll ? '$' + Number(deal.payroll).toLocaleString() : 'N/A'}
- Seller Financing: ${deal.sellerFinancing || 'N/A'}

MARKET DATA:
- Population (1mi/3mi/5mi): ${deal.population1mi || 'N/A'} / ${deal.population3mi || 'N/A'} / ${deal.population5mi || 'N/A'}
- SS Facilities (1mi/3mi/5mi): ${deal.ssFacilities1mi || 'N/A'} / ${deal.ssFacilities3mi || 'N/A'} / ${deal.ssFacilities5mi || 'N/A'}
- Avg Rent CC/NCC: $${deal.avgRentCC || 'N/A'} / $${deal.avgRentNCC || 'N/A'}
- Median HH Income (1mi/3mi): $${deal.medianHHIncome1mi || 'N/A'} / $${deal.medianHHIncome3mi || 'N/A'}

FACILITY DETAILS:
- Management: ${deal.whoManaging || 'N/A'} (${deal.managementSoftware || 'N/A'})
- Security: Gate=${deal.electronicGate || 'N/A'}, Cameras=${deal.securityCameras || 'N/A'}, Fenced=${deal.fenced || 'N/A'}
- Flood Zone: ${deal.floodZone || 'N/A'}
- Roof Age: ${deal.ageOfRoof || 'N/A'} years
- AC Age: ${deal.ageOfAC || 'N/A'} years
- Why Selling: ${deal.whySelling || 'N/A'}
- Lead Rating: ${deal.leadRating || 'N/A'}
- Value-Add Strategy: ${deal.valueAddStrategy || deal.valueAddNotes || 'None noted'}
- Documents: Rent Roll=${deal.hasRentRoll ? 'Yes' : 'No'}, P&L=${deal.hasPL ? 'Yes' : 'No'}, Occupancy Report=${deal.hasOccupancyReport ? 'Yes' : 'No'}, Facility Map=${deal.hasFacilityMap ? 'Yes' : 'No'}

RESPOND IN THIS EXACT FORMAT (use these exact headers):

## Recommendation
[One clear sentence: PURSUE / NEGOTIATE / PASS — and why in 2-3 sentences]

## Why It Matters
[2-3 sentences on why this deal is worth the firm's attention or not. Frame in terms of portfolio strategy and return potential.]

## Top 3 Risks
1. [Risk with specific data point]
2. [Risk with specific data point]
3. [Risk with specific data point]

## Value-Add Opportunities
- [Specific opportunity with estimated impact]
- [Specific opportunity with estimated impact]
- [Specific opportunity with estimated impact]

## Next Action
[One specific, actionable next step the acquisitions team should take this week]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a senior self-storage acquisition analyst. Always respond in the exact structured format requested. Be specific, use numbers, and make actionable recommendations. Never use generic filler text.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return res.status(200).json({ analysis: '**Failed to analyze deal.** Please try again.' });
    }

    const data = await response.json() as any;
    const analysis = data.choices?.[0]?.message?.content || 'Unable to generate analysis';
    return res.status(200).json({ analysis });
  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

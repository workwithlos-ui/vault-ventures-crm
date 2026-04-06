import { getDealById } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deal = await getDealById(id);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ analysis: 'AI analysis not configured. Please set OPENAI_API_KEY.' });
    }

    const prompt = `Analyze this self-storage deal:
Property: ${deal.propertyName}
Location: ${deal.address}, ${deal.city}, ${deal.state}
Units: ${deal.units}
Occupancy: ${deal.occupancyRate}%
Avg Rent: $${deal.avgRent}
Purchase Price: $${deal.purchasePrice}
Seller: ${deal.sellerName}

Provide a brief deal analysis with key metrics, red flags, and recommendations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI error:', error);
      return NextResponse.json({ analysis: 'Failed to analyze deal. Please try again.' });
    }

    const data = await response.json() as any;
    const analysis = data.choices?.[0]?.message?.content || 'Unable to generate analysis';

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('Error analyzing deal:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { getDeals, createDeal } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deals = await getDeals();
    return NextResponse.json(deals);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const id = await createDeal(data);
    return NextResponse.json({ id, success: true });
  } catch (err) {
    console.error('Error creating deal:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

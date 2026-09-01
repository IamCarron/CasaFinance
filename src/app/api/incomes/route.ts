export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyIncome, saveMonthlyIncome, deleteMonthlyIncome } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = searchParams.get('month') || defaultMonth;

    const data = getMonthlyIncome(month);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { month, partner1Income, partner2Income, notes } = body;

    if (!month || partner1Income == null || partner2Income == null) {
      return NextResponse.json({ error: 'Missing required fields (month, partner1Income, partner2Income)' }, { status: 400 });
    }

    const updated = saveMonthlyIncome(month, Number(partner1Income), Number(partner2Income), notes);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json({ error: 'Missing month param' }, { status: 400 });
    }

    deleteMonthlyIncome(month);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

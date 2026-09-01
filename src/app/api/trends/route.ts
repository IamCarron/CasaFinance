export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getMonthlyTrends } from '@/lib/db';

export async function GET() {
  try {
    const trends = getMonthlyTrends(6);
    return NextResponse.json(trends);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

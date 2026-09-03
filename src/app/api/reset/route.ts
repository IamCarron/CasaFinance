export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    // 1. Enforce explicit confirmation keyword in JSON payload
    const body = await req.json().catch(() => ({}));
    const confirm = String(body.confirmation || '').trim().toUpperCase();
    const validConfirmations = ['BORRAR', 'DELETE', 'RESET', 'CONFIRM_RESET'];
    if (!validConfirmations.includes(confirm)) {
      return NextResponse.json(
        { error: 'Bad Request: Explicit confirmation required in payload (e.g. { "confirmation": "BORRAR" })' },
        { status: 400 }
      );
    }

    // 2. Strict administrative authentication
    const expectedToken = process.env.ADMIN_TOKEN;
    if (expectedToken) {
      const authHeader = req.headers.get('Authorization');
      const token = authHeader?.split(' ')[1];
      if (!token || token !== expectedToken) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid admin token' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production environments, ADMIN_TOKEN must be defined to prevent unauthorized unauthenticated resets
      return NextResponse.json(
        { error: 'Forbidden: ADMIN_TOKEN must be configured in environment (.env) to allow factory reset in production' },
        { status: 403 }
      );
    }

    resetDatabase();
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

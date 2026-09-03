export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const expectedToken = process.env.ADMIN_TOKEN;
    if (expectedToken) {
      const authHeader = req.headers.get('Authorization');
      const token = authHeader?.split(' ')[1];
      if (token !== expectedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    resetDatabase();
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

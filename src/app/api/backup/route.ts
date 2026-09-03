export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { exportAllData, importAllData } from '@/lib/db';

function isAuthorized(req: Request) {
  const expectedToken = process.env.ADMIN_TOKEN;
  const botToken = process.env.BOT_API_TOKEN;
  const isProd = process.env.NODE_ENV === 'production';

  // 1. If ADMIN_TOKEN is set, it MUST match
  if (expectedToken) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    return token === expectedToken;
  }

  // 2. In production or when bot tokens are configured, anonymous backup operations are strictly forbidden
  if (isProd || botToken) {
    return false;
  }

  // 3. Only allowed in non-production local development without any tokens
  return true;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = exportAllData();
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="casafinance-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const ok = importAllData(body);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

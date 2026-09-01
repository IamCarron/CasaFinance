export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';

function isAuthorized(req: Request) {
  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken) return true;
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  return token === expectedToken;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const settings = getSettings();
    return NextResponse.json(settings);
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

    if (body.ocrEndpoint) {
      try {
        const url = new URL(body.ocrEndpoint);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return NextResponse.json({ error: 'Invalid ocrEndpoint protocol (must be http or https)' }, { status: 400 });
        }
      } catch (e) {
        return NextResponse.json({ error: 'Invalid ocrEndpoint format' }, { status: 400 });
      }
    }

    const updated = updateSettings(body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

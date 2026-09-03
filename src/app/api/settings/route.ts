export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';

function isReadAuthorized(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const botToken = process.env.BOT_API_TOKEN;
  if (!adminToken && !botToken) return true;
  
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (adminToken && token === adminToken) return true;
  if (botToken && token === botToken) return true;
  
  return false;
}

function isWriteAuthorized(req: Request) {
  // If the system has not yet been onboarded, allow initial setup to initialize the household
  const currentSettings = getSettings();
  if (!currentSettings.isOnboarded) {
    return true;
  }

  const adminToken = process.env.ADMIN_TOKEN;
  const botToken = process.env.BOT_API_TOKEN;
  const isProd = process.env.NODE_ENV === 'production';

  // 1. If ADMIN_TOKEN is set, it MUST match
  if (adminToken) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    return token === adminToken;
  }
  
  // 2. If ADMIN_TOKEN is NOT set:
  // When BOT_API_TOKEN is active or in production, anonymous writes are strictly forbidden
  if (botToken || isProd) {
    return false;
  }
  
  // 3. Only allowed in non-production local development without any tokens
  return true;
}

export async function GET(req: Request) {
  try {
    const settings = getSettings();
    const isAuth = isReadAuthorized(req);

    if (!isAuth) {
      // Return safe public settings for the household UI (omits sensitive keys/PIN)
      return NextResponse.json({
        partner1Name: settings.partner1Name,
        partner2Name: settings.partner2Name,
        partner1Income: settings.partner1Income,
        partner2Income: settings.partner2Income,
        splitMode: settings.splitMode,
        customRatioPartner1: settings.customRatioPartner1,
        currencySymbol: settings.currencySymbol,
        currencyCode: settings.currencyCode,
        isOnboarded: settings.isOnboarded,
        incomeType: settings.incomeType,
        partner1IncomeType: settings.partner1IncomeType,
        partner2IncomeType: settings.partner2IncomeType,
        botPlatform: settings.botPlatform,
        whatsappGroupName: settings.whatsappGroupName,
        telegramGroupName: settings.telegramGroupName,
        language: settings.language,
        hasPin: Boolean(settings.pinCode),
        ocrProvider: settings.ocrProvider,
        ocrEndpoint: settings.ocrEndpoint,
        ocrModel: settings.ocrModel,
        isProtected: Boolean(process.env.ADMIN_TOKEN),
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!isWriteAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required to modify settings' }, { status: 401 });
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

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Shared in-memory status store
interface BotState {
  status: 'disconnected' | 'qr_ready' | 'connected';
  qrDataUrl?: string;
  phone?: string;
  updatedAt: number;
  logoutRequested?: boolean;
}

const g = globalThis as unknown as { __casafinance_bot_state?: BotState };
if (!g.__casafinance_bot_state) {
  g.__casafinance_bot_state = {
    status: 'disconnected',
    updatedAt: Date.now(),
    logoutRequested: false,
  };
}

export async function GET(req: NextRequest) {
  const state = g.__casafinance_bot_state!;
  
  // If QR was not refreshed in the last 60 seconds and still in qr_ready, treat as expired
  if (state.status === 'qr_ready' && Date.now() - state.updatedAt > 60000) {
    state.status = 'disconnected';
    state.qrDataUrl = undefined;
  }

  return NextResponse.json({
    status: state.status,
    qrDataUrl: state.qrDataUrl,
    phone: state.phone,
    updatedAt: state.updatedAt,
    logoutRequested: !!state.logoutRequested,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const state = g.__casafinance_bot_state!;

    // Polling hook for bot to check if user clicked "Disconnect / Logout" from web UI
    if (body.action === 'check_logout') {
      const requested = !!state.logoutRequested;
      if (requested) {
        state.logoutRequested = false;
      }
      return NextResponse.json({ logoutRequested: requested });
    }

    if (body.status === 'qr_ready') {
      state.status = 'qr_ready';
      state.qrDataUrl = body.qr;
      state.updatedAt = Date.now();
    } else if (body.status === 'connected') {
      state.status = 'connected';
      state.qrDataUrl = undefined;
      state.phone = body.phone || undefined;
      state.updatedAt = Date.now();
    } else if (body.status === 'disconnected') {
      state.status = 'disconnected';
      state.qrDataUrl = undefined;
      state.updatedAt = Date.now();
    }

    return NextResponse.json({ ok: true, state: state.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE() {
  const state = g.__casafinance_bot_state!;
  state.status = 'disconnected';
  state.qrDataUrl = undefined;
  state.phone = undefined;
  state.updatedAt = Date.now();
  state.logoutRequested = true;

  // Try to wipe credentials directory if accessible
  try {
    const authDir = path.resolve(process.cwd(), 'data', 'whatsapp-auth');
    if (fs.existsSync(authDir)) {
      const files = fs.readdirSync(authDir);
      for (const file of files) {
        fs.unlinkSync(path.join(authDir, file));
      }
    }
  } catch (e) {
    // Ignore permissions if run inside container
  }

  return NextResponse.json({ ok: true, message: 'Logged out successfully' });
}

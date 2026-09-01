export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

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

    const db = getDb();
    
    db.exec('BEGIN TRANSACTION');
    db.exec('DELETE FROM expenses');
    db.exec('DELETE FROM fixed_budget');
    db.exec('DELETE FROM savings_goals');
    db.exec('DELETE FROM monthly_incomes');
    db.exec('DELETE FROM categories');
    db.exec('DELETE FROM settings');
    
    try {
      db.exec('DELETE FROM sqlite_sequence');
    } catch(e) {}
    
    db.exec('COMMIT');
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    try { getDb().exec('ROLLBACK'); } catch(e) {}
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

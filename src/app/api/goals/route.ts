export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getSavingsGoals, saveSavingsGoal, adjustGoalAmount, deleteSavingsGoal } from '@/lib/db';

export async function GET() {
  try {
    const goals = getSavingsGoals();
    return NextResponse.json(goals);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.targetAmount) {
      return NextResponse.json({ error: 'Name and targetAmount are required' }, { status: 400 });
    }

    const saved = saveSavingsGoal({
      id: body.id,
      name: body.name.trim(),
      targetAmount: Number(body.targetAmount),
      currentAmount: body.currentAmount !== undefined ? Number(body.currentAmount) : 0,
      icon: body.icon || 'PiggyBank',
      color: body.color || '#10b981',
      targetDate: body.targetDate,
    });

    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, delta } = body;
    if (!id || delta === undefined) {
      return NextResponse.json({ error: 'id and delta are required' }, { status: 400 });
    }

    const updated = adjustGoalAmount(id, Number(delta));
    if (!updated) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    deleteSavingsGoal(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

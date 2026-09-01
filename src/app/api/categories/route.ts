export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getCategories, saveCategory, deleteCategory, getDb } from '@/lib/db';

export async function GET() {
  try {
    const categories = getCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cat = saveCategory(body);
    return NextResponse.json(cat);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 });
    }

    // Check if this category has associated data before deleting
    const db = getDb();
    const expCount = db.prepare('SELECT count(*) as count FROM expenses WHERE category_id = ?').get(id) as { count: number | bigint };
    const budCount = db.prepare('SELECT count(*) as count FROM fixed_budget WHERE category_id = ?').get(id) as { count: number | bigint };
    const totalRefs = Number(expCount.count) + Number(budCount.count);

    if (totalRefs > 0) {
      return NextResponse.json({
        error: `Esta categoría tiene ${Number(expCount.count)} gastos y ${Number(budCount.count)} partidas de presupuesto asociadas. Mueve esos registros a otra categoría antes de eliminarla.`,
        hasReferences: true,
        expenseCount: Number(expCount.count),
        budgetCount: Number(budCount.count),
      }, { status: 409 });
    }

    const success = deleteCategory(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

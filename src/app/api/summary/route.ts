export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getSettings, getCategories, getFixedBudgetItems, getExpenses, getMonthlyIncome } from '@/lib/db';
import { buildMonthlySummary } from '@/lib/budget-calculator';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = searchParams.get('month') || defaultMonth;

    const settings = getSettings();
    const categories = getCategories();
    const budgetItems = getFixedBudgetItems();
    const expenses = getExpenses(month);
    const effectiveIncomes = getMonthlyIncome(month);

    const summary = buildMonthlySummary(month, settings, categories, budgetItems, expenses, effectiveIncomes);
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


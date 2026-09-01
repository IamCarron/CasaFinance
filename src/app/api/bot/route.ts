import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, getCategories, getSettings, saveExpense, getDb, getMonthlyIncome } from '@/lib/db';
import { buildMonthlySummary } from '@/lib/budget-calculator';
import { parseExpenseMessage } from '@/lib/nlp-parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sender, token } = body;

    // Optional API Key check: only enforce if BOT_API_TOKEN is explicitly configured
    const expectedToken = process.env.BOT_API_TOKEN;
    if (expectedToken && expectedToken.trim() !== '') {
      if (token !== expectedToken) {
        return NextResponse.json({ error: 'Unauthorized: invalid bot token' }, { status: 401 });
      }
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();
    const settings = getSettings();
    const categories = getCategories();
    const currency = settings.currencySymbol || '€';
    const p1Name = settings.partner1Name || 'Tú';
    const p2Name = settings.partner2Name || 'Pareja';

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const isEn = settings.language === 'en';

    // 1. Command: !ayuda / /ayuda / help / /start
    if (['!ayuda', '/ayuda', 'ayuda', '!help', '/help', 'help', '/start'].includes(lower)) {
      const reply = isEn
        ? [
            '🏠 *CasaFinance Bot - Commands:*',
            '',
            '• *Joint account expense:* `42.50 Groceries` or `Dinner 60`',
            '• *Out-of-pocket advance:* `18.50 Pharmacy advance` (or `paid by Sam`)',
            '• *Equal 50/50 split:* `Dinner 60 50/50` or `half and half`',
            '• *Check balance:* `/balance` or `!balance`',
            '• *Monthly summary:* `/summary` or `!summary`',
            '• *Recent expenses:* `/expenses` or `!expenses`',
          ].join('\n')
        : [
            '🏠 *CasaFinance Bot - Comandos:*',
            '',
            '• *Gasto cuenta común:* `42.50 Mercadona` o `Cena 60`',
            '• *Adelanto de bolsillo:* `18.50 Farmacia adelanto` (o `pagó Carlos`)',
            '• *División 50/50:* `Cena 60 50/50` o `a medias`',
            '• *Ver balance / deudas:* `/balance` o `!balance`',
            '• *Ver resumen:* `/resumen` o `!resumen`',
            '• *Últimos gastos:* `/gastos` o `!gastos`',
          ].join('\n');
      return NextResponse.json({ type: 'help', reply });
    }

    // 2. Command: !balance / /balance / liquidacion
    if (['!balance', '/balance', 'balance', '!liquidacion', '/liquidacion', 'liquidacion'].includes(lower)) {
      const allExpenses = getExpenses(currentMonth);
      const fixedBudget = (getDb().prepare('SELECT * FROM fixed_budget').all() as any[]).map((r) => ({
        id: r.id,
        categoryId: r.category_id,
        name: r.name,
        amount: Number(r.amount),
        splitModeOverride: r.split_mode_override || null,
        notes: r.notes,
        isActive: Boolean(r.is_active),
      }));

      const effectiveIncomes = getMonthlyIncome(currentMonth);
      const summary = buildMonthlySummary(currentMonth, settings, categories, fixedBudget, allExpenses, effectiveIncomes);
      const settlement = summary.settlement;

      let reply = '';
      if (settlement.amountToPay > 0.01) {
        reply = isEn
          ? `⚖️ *Balance for ${currentMonth}:*\n👉 *${settlement.debtor}* must transfer *${settlement.amountToPay.toFixed(2)} ${currency}* to *${settlement.creditor}* to settle out-of-pocket advances.`
          : `⚖️ *Balance de ${currentMonth}:*\n👉 *${settlement.debtor}* debe transferir *${settlement.amountToPay.toFixed(2)} ${currency}* a *${settlement.creditor}* para saldar los adelantos particulares.`;
      } else {
        reply = isEn
          ? `✅ *Balance for ${currentMonth}:*\nAll accounts are completely up to date! No pending debts for this month.`
          : `✅ *Balance de ${currentMonth}:*\n¡Cuentas completamente al día! No hay deudas pendientes por adelantos este mes.`;
      }
      return NextResponse.json({ type: 'balance', reply });
    }

    // 3. Command: !resumen / /resumen / summary
    if (['!resumen', '/resumen', 'resumen', '!summary', '/summary', 'summary'].includes(lower)) {
      const allExpenses = getExpenses(currentMonth);
      const fixedBudget = (getDb().prepare('SELECT * FROM fixed_budget').all() as any[]).map((r) => ({
        id: r.id,
        categoryId: r.category_id,
        name: r.name,
        amount: Number(r.amount),
        splitModeOverride: r.split_mode_override || null,
        notes: r.notes,
        isActive: Boolean(r.is_active),
      }));

      const effectiveIncomes = getMonthlyIncome(currentMonth);
      const summary = buildMonthlySummary(currentMonth, settings, categories, fixedBudget, allExpenses, effectiveIncomes);

      const reply = isEn
        ? [
            `📊 *CasaFinance Summary (${currentMonth})*`,
            `• *Total Spent:* ${summary.totalSpentMonth.toFixed(2)} ${currency}`,
            `• *Joint Account:* ${summary.totalSpentCommon.toFixed(2)} ${currency} (Remaining: ${summary.commonRemaining.toFixed(2)} ${currency})`,
            `• *Out-of-Pocket Advances:* ${summary.totalSpentOutOfPocket.toFixed(2)} ${currency}`,
            `• *Transactions:* ${allExpenses.length}`,
          ].join('\n')
        : [
            `📊 *Resumen CasaFinance (${currentMonth})*`,
            `• *Total Gastado:* ${summary.totalSpentMonth.toFixed(2)} ${currency}`,
            `• *Cuenta Común:* ${summary.totalSpentCommon.toFixed(2)} ${currency} (Restante: ${summary.commonRemaining.toFixed(2)} ${currency})`,
            `• *Adelantos particulares:* ${summary.totalSpentOutOfPocket.toFixed(2)} ${currency}`,
            `• *Movimientos totales:* ${allExpenses.length}`,
          ].join('\n');

      return NextResponse.json({ type: 'summary', reply });
    }

    // 4. Command: !gastos / /gastos / /expenses
    if (['!gastos', '/gastos', 'gastos', '!expenses', '/expenses', 'expenses'].includes(lower)) {
      const recent = getExpenses(currentMonth).slice(0, 5);
      if (recent.length === 0) {
        return NextResponse.json({
          type: 'expenses',
          reply: isEn ? `No expenses recorded for ${currentMonth} yet.` : `No hay gastos registrados en ${currentMonth} aún.`,
        });
      }

      const lines = recent.map((e) => {
        const cat = categories.find((c) => c.id === e.categoryId);
        const payer = e.paidBy === 'common' ? (isEn ? 'Joint Account' : 'Cuenta Común') : e.paidBy === 'partner1' ? p1Name : p2Name;
        return `• *${e.title}:* ${e.amount.toFixed(2)} ${currency} (${cat?.name || 'General'}, ${payer})`;
      });

      const header = isEn
        ? `📝 *Latest ${recent.length} expenses for ${currentMonth}:*`
        : `📝 *Últimos ${recent.length} gastos de ${currentMonth}:*`;
      const reply = `${header}\n${lines.join('\n')}`;
      return NextResponse.json({ type: 'expenses', reply });
    }

    // 5. Parse natural language expense
    const parsed = parseExpenseMessage(trimmed, categories, settings, sender);
    if (!parsed) {
      // If the message started with an explicit command/prefix, provide help
      const isExplicitExpenseAttempt = /^(\/gasto|!gasto|\+|gasto:|\/expense|!expense|expense:)/i.test(trimmed);
      if (isExplicitExpenseAttempt) {
        return NextResponse.json({
          type: 'unknown',
          reply: isEn
            ? '❓ Unrecognized format. Try: `42.50 Groceries` or `/expense 42.50 Groceries`.'
            : '❓ Formato no reconocido. Envía por ejemplo: `42.50 Mercadona` o `/gasto 42.50 Mercadona`.',
        });
      }
      // SILENTLY IGNORE normal conversational messages in the group (zero bot spam)
      return NextResponse.json({ type: 'ignored' });
    }

    // Save expense in database
    const todayStr = now.toISOString().split('T')[0];
    const saved = saveExpense({
      title: parsed.title,
      amount: parsed.amount,
      date: todayStr,
      categoryId: parsed.categoryId,
      paidBy: parsed.paidBy,
      splitBetween: parsed.splitBetween,
      splitModeOverride: parsed.splitModeOverride,
      notes: isEn
        ? `Added via Messaging Bot${sender ? ` by ${sender}` : ''}`
        : `Añadido vía Bot de Mensajería${sender ? ` por ${sender}` : ''}`,
    });

    const category = categories.find((c) => c.id === parsed.categoryId);
    const catName = category?.name || (isEn ? 'General' : 'General');

    let payerLabel = isEn ? '💳 Joint Account' : '💳 Cuenta Común';
    if (parsed.paidBy === 'partner1') payerLabel = isEn ? `⚡ Pocket advance by ${p1Name}` : `⚡ Adelanto de ${p1Name}`;
    if (parsed.paidBy === 'partner2') payerLabel = isEn ? `⚡ Pocket advance by ${p2Name}` : `⚡ Adelanto de ${p2Name}`;

    let splitLabel = '';
    if (parsed.splitModeOverride === 'equal') {
      splitLabel = isEn ? ' • 50/50 equal' : ' • 50/50 forzado';
    }

    const reply = isEn
      ? `✅ *Expense recorded:* ${saved.title}\n💰 *${saved.amount.toFixed(2)} ${currency}*\n🏷️ ${catName} • ${payerLabel}${splitLabel}`
      : `✅ *Gasto guardado:* ${saved.title}\n💰 *${saved.amount.toFixed(2)} ${currency}*\n🏷️ ${catName} • ${payerLabel}${splitLabel}`;

    return NextResponse.json({
      type: 'expense_created',
      expense: saved,
      reply,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

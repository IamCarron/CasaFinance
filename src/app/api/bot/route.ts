import { NextRequest, NextResponse } from 'next/server';
import {
  getExpenses,
  getCategories,
  getSettings,
  saveExpense,
  deleteExpense,
  getDb,
  getMonthlyIncome,
  getSavingsGoals,
  adjustGoalAmount,
  getFixedBudgetItems,
} from '@/lib/db';
import { buildMonthlySummary } from '@/lib/budget-calculator';
import { parseExpenseMessage } from '@/lib/nlp-parser';

function buildProgressBar(current: number, target: number, size = 10): string {
  if (target <= 0) return '[░░░░░░░░░░] 0%';
  const ratio = Math.max(0, Math.min(1, current / target));
  const filled = Math.round(ratio * size);
  const empty = size - filled;
  const pct = Math.round(ratio * 100);
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
}

function mapRowToExpense(r: any) {
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    amount: Number(r.amount),
    date: r.date,
    categoryId: r.category_id,
    paidBy: r.paid_by,
    splitBetween: r.split_between,
    splitModeOverride: r.split_mode_override || null,
    notes: r.notes,
    receiptUrl: r.receipt_url || undefined,
    isSettlement: Boolean(r.is_settlement),
    createdAt: r.created_at,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sender, token, quotedMessage, action, targetId, delta } = body;

    // Optional API Key check: only enforce if BOT_API_TOKEN is explicitly configured
    const expectedToken = process.env.BOT_API_TOKEN;
    if (expectedToken && expectedToken.trim() !== '') {
      if (token !== expectedToken) {
        return NextResponse.json({ error: 'Unauthorized: invalid bot token' }, { status: 401 });
      }
    }

    const settings = getSettings();
    const categories = getCategories();
    const currency = settings.currencySymbol || '€';
    const p1Name = settings.partner1Name || 'Tú';
    const p2Name = settings.partner2Name || 'Pareja';
    const isEn = settings.language === 'en';

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayStr = now.toISOString().split('T')[0];

    // =========================================================================
    // 1. Direct Actions & Button Callbacks (Telegram callbacks & Webhooks)
    // =========================================================================
    if (action) {
      if (action === 'delete' && targetId) {
        const db = getDb();
        const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(targetId) as any;
        const ok = deleteExpense(targetId);
        if (ok && existing) {
          const reply = isEn
            ? `🗑️ *Expense deleted:* ${existing.title} (${Number(existing.amount).toFixed(2)} ${currency}). Balance updated.`
            : `🗑️ *Gasto eliminado:* ${existing.title} (${Number(existing.amount).toFixed(2)} ${currency}). El balance ha sido actualizado.`;
          return NextResponse.json({ type: 'expense_deleted', reply });
        }
        return NextResponse.json({
          type: 'expense_deleted',
          reply: isEn ? '⚠️ Expense not found or already deleted.' : '⚠️ Gasto no encontrado o ya eliminado.',
        });
      }

      if (action === 'split_equal' && targetId) {
        const db = getDb();
        const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(targetId) as any;
        const existing = mapRowToExpense(row);
        if (existing) {
          saveExpense({
            ...existing,
            splitModeOverride: 'equal',
          });
          const reply = isEn
            ? `⚖️ *Split mode updated to 50/50:* ${existing.title} (${Number(existing.amount).toFixed(2)} ${currency}) is now split equally.`
            : `⚖️ *Reparto actualizado a 50/50:* ${existing.title} (${Number(existing.amount).toFixed(2)} ${currency}) ahora se divide a partes iguales.`;
          return NextResponse.json({ type: 'expense_updated', reply });
        }
      }

      if (action === 'settle') {
        const allExpenses = getExpenses(currentMonth);
        const fixedBudget = getFixedBudgetItems();
        const effectiveIncomes = getMonthlyIncome(currentMonth);
        const summary = buildMonthlySummary(currentMonth, settings, categories, fixedBudget, allExpenses, effectiveIncomes);
        const settlement = summary.settlement;

        if (settlement.amountToPay > 0.01) {
          const debtorKey = settlement.debtor === p1Name ? 'partner1' : 'partner2';
          const creditorKey = settlement.creditor === p1Name ? 'partner1' : 'partner2';
          saveExpense({
            title: isEn
              ? `Debt settlement (${settlement.debtor} to ${settlement.creditor})`
              : `Compensación de gastos (${settlement.debtor} a ${settlement.creditor})`,
            amount: settlement.amountToPay,
            date: todayStr,
            categoryId: categories[0]?.id || 'cat-1',
            paidBy: debtorKey,
            splitBetween: creditorKey,
            isSettlement: true,
            notes: isEn ? 'Settlement recorded via Companion Bot' : 'Liquidación registrada mediante Bot',
          });

          const reply = isEn
            ? `✨ *Debt settled!* Recorded transfer of *${settlement.amountToPay.toFixed(2)} ${currency}* from *${settlement.debtor}* to *${settlement.creditor}*.\nAll accounts for ${currentMonth} are now balanced (0.00 ${currency} pending).`
            : `✨ *¡Deuda saldada!* Se ha registrado la transferencia de *${settlement.amountToPay.toFixed(2)} ${currency}* de *${settlement.debtor}* a *${settlement.creditor}*.\nLas cuentas de ${currentMonth} quedan al día (0,00 ${currency} pendientes).`;
          return NextResponse.json({ type: 'settled', reply });
        } else {
          const reply = isEn
            ? `✅ *All balanced!* There are no pending debts for ${currentMonth}.`
            : `✅ *¡Cuentas al día!* No hay deudas pendientes por saldar este mes.`;
          return NextResponse.json({ type: 'settled', reply });
        }
      }

      if (action === 'adjust_goal' && targetId && typeof delta === 'number') {
        const updated = adjustGoalAmount(targetId, delta);
        if (updated) {
          const bar = buildProgressBar(updated.currentAmount, updated.targetAmount);
          const reply = isEn
            ? `🎯 *Savings Pot updated:* Added *${delta.toFixed(2)} ${currency}* to *${updated.name}*.\nTotal: *${updated.currentAmount.toFixed(2)} / ${updated.targetAmount.toFixed(2)} ${currency}* ${bar}`
            : `🎯 *Hucha actualizada:* Añadidos *${delta.toFixed(2)} ${currency}* a *${updated.name}*.\nTotal: *${updated.currentAmount.toFixed(2)} / ${updated.targetAmount.toFixed(2)} ${currency}* ${bar}`;
          return NextResponse.json({ type: 'goal_updated', reply });
        }
      }
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // =========================================================================
    // 2. Reply to Message Handling (Delete / Edit by quoting bot message)
    // =========================================================================
    if (quotedMessage && typeof quotedMessage === 'string') {
      const titleMatch = quotedMessage.match(/(?:Gasto guardado|Gasto actualizado|Expense recorded|Expense updated):\*\s*([^\n\r]+)/i);
      const amountMatch = quotedMessage.match(/💰\s*\*([0-9.,]+)/i);

      if (titleMatch || amountMatch) {
        const db = getDb();
        let matchedExpense: any = null;

        if (titleMatch && amountMatch) {
          const qTitle = titleMatch[1].trim();
          const qAmount = parseFloat(amountMatch[1].replace(',', '.'));
          const row = db
            .prepare(
              'SELECT * FROM expenses WHERE title = ? AND ABS(amount - ?) < 0.05 AND is_settlement = 0 ORDER BY created_at DESC LIMIT 1'
            )
            .get(qTitle, qAmount);
          matchedExpense = mapRowToExpense(row);
        }

        if (!matchedExpense && titleMatch) {
          const row = db
            .prepare(
              'SELECT * FROM expenses WHERE title LIKE ? AND is_settlement = 0 ORDER BY created_at DESC LIMIT 1'
            )
            .get(`%${titleMatch[1].trim()}%`);
          matchedExpense = mapRowToExpense(row);
        }

        if (matchedExpense) {
          // A. Reply to Delete
          const isDeleteCmd = /^(borrar|eliminar|borra|borralo|cancela|cancelar|delete|quitar|deshacer|\/borrar|\/delete|\/undo)$/i.test(trimmed);
          if (isDeleteCmd) {
            deleteExpense(matchedExpense.id);
            const reply = isEn
              ? `🗑️ *Expense deleted:* ${matchedExpense.title} (${Number(matchedExpense.amount).toFixed(2)} ${currency})\nMonthly totals and balance have been updated.`
              : `🗑️ *Gasto eliminado:* ${matchedExpense.title} (${Number(matchedExpense.amount).toFixed(2)} ${currency})\nEl balance y los totales del mes han sido actualizados.`;
            return NextResponse.json({ type: 'expense_deleted', reply });
          }

          // B. Reply to Edit / Correct
          let updated = false;
          const expToSave = { ...matchedExpense, amount: Number(matchedExpense.amount) };

          // New amount? (e.g. "eran 35€", "35€", "cambiar a 40")
          const newAmountMatch = trimmed.match(/(?:eran|cambiar a|poner|son)?\s*([0-9]+(?:[.,][0-9]{1,2})?)\s*(?:€|eur|euros)?/i);
          if (newAmountMatch && parseFloat(newAmountMatch[1].replace(',', '.')) > 0) {
            expToSave.amount = parseFloat(newAmountMatch[1].replace(',', '.'));
            updated = true;
          }

          // New payer?
          const isP1 = new RegExp(`\\b(${p1Name}|yo|m[ií]o|me toca)\\b`, 'i').test(trimmed);
          const isP2 = new RegExp(`\\b(${p2Name}|ella|[eé]l|pareja)\\b`, 'i').test(trimmed);
          const isCommon = /\b(comun|común|cuenta común|conjunta)\b/i.test(trimmed);

          if (isP1) { expToSave.paidBy = 'partner1'; updated = true; }
          else if (isP2) { expToSave.paidBy = 'partner2'; updated = true; }
          else if (isCommon) { expToSave.paidBy = 'common'; updated = true; }

          // Split 50/50 override?
          if (/\b(50\/50|a medias|equitativo|mitad)\b/i.test(trimmed)) {
            expToSave.splitModeOverride = 'equal';
            updated = true;
          } else if (/\b(proporcional|normal)\b/i.test(trimmed)) {
            expToSave.splitModeOverride = null;
            updated = true;
          }

          // Category change?
          for (const cat of categories) {
            if (new RegExp(`\\b${cat.name}\\b`, 'i').test(trimmed)) {
              expToSave.categoryId = cat.id;
              updated = true;
              break;
            }
          }

          if (updated) {
            saveExpense(expToSave);
            const cat = categories.find((c) => c.id === expToSave.categoryId);
            const catName = cat?.name || 'General';
            let payerLabel = isEn ? '💳 Joint Account' : '💳 Cuenta Común';
            if (expToSave.paidBy === 'partner1') payerLabel = isEn ? `⚡ ${p1Name}` : `⚡ ${p1Name}`;
            if (expToSave.paidBy === 'partner2') payerLabel = isEn ? `⚡ ${p2Name}` : `⚡ ${p2Name}`;

            const reply = isEn
              ? `✏️ *Expense updated:* ${expToSave.title}\n💰 *${expToSave.amount.toFixed(2)} ${currency}*\n🏷️ ${catName} • ${payerLabel}${expToSave.splitModeOverride === 'equal' ? ' (50/50)' : ''}`
              : `✏️ *Gasto actualizado:* ${expToSave.title}\n💰 *${expToSave.amount.toFixed(2)} ${currency}*\n🏷️ ${catName} • ${payerLabel}${expToSave.splitModeOverride === 'equal' ? ' (50/50)' : ''}`;
            return NextResponse.json({ type: 'expense_updated', expense: expToSave, reply });
          }
        }
      }
    }

    // =========================================================================
    // 3. Standalone Undo Command: /deshacer or /undo
    // =========================================================================
    if (['/deshacer', '!deshacer', 'deshacer', '/undo', '!undo', 'undo'].includes(lower)) {
      const db = getDb();
      const row = db
        .prepare('SELECT * FROM expenses WHERE is_settlement = 0 ORDER BY created_at DESC LIMIT 1')
        .get() as any;
      const lastExp = mapRowToExpense(row);

      if (lastExp) {
        deleteExpense(lastExp.id);
        const reply = isEn
          ? `🗑️ *Last expense undone:* ${lastExp.title} (${Number(lastExp.amount).toFixed(2)} ${currency})\nThe record has been removed.`
          : `🗑️ *Último gasto deshecho:* ${lastExp.title} (${Number(lastExp.amount).toFixed(2)} ${currency})\nEl registro ha sido eliminado.`;
        return NextResponse.json({ type: 'expense_deleted', reply });
      }

      return NextResponse.json({
        type: 'expense_deleted',
        reply: isEn ? 'ℹ️ No recent expenses found to undo.' : 'ℹ️ No hay ningún gasto reciente para deshacer.',
      });
    }

    // =========================================================================
    // 4. Standalone Settle Command: /saldar
    // =========================================================================
    if (['/saldar', '!saldar', 'saldar', '/settle', '!settle', 'settle'].includes(lower)) {
      const allExpenses = getExpenses(currentMonth);
      const fixedBudget = getFixedBudgetItems();
      const effectiveIncomes = getMonthlyIncome(currentMonth);
      const summary = buildMonthlySummary(currentMonth, settings, categories, fixedBudget, allExpenses, effectiveIncomes);
      const settlement = summary.settlement;

      if (settlement.amountToPay > 0.01) {
        const debtorKey = settlement.debtor === p1Name ? 'partner1' : 'partner2';
        const creditorKey = settlement.creditor === p1Name ? 'partner1' : 'partner2';
        saveExpense({
          title: isEn
            ? `Debt settlement (${settlement.debtor} to ${settlement.creditor})`
            : `Compensación de gastos (${settlement.debtor} a ${settlement.creditor})`,
          amount: settlement.amountToPay,
          date: todayStr,
          categoryId: categories[0]?.id || 'cat-1',
          paidBy: debtorKey,
          splitBetween: creditorKey,
          isSettlement: true,
          notes: isEn ? 'Settlement recorded via Companion Bot' : 'Liquidación registrada mediante Bot',
        });

        const reply = isEn
          ? `✨ *Debt settled!* Recorded transfer of *${settlement.amountToPay.toFixed(2)} ${currency}* from *${settlement.debtor}* to *${settlement.creditor}*.\nAll accounts for ${currentMonth} are now balanced (0.00 ${currency} pending).`
          : `✨ *¡Deuda saldada!* Se ha registrado la transferencia de *${settlement.amountToPay.toFixed(2)} ${currency}* de *${settlement.debtor}* a *${settlement.creditor}*.\nLas cuentas de ${currentMonth} quedan al día (0,00 ${currency} pendientes).`;
        return NextResponse.json({ type: 'settled', reply });
      } else {
        const reply = isEn
          ? `✅ *All balanced!* There are no pending debts for ${currentMonth}.`
          : `✅ *¡Cuentas al día!* No hay deudas pendientes por saldar este mes.`;
        return NextResponse.json({ type: 'settled', reply });
      }
    }

    // =========================================================================
    // 5. Savings Goals Commands: /huchas, /hucha [name] [amount]
    // =========================================================================
    const goalContribMatch = trimmed.match(
      /^(?:\/hucha|!hucha|hucha|\/ahorro|!ahorro|ahorro)\s+([a-záéíóúñ0-9_\-\s]+?)\s+([0-9]+(?:[.,][0-9]{1,2})?)\s*€?$/i
    );
    if (goalContribMatch) {
      const targetName = goalContribMatch[1].trim().toLowerCase();
      const addAmount = parseFloat(goalContribMatch[2].replace(',', '.'));
      const goals = getSavingsGoals();
      const goal = goals.find((g) => g.name.toLowerCase().includes(targetName));

      if (goal && addAmount > 0) {
        const updated = adjustGoalAmount(goal.id, addAmount);
        if (updated) {
          const bar = buildProgressBar(updated.currentAmount, updated.targetAmount);
          const reply = isEn
            ? `🎯 *Savings Pot updated:* Added *${addAmount.toFixed(2)} ${currency}* to *${updated.name}*.\nTotal: *${updated.currentAmount.toFixed(2)} / ${updated.targetAmount.toFixed(2)} ${currency}* ${bar}`
            : `🎯 *¡Hucha actualizada!* Añadidos *${addAmount.toFixed(2)} ${currency}* a *${updated.name}*.\nTotal: *${updated.currentAmount.toFixed(2)} / ${updated.targetAmount.toFixed(2)} ${currency}* ${bar}`;
          return NextResponse.json({ type: 'goal_updated', reply });
        }
      } else if (!goal) {
        const reply = isEn
          ? `⚠️ Pot not found. Use \`/goals\` to see available savings pots.`
          : `⚠️ No encontré ninguna hucha con ese nombre. Usa \`/huchas\` para ver vuestras metas activas.`;
        return NextResponse.json({ type: 'goal_error', reply });
      }
    }

    if (['/huchas', '!huchas', 'huchas', '/goals', '!goals', 'goals', '/ahorros', '!ahorros', 'ahorros'].includes(lower)) {
      const goals = getSavingsGoals();
      if (goals.length === 0) {
        const reply = isEn
          ? '🎯 *Savings Pots:* No savings goals created yet. Create one in the CasaFinance Web Dashboard.'
          : '🎯 *Huchas y Metas de Ahorro:* No tenéis ninguna hucha creada aún. Podéis crear una desde la web en el Dashboard.';
        return NextResponse.json({ type: 'goals', reply });
      }

      const lines = goals.map((g) => {
        const bar = buildProgressBar(g.currentAmount, g.targetAmount);
        return `• *${g.name}:* ${g.currentAmount.toFixed(2)} / ${g.targetAmount.toFixed(2)} ${currency}\n  ${bar}`;
      });

      const reply = isEn
        ? `🎯 *Household Savings Goals (${goals.length}):*\n${lines.join('\n')}\n\n💡 _Add savings: \`/goal [name] [amount]\`_`
        : `🎯 *Huchas del Hogar (${goals.length}):*\n${lines.join('\n')}\n\n💡 _Para aportar: \`/hucha [nombre] [cantidad]\`_`;
      return NextResponse.json({ type: 'goals', reply });
    }

    // =========================================================================
    // 6. Categories Command: /categorias
    // =========================================================================
    if (['/categorias', '!categorias', 'categorias', '/categories', '!categories', 'categories'].includes(lower)) {
      const catList = categories.map((c) => `• ${c.name}`).join('\n');
      const reply = isEn
        ? `🏷️ *Active Household Categories (${categories.length}):*\n${catList}`
        : `🏷️ *Categorías Activas del Hogar (${categories.length}):*\n${catList}`;
      return NextResponse.json({ type: 'categories', reply });
    }

    // =========================================================================
    // 7. Command: /ayuda, /help, /start
    // =========================================================================
    if (['!ayuda', '/ayuda', 'ayuda', '!help', '/help', 'help', '/start'].includes(lower)) {
      const reply = isEn
        ? [
            '🏠 *CasaFinance Companion Bot*',
            '',
            '📝 *Record Expenses:*',
            '• `42.50 Groceries` or `Dinner 60`',
            '• `18.50 Pharmacy advance` (paid by Sam)',
            '• `Dinner 60 50/50` (force equal split)',
            '• `Hotel 120 #trip` (custom tags)',
            '',
            '⚡ *Quick Controls:*',
            '• `/deshacer` - Undo last recorded expense',
            '• `/balance` - Check out-of-pocket debts',
            '• `/saldar` - Settle and clear pending debts',
            '• `/summary` - Monthly totals and remaining budget',
            '• `/expenses` - List last 5 expenses',
            '• `/goals` - View savings pots progress',
            '• `/goal trip 50` - Add 50 € to a savings pot',
            '• `/categories` - List available categories',
            '',
            '💡 *Interactive Shortcuts:*',
            '• In WhatsApp: React with 🗑️ or reply "delete" to cancel',
            '• In Telegram: Use inline action buttons',
          ].join('\n')
        : [
            '🏠 *Asistente CasaFinance*',
            '',
            '📝 *Registrar Gastos:*',
            '• `42.50 Mercadona` o `Cena 60`',
            '• `18.50 Farmacia adelanto` (o `pagó Carlos`)',
            '• `Cena 60 50/50` (reparto a partes iguales)',
            '• `Hotel 120 #viaje` (etiquetas especiales)',
            '',
            '⚡ *Comandos Rápidos:*',
            '• `/deshacer` - Anula el último gasto guardado',
            '• `/balance` - Consulta deudas de bolsillo',
            '• `/saldar` - Marca las deudas como saldadas',
            '• `/resumen` - Totales y presupuesto del mes',
            '• `/gastos` - Últimos 5 gastos registrados',
            '• `/huchas` - Progreso de metas de ahorro',
            '• `/hucha viaje 50` - Aportar 50 € a una hucha',
            '• `/categorias` - Lista de categorías del hogar',
            '',
            '💡 *Atajos Interactivos:*',
            '• En WhatsApp: Reacciona con 🗑️ o responde "borrar"',
            '• En Telegram: Usa los botones interactivos',
          ].join('\n');
      return NextResponse.json({ type: 'help', reply });
    }

    // =========================================================================
    // 8. Command: /balance, /liquidacion
    // =========================================================================
    if (['!balance', '/balance', 'balance', '!liquidacion', '/liquidacion', 'liquidacion'].includes(lower)) {
      const allExpenses = getExpenses(currentMonth);
      const fixedBudget = getFixedBudgetItems();
      const effectiveIncomes = getMonthlyIncome(currentMonth);
      const summary = buildMonthlySummary(currentMonth, settings, categories, fixedBudget, allExpenses, effectiveIncomes);
      const settlement = summary.settlement;

      let reply = '';
      const buttons: Array<{ text: string; callback_data: string }> = [];

      if (settlement.amountToPay > 0.01) {
        reply = isEn
          ? `⚖️ *Balance for ${currentMonth}:*\n👉 *${settlement.debtor}* must transfer *${settlement.amountToPay.toFixed(2)} ${currency}* to *${settlement.creditor}* to settle out-of-pocket advances.\n\n💡 _Type \`/settle\` once transferred to clear the balance._`
          : `⚖️ *Balance de ${currentMonth}:*\n👉 *${settlement.debtor}* debe transferir *${settlement.amountToPay.toFixed(2)} ${currency}* a *${settlement.creditor}* para saldar los adelantos particulares.\n\n💡 _Escribe \`/saldar\` una vez transferido para dejarlo a cero._`;
        buttons.push({
          text: isEn ? '💸 Mark as Settled' : '💸 Marcar como Saldado',
          callback_data: 'settle',
        });
      } else {
        reply = isEn
          ? `✅ *Balance for ${currentMonth}:*\nAll accounts are completely up to date! No pending debts for this month.`
          : `✅ *Balance de ${currentMonth}:*\n¡Cuentas completamente al día! No hay deudas pendientes por adelantos este mes.`;
      }
      return NextResponse.json({ type: 'balance', reply, buttons });
    }

    // =========================================================================
    // 9. Command: /resumen, /summary
    // =========================================================================
    if (['!resumen', '/resumen', 'resumen', '!summary', '/summary', 'summary'].includes(lower)) {
      const allExpenses = getExpenses(currentMonth);
      const fixedBudget = getFixedBudgetItems();
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

    // =========================================================================
    // 10. Command: /gastos, /expenses
    // =========================================================================
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
      const reply = `${header}\n${lines.join('\n')}\n\n💡 _Undo last with \`/deshacer\`_`;
      return NextResponse.json({ type: 'expenses', reply });
    }

    // =========================================================================
    // 11. Parse natural language expense
    // =========================================================================
    const parsed = parseExpenseMessage(trimmed, categories, settings, sender);
    if (!parsed) {
      const isExplicitExpenseAttempt = /^(\/gasto|!gasto|\+|gasto:|\/expense|!expense|expense:)/i.test(trimmed);
      if (isExplicitExpenseAttempt) {
        return NextResponse.json({
          type: 'unknown',
          reply: isEn
            ? '❓ Unrecognized format. Try: `42.50 Groceries` or `/expense 42.50 Groceries`.'
            : '❓ Formato no reconocido. Envía por ejemplo: `42.50 Mercadona` o `/gasto 42.50 Mercadona`.',
        });
      }
      // Silently ignore regular conversation
      return NextResponse.json({ type: 'ignored' });
    }

    // Save expense in database
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
    if (parsed.paidBy === 'partner1') payerLabel = isEn ? `⚡ Advance by ${p1Name}` : `⚡ Adelanto de ${p1Name}`;
    if (parsed.paidBy === 'partner2') payerLabel = isEn ? `⚡ Advance by ${p2Name}` : `⚡ Adelanto de ${p2Name}`;

    let splitLabel = '';
    if (parsed.splitModeOverride === 'equal') {
      splitLabel = isEn ? ' • 50/50' : ' • 50/50';
    }

    // Check budget alert for this category
    let budgetAlert = '';
    try {
      const fixedBudget = getFixedBudgetItems();
      const catBudget = fixedBudget
        .filter((b) => b.isActive && b.categoryId === parsed.categoryId)
        .reduce((sum, b) => sum + b.amount, 0);

      if (catBudget > 0) {
        const monthExpenses = getExpenses(currentMonth);
        const catSpent = monthExpenses
          .filter((e) => !e.isSettlement && e.categoryId === parsed.categoryId)
          .reduce((sum, e) => sum + e.amount, 0);

        const pct = Math.round((catSpent / catBudget) * 100);
        if (pct >= 100) {
          budgetAlert = isEn
            ? `\n🚨 *Budget exceeded for ${catName}:* ${catSpent.toFixed(2)} / ${catBudget.toFixed(2)} ${currency} (${pct}%)`
            : `\n🚨 *¡Presupuesto superado en ${catName}!* ${catSpent.toFixed(2)} / ${catBudget.toFixed(2)} ${currency} (${pct}%)`;
        } else if (pct >= 80) {
          budgetAlert = isEn
            ? `\n⚠️ *Budget notice:* Reached ${pct}% of ${catName} (${catSpent.toFixed(2)} / ${catBudget.toFixed(2)} ${currency})`
            : `\n⚠️ *Aviso de presupuesto:* Habéis alcanzado el ${pct}% de ${catName} (${catSpent.toFixed(2)} / ${catBudget.toFixed(2)} ${currency})`;
        }
      }
    } catch {
      // Ignore budget threshold calculation error
    }

    const reply = isEn
      ? `✅ *Expense recorded:* ${saved.title}\n💰 *${saved.amount.toFixed(2)} ${currency}*\n🏷️ ${catName} • ${payerLabel}${splitLabel}${budgetAlert}\n\n💡 _React with 🗑️ or reply "delete" to undo_`
      : `✅ *Gasto guardado:* ${saved.title}\n💰 *${saved.amount.toFixed(2)} ${currency}*\n🏷️ ${catName} • ${payerLabel}${splitLabel}${budgetAlert}\n\n💡 _Reacciona con 🗑️ o responde "borrar" para anular_`;

    const buttons = [
      { text: '🗑️ Borrar', callback_data: `delete:${saved.id}` },
      { text: '⚖️ 50/50', callback_data: `split_equal:${saved.id}` },
    ];

    return NextResponse.json({
      type: 'expense_created',
      expense: saved,
      reply,
      buttons,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


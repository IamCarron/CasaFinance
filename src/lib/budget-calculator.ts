import { UserSettings, FixedBudgetItem, Expense, SettlementDetail, Category, CategoryBreakdown, MonthlySummary, MonthlyIncomeOverride } from './types';

/**
 * Calculates the split ratio between partner 1 and partner 2
 * returns [ratio1, ratio2] where ratio1 + ratio2 = 1.0
 */
export function calculateSplitRatios(settings: UserSettings): [number, number] {
  if (settings.splitMode === 'equal') {
    return [0.5, 0.5];
  }

  if (settings.splitMode === 'custom') {
    const raw = settings.customRatioPartner1;
    if (raw == null || isNaN(raw)) return [0.5, 0.5];
    const r1 = Math.max(0, Math.min(100, raw)) / 100;
    return [r1, 1 - r1];
  }

  if (settings.splitMode === 'proportional') {
    const inc1 = Math.max(0, settings.partner1Income || 0);
    const inc2 = Math.max(0, settings.partner2Income || 0);
    const total = inc1 + inc2;

    if (total <= 0) {
      return [0.5, 0.5];
    }

    const r1 = Math.round((inc1 / total) * 1000) / 1000;
    return [r1, Math.round((1 - r1) * 1000) / 1000];
  }

  return [0.5, 0.5];
}

const toCents = (amount: number) => Math.round(amount * 100);
const toDecimal = (cents: number) => cents / 100;

/**
 * Calculates fixed monthly contributions to the joint account
 */
export function calculateFixedContributions(
  budgetItems: FixedBudgetItem[],
  settings: UserSettings
): {
  totalBudget: number;
  partner1Total: number;
  partner2Total: number;
  itemBreakdown: Array<{
    item: FixedBudgetItem;
    p1Amount: number;
    p2Amount: number;
  }>;
} {
  const [defaultR1, defaultR2] = calculateSplitRatios(settings);
  let totalBudgetCents = 0;
  let partner1TotalCents = 0;
  let partner2TotalCents = 0;

  const itemBreakdown = budgetItems
    .filter((item) => item.isActive)
    .map((item) => {
      let r1 = defaultR1;
      let r2 = defaultR2;

      if (item.splitModeOverride === 'equal') {
        r1 = 0.5;
        r2 = 0.5;
      }

      const amountCents = toCents(item.amount);
      const p1AmountCents = Math.round(amountCents * r1);
      const p2AmountCents = Math.round(amountCents * r2);

      totalBudgetCents += amountCents;
      partner1TotalCents += p1AmountCents;
      partner2TotalCents += p2AmountCents;

      return {
        item,
        p1Amount: toDecimal(p1AmountCents),
        p2Amount: toDecimal(p2AmountCents),
      };
    });

  return {
    totalBudget: toDecimal(totalBudgetCents),
    partner1Total: toDecimal(partner1TotalCents),
    partner2Total: toDecimal(partner2TotalCents),
    itemBreakdown,
  };
}

/**
 * Calculates out-of-pocket settlements between partners
 * Logic:
 * - When someone pays from the common account -> no debt between partners
 * - When Partner 1 pays for "both" -> Partner 2 owes Partner 1 their share (default split or 50/50 override)
 * - When Partner 2 pays for "both" -> Partner 1 owes Partner 2 their share
 * - When Partner 1 pays exclusively for Partner 2 -> Partner 2 owes Partner 1 100%
 * - When Partner 2 pays exclusively for Partner 1 -> Partner 1 owes Partner 2 100%
 */
export function calculateSettlement(
  expenses: Expense[],
  settings: UserSettings
): SettlementDetail {
  const [defaultR1, defaultR2] = calculateSplitRatios(settings);

  let partner1PaidForBothCents = 0;
  let partner2PaidForBothCents = 0;
  let partner1PaidForPartner2Cents = 0;
  let partner2PaidForPartner1Cents = 0;

  let p1DebtToP2Cents = 0; // Partner 1 owes Partner 2
  let p2DebtToP1Cents = 0; // Partner 2 owes Partner 1

  for (const exp of expenses) {
    if (exp.paidBy === 'common') {
      // Paid from common account: no inter-partner debt
      continue;
    }

    let expR1 = defaultR1;
    let expR2 = defaultR2;

    if (exp.splitModeOverride === 'equal') {
      expR1 = 0.5;
      expR2 = 0.5;
    }

    const amountCents = toCents(exp.amount);

    if (exp.paidBy === 'partner1') {
      if (exp.splitBetween === 'both') {
        partner1PaidForBothCents += amountCents;
        p2DebtToP1Cents += Math.round(amountCents * expR2);
      } else if (exp.splitBetween === 'partner2') {
        partner1PaidForPartner2Cents += amountCents;
        p2DebtToP1Cents += amountCents; // 100% debt
      }
    } else if (exp.paidBy === 'partner2') {
      if (exp.splitBetween === 'both') {
        partner2PaidForBothCents += amountCents;
        p1DebtToP2Cents += Math.round(amountCents * expR1);
      } else if (exp.splitBetween === 'partner1') {
        partner2PaidForPartner1Cents += amountCents;
        p1DebtToP2Cents += amountCents; // 100% debt
      }
    }
  }

  const netBalanceCents = p2DebtToP1Cents - p1DebtToP2Cents;
  const netBalance = toDecimal(netBalanceCents);

  let debtor: string | null = null;
  let creditor: string | null = null;
  let amountToPay = 0;

  if (netBalance > 0.01) {
    debtor = settings.partner2Name || 'Pareja';
    creditor = settings.partner1Name || 'Tú';
    amountToPay = netBalance;
  } else if (netBalance < -0.01) {
    debtor = settings.partner1Name || 'Tú';
    creditor = settings.partner2Name || 'Pareja';
    amountToPay = Math.abs(netBalance);
  }

  return {
    partner1PaidForBoth: toDecimal(partner1PaidForBothCents),
    partner2PaidForBoth: toDecimal(partner2PaidForBothCents),
    partner1PaidForPartner2: toDecimal(partner1PaidForPartner2Cents),
    partner2PaidForPartner1: toDecimal(partner2PaidForPartner1Cents),
    netBalance,
    debtor,
    creditor,
    amountToPay,
  };
}

/**
 * Builds the full monthly summary combining budget and actual expenses
 */
export function buildMonthlySummary(
  month: string,
  settings: UserSettings,
  categories: Category[],
  budgetItems: FixedBudgetItem[],
  expenses: Expense[],
  effectiveIncomes?: MonthlyIncomeOverride
): MonthlySummary {
  const effectiveSettings: UserSettings = effectiveIncomes
    ? {
        ...settings,
        partner1Income: effectiveIncomes.partner1Income,
        partner2Income: effectiveIncomes.partner2Income,
      }
    : settings;

  const [r1, r2] = calculateSplitRatios(effectiveSettings);
  const fixed = calculateFixedContributions(budgetItems, effectiveSettings);
  const settlement = calculateSettlement(expenses, effectiveSettings);

  let totalSpentCommonCents = 0;
  let totalSpentOutOfPocketCents = 0;

  const categoryMap = new Map<
    string,
    { budgetedCents: number; spentCommonCents: number; spentOutPocketCents: number }
  >();

  for (const cat of categories) {
    categoryMap.set(cat.id, { budgetedCents: 0, spentCommonCents: 0, spentOutPocketCents: 0 });
  }

  for (const b of budgetItems.filter((i) => i.isActive)) {
    const existing = categoryMap.get(b.categoryId) || {
      budgetedCents: 0,
      spentCommonCents: 0,
      spentOutPocketCents: 0,
    };
    existing.budgetedCents += toCents(b.amount);
    categoryMap.set(b.categoryId, existing);
  }

  for (const exp of expenses) {
    // Internal debt settlement transfers do not constitute external household expenses
    if (exp.isSettlement) {
      continue;
    }

    const amountCents = toCents(exp.amount);
    if (exp.paidBy === 'common') {
      totalSpentCommonCents += amountCents;
    } else {
      totalSpentOutOfPocketCents += amountCents;
    }

    const existing = categoryMap.get(exp.categoryId) || {
      budgetedCents: 0,
      spentCommonCents: 0,
      spentOutPocketCents: 0,
    };
    if (exp.paidBy === 'common') {
      existing.spentCommonCents += amountCents;
    } else {
      existing.spentOutPocketCents += amountCents;
    }
    categoryMap.set(exp.categoryId, existing);
  }

  const categoryBreakdowns: CategoryBreakdown[] = categories
    .map((category) => {
      const data = categoryMap.get(category.id) || {
        budgetedCents: 0,
        spentCommonCents: 0,
        spentOutPocketCents: 0,
      };
      const totalSpentCents = data.spentCommonCents + data.spentOutPocketCents;
      const remainingCents = data.budgetedCents - totalSpentCents;
      const percentageUsed =
        data.budgetedCents > 0
          ? Math.min(200, Math.round((totalSpentCents / data.budgetedCents) * 100))
          : totalSpentCents > 0
          ? 100
          : 0;

      return {
        category,
        budgeted: toDecimal(data.budgetedCents),
        spentFromCommon: toDecimal(data.spentCommonCents),
        spentOutPocket: toDecimal(data.spentOutPocketCents),
        totalSpent: toDecimal(totalSpentCents),
        remaining: toDecimal(remainingCents),
        percentageUsed,
      };
    })
    .filter((c) => c.budgeted > 0 || c.totalSpent > 0);

  const totalSpentMonthCents = totalSpentCommonCents + totalSpentOutOfPocketCents;
  const commonRemainingCents = toCents(fixed.totalBudget) - totalSpentCommonCents;

  return {
    month,
    totalFixedBudget: fixed.totalBudget,
    partner1FixedContribution: fixed.partner1Total,
    partner2FixedContribution: fixed.partner2Total,
    partner1Ratio: Math.round(r1 * 100),
    partner2Ratio: Math.round(r2 * 100),
    totalSpentCommon: toDecimal(totalSpentCommonCents),
    totalSpentOutOfPocket: toDecimal(totalSpentOutOfPocketCents),
    totalSpentMonth: toDecimal(totalSpentMonthCents),
    commonRemaining: toDecimal(commonRemainingCents),
    settlement,
    categoryBreakdowns,
    recentExpenses: expenses.slice(0, 10),
    settings,
    effectiveIncomes: effectiveIncomes || {
      month,
      partner1Income: effectiveSettings.partner1Income,
      partner2Income: effectiveSettings.partner2Income,
      isCustom: false,
    },
  };
}

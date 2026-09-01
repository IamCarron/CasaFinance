'use client';

import React, { useState } from 'react';
import { useHousehold } from '@/context/HouseholdContext';
import MonthPicker from '@/components/MonthPicker';
import { CategoryIcon } from '@/components/Icons';
import { Scale, Sparkles, CheckCircle2, ArrowRight, Coins } from 'lucide-react';

export default function BalanceView() {
  const {
    settings,
    summary,
    expenses,
    categories,
    monthlyIncome,
    currentMonth,
    setCurrentMonth,
    settleDebt,
    setIsIncomeModalOpen,
    t,
  } = useHousehold();

  const [isSettling, setIsSettling] = useState(false);
  const [settledSuccess, setSettledSuccess] = useState(false);

  const settlement = summary?.settlement;
  const currency = settings?.currencySymbol || '€';
  const p1Name = settings?.partner1Name || 'Tú';
  const p2Name = settings?.partner2Name || 'Pareja';
  const isCustomIncome = Boolean(monthlyIncome?.isCustom);

  // Only out-of-pocket expenses
  const outOfPocketExpenses = expenses.filter((e) => e.paidBy !== 'common');
  const p1TotalPaid = expenses.filter((e) => e.paidBy === 'partner1').reduce((a, b) => a + b.amount, 0);
  const p2TotalPaid = expenses.filter((e) => e.paidBy === 'partner2').reduce((a, b) => a + b.amount, 0);

  const handleSettle = async () => {
    if (!settlement || settlement.amountToPay <= 0.01) return;
    if (
      !confirm(
        `${t('confirmSettlePayment')} ${settlement.amountToPay.toLocaleString('es-ES', { minimumFractionDigits: 2 })} ${currency} ${settlement.debtor} -> ${settlement.creditor}?`
      )
    )
      return;

    setIsSettling(true);
    const debtorKey = settlement.debtor === p1Name ? 'partner1' : 'partner2';
    const creditorKey = settlement.creditor === p1Name ? 'partner1' : 'partner2';

    const ok = await settleDebt(settlement.amountToPay, debtorKey, creditorKey);
    setIsSettling(false);
    if (ok) {
      setSettledSuccess(true);
      setTimeout(() => setSettledSuccess(false), 3500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {t('balanceTitle')}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('balanceSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {settings?.splitMode === 'proportional' && (
            <button
              type="button"
              onClick={() => setIsIncomeModalOpen(true)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all shadow-2xs active:scale-95 ${
                isCustomIncome
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{isCustomIncome ? '⚡ Bonus Activo' : 'Ajustar Sueldos'}</span>
            </button>
          )}
          <MonthPicker currentMonth={currentMonth} onChange={setCurrentMonth} />
        </div>
      </div>

      {settledSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('settlementRecordedSuccess')}</span>
        </div>
      )}

      {/* Main Statement Box */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 transition-all space-y-5 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              {t('settlementStatus')}
            </span>
            <h2 className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {settlement && settlement.amountToPay > 0.01 ? (
                <span>
                  <strong>{settlement.debtor}</strong> {t('mustTransferTo')} <strong>{settlement.creditor}</strong>
                </span>
              ) : (
                t('allAccountsSettled')
              )}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              {settlement && settlement.amountToPay > 0.01
                ? t('settlementRecommendation')
                : t('noPendingDebts')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-0">
            <div className="text-left sm:text-right bg-zinc-50 dark:bg-zinc-800/40 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block">
                {t('amountToPay')}
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-zinc-900 dark:text-zinc-100">
                {(settlement?.amountToPay || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}{' '}
                {currency}
              </div>
            </div>

            {settlement && settlement.amountToPay > 0.01 && (
              <button
                onClick={handleSettle}
                disabled={isSettling}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-xs disabled:opacity-50 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSettling ? '...' : t('markAsSettled')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Debt Breakdown Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">{p1Name} ({t('personalPocket')})</span>
            <div className="text-xl font-mono font-black text-zinc-900 dark:text-zinc-100">
              {p1TotalPaid.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
            </div>
            <div className="text-[11px] text-zinc-400">
              {t('totalPersonalAdvances')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">{p2Name} ({t('personalPocket')})</span>
            <div className="text-xl font-mono font-black text-zinc-900 dark:text-zinc-100">
              {p2TotalPaid.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
            </div>
            <div className="text-[11px] text-zinc-400">
              {t('totalPersonalAdvances')}
            </div>
          </div>
        </div>
      </div>

      {/* Out of Pocket Transactions Audit */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {t('debtGeneratingMovements')} ({outOfPocketExpenses.length})
            </h3>
            <p className="text-xs text-zinc-500">
              {t('notChargedToCommon')}
            </p>
          </div>
        </div>

        {outOfPocketExpenses.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            {t('noPersonalExpenses')}
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {outOfPocketExpenses.map((exp) => {
              const cat = categories.find((c) => c.id === exp.categoryId);
              const payerName = exp.paidBy === 'partner1' ? p1Name : p2Name;

              return (
                <div key={exp.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 text-xs shadow-2xs"
                      style={{ backgroundColor: cat?.color || '#52525b' }}
                    >
                      <CategoryIcon name={cat?.icon || 'Receipt'} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {exp.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                        <span className="text-amber-600 dark:text-amber-400 font-medium">{t('paidByLabel')} {payerName}</span>
                        <span>•</span>
                        <span>{exp.date}</span>
                        {exp.splitModeOverride === 'equal' && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[9px] text-zinc-500">50/50</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 shrink-0">
                    {exp.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

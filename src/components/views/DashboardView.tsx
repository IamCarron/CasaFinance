'use client';

import React from 'react';
import { useHousehold } from '@/context/HouseholdContext';
import MonthPicker from '@/components/MonthPicker';
import { CategoryIcon } from '@/components/Icons';
import { Plus, ArrowRight, Check, AlertCircle, Scale, Receipt, Sparkles, TrendingUp, PiggyBank, BarChart3, Edit3, Coins, ArrowRightLeft } from 'lucide-react';

export default function DashboardView() {
  const {
    settings,
    summary,
    expenses,
    categories,
    savingsGoals,
    monthlyTrends,
    monthlyIncome,
    currentMonth,
    setCurrentMonth,
    setActiveTab,
    setIsExpenseModalOpen,
    setEditingExpense,
    setIsGoalModalOpen,
    setEditingGoal,
    setIsIncomeModalOpen,
    language,
    t,
  } = useHousehold();

  const currency = settings?.currencySymbol || '€';
  const p1Name = settings?.partner1Name || 'Tú';
  const p2Name = settings?.partner2Name || 'Pareja';

  const p1Income = monthlyIncome ? monthlyIncome.partner1Income : (settings?.partner1Income || 0);
  const p2Income = monthlyIncome ? monthlyIncome.partner2Income : (settings?.partner2Income || 0);
  const isCustomIncome = Boolean(monthlyIncome?.isCustom);
  const totalIncome = p1Income + p2Income;
  const p1Ratio = totalIncome > 0 ? (p1Income / totalIncome) * 100 : 50;
  const p2Ratio = totalIncome > 0 ? (p2Income / totalIncome) * 100 : 50;

  const settlement = summary?.settlement;
  const totalSpent = summary?.totalSpentMonth || 0;
  const totalBudget = summary?.totalFixedBudget || 0;
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const budgetProgress = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  const maxTrendSpent = Math.max(
    ...monthlyTrends.map((t) => Math.max(t.totalSpent, t.totalBudgeted)),
    totalBudget,
    100
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Bar: Title & Month */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <span>{t('householdFinance')}</span>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {settings?.splitMode === 'equal' ? t('equal') : t('proportional')}
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('overviewSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <MonthPicker currentMonth={currentMonth} onChange={setCurrentMonth} />
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addExpense')}</span>
          </button>
        </div>
      </div>

      {/* Hero Section: Interactive Financial Scale ("La Balanza de la Casa") */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t('houseBalanceTitle')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Button to adjust variable monthly income / bonuses */}
            {settings?.splitMode === 'proportional' && (
              <button
                type="button"
                onClick={() => setIsIncomeModalOpen(true)}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  isCustomIncome
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                    : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>
                  {isCustomIncome
                    ? (language === 'es' ? '⚡ Ingresos Personalizados' : '⚡ Custom Monthly Income')
                    : (settings?.incomeType === 'variable'
                        ? (language === 'es' ? 'Revisar Sueldos del Mes' : 'Review Monthly Salaries')
                        : (language === 'es' ? 'Ajustar Sueldo / Bonus' : 'Adjust Salary / Bonus'))}
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('balance')}
              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
            >
              <span>{t('viewDetailedSettlement')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Variable Income Monthly Reminder Banner */}
        {((settings?.partner1IncomeType === 'variable' || settings?.partner2IncomeType === 'variable' || settings?.incomeType === 'variable') && !isCustomIncome) && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {settings?.partner1IncomeType === 'variable' && settings?.partner2IncomeType === 'variable'
                  ? `${t('variableIncomeBannerBoth')} `
                  : settings?.partner1IncomeType === 'variable'
                  ? `${t('variableIncomeBannerSingle').replace('{name}', p1Name)} `
                  : `${t('variableIncomeBannerSingle').replace('{name}', p2Name)} `}
                <strong>{currentMonth}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsIncomeModalOpen(true)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 self-start sm:self-auto"
            >
              {t('confirmIncomeBtn')}
            </button>
          </div>
        )}

        {/* Visual Equilibrium Bar */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <span>{p1Name}</span>
                <span className="font-mono text-zinc-500">{p1Ratio.toFixed(1)}%</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                <span>{p1Income.toLocaleString('es-ES')} {currency} netos</span>
                {isCustomIncome ? (
                  <span className="text-amber-500 font-bold">• {language === 'es' ? 'ajustado' : 'adjusted'}</span>
                ) : settings?.partner1IncomeType === 'variable' ? (
                  <span className="text-amber-500 font-bold">• {language === 'es' ? 'variable' : 'variable'}</span>
                ) : null}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <span className="font-mono text-zinc-500">{p2Ratio.toFixed(1)}%</span>
                <span>{p2Name}</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center justify-end gap-1">
                {isCustomIncome ? (
                  <span className="text-amber-500 font-bold">{language === 'es' ? 'ajustado' : 'adjusted'} •</span>
                ) : settings?.partner2IncomeType === 'variable' ? (
                  <span className="text-amber-500 font-bold">{language === 'es' ? 'variable' : 'variable'} •</span>
                ) : null}
                <span>{p2Income.toLocaleString('es-ES')} {currency} netos</span>
              </div>
            </div>
          </div>

          {/* Scale Equilibrium Visual Bar */}
          <div className="relative h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-zinc-900 dark:bg-zinc-200 transition-all duration-700"
              style={{ width: `${p1Ratio}%` }}
            />
            <div
              className="h-full bg-zinc-400 dark:bg-zinc-600 transition-all duration-700"
              style={{ width: `${p2Ratio}%` }}
            />
            {/* Center Fulcrum Indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-sm transition-all duration-700"
              style={{ left: `${p1Ratio}%` }}
            />
          </div>

          {/* Debt Summary Pill */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="text-zinc-600 dark:text-zinc-300">
                {settlement && settlement.amountToPay > 0.01 ? (
                  <span>
                    {t('pendingSettlement')} <strong>{settlement.debtor}</strong> {t('mustTransferTo')} <strong>{settlement.creditor}</strong> (<strong>{settlement.amountToPay.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}</strong>)
                  </span>
                ) : (
                  t('accountsUpToDate')
                )}
              </span>
            </div>

            {settlement && settlement.amountToPay > 0.01 && (
              <button
                onClick={() => setActiveTab('balance')}
                className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold transition-all text-xs shrink-0 self-start sm:self-auto"
              >
                {t('settle')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quota Voucher & Budget Consumption Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Quota Voucher */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span className="uppercase tracking-wider font-mono text-[10px]">{t('monthlyQuotaVoucher')}</span>
              <button
                onClick={() => setActiveTab('budget')}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-[11px] underline underline-offset-2"
              >
                {t('adjustBudget')}
              </button>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-2 tracking-tight">
              {totalBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t('quotaExplanation')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">{p1Name} ({p1Ratio.toFixed(0)}%)</span>
              <div className="text-sm sm:text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {(summary?.partner1FixedContribution || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">{p2Name} ({p2Ratio.toFixed(0)}%)</span>
              <div className="text-sm sm:text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {(summary?.partner2FixedContribution || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Consumption */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span className="uppercase tracking-wider font-mono text-[10px]">{t('realMonthlySpending')}</span>
              <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {budgetProgress}% {t('consumed')}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-2 tracking-tight">
              {totalSpent.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t('availableInFund')} <strong className="text-zinc-900 dark:text-zinc-100">{remainingBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  budgetProgress > 95 ? 'bg-rose-500' : budgetProgress > 80 ? 'bg-amber-500' : 'bg-zinc-900 dark:bg-zinc-100'
                }`}
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>0 {currency}</span>
              <span>{t('limit')} {totalBudget.toLocaleString('es-ES')} {currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Historical Trend & Evolution Chart */}
      {monthlyTrends.length > 0 && (
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {t('monthlyTrendsTitle')}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {t('monthlyTrendsSubtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Bespoke Bar Chart */}
          <div className="pt-4 grid grid-cols-6 gap-2 sm:gap-4 items-end h-40">
            {monthlyTrends.map((point) => {
              const heightPercent = maxTrendSpent > 0 ? Math.max(8, Math.min(100, Math.round((point.totalSpent / maxTrendSpent) * 100))) : 8;
              const isSelectedMonth = point.month === currentMonth;

              return (
                <div
                  key={point.month}
                  onClick={() => setCurrentMonth(point.month)}
                  className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                    {point.totalSpent > 0 ? `${Math.round(point.totalSpent)}` : '0'}
                  </span>

                  <div className="w-full max-w-[36px] bg-zinc-100 dark:bg-zinc-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end h-28 relative">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isSelectedMonth
                          ? 'bg-zinc-900 dark:bg-zinc-100 shadow-xs'
                          : 'bg-zinc-300 dark:bg-zinc-700 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className={`text-[10px] font-medium transition-colors ${
                    isSelectedMonth
                      ? 'text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-400 group-hover:text-zinc-600'
                  }`}>
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Savings Goals & Piggy Banks Section */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {t('savingsGoalsTitle')}
              </h3>
              <p className="text-xs text-zinc-500">
                {t('savingsGoalsSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('newSavingsGoal')}</span>
          </button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400 space-y-2">
            <p>{t('noGoalsYet')}</p>
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="text-xs font-bold text-zinc-900 dark:text-zinc-100 underline underline-offset-4"
            >
              + {t('addGoalTitle')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savingsGoals.map((goal) => {
              const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
              const isCompleted = goal.currentAmount >= goal.targetAmount;

              return (
                <div
                  key={goal.id}
                  onClick={() => {
                    setEditingGoal(goal);
                    setIsGoalModalOpen(true);
                  }}
                  className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 text-xs shadow-2xs"
                        style={{ backgroundColor: goal.color }}
                      >
                        <CategoryIcon name={goal.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {goal.name}
                        </div>
                        {goal.targetDate && (
                          <div className="text-[10px] text-zinc-400">
                            Meta: {goal.targetDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                      {progress}%
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-full bg-zinc-200/80 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: isCompleted ? '#10b981' : goal.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {goal.currentAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                      </span>
                      <span className="text-zinc-400">
                        {goal.targetAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chronological Recent Movements Stream */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {t('recentMovements')}
            </h3>
            <p className="text-xs text-zinc-500">
              {expenses.length} {t('expensesRecordedThisMonth')}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('expenses')}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-400 space-y-2">
            <Receipt className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
            <p>{t('noExpensesThisMonth')} {currentMonth}.</p>
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="text-xs font-bold text-zinc-900 dark:text-zinc-100 underline underline-offset-4"
            >
              {t('recordFirstExpense')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {expenses.slice(0, 6).map((exp) => {
              const cat = categories.find((c) => c.id === exp.categoryId);
              const isCommon = exp.paidBy === 'common';
              const payerName = isCommon ? t('commonAccount') : exp.paidBy === 'partner1' ? p1Name : p2Name;

              if (exp.isSettlement) {
                return (
                  <div
                    key={exp.id}
                    onClick={() => {
                      setEditingExpense(exp);
                      setIsExpenseModalOpen(true);
                    }}
                    className="py-3 flex items-center justify-between gap-3 group hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600 text-white shrink-0 text-xs shadow-2xs">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                          <span>{exp.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            {t('settlementBadge')}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">{t('settlementTransfer')}</span>
                          <span>•</span>
                          <span>{payerName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                        {exp.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {exp.date}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={exp.id}
                  onClick={() => {
                    setEditingExpense(exp);
                    setIsExpenseModalOpen(true);
                  }}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-zinc-50 dark:hover:bg-zinc-800/40 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 text-xs"
                      style={{ backgroundColor: cat?.color || '#52525b' }}
                    >
                      <CategoryIcon name={cat?.icon || 'Receipt'} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {exp.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                        <span>{cat?.name || t('general')}</span>
                        <span>•</span>
                        <span className={isCommon ? 'text-zinc-500' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                          {payerName}
                        </span>
                        {exp.splitModeOverride === 'equal' && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-zinc-500">50/50</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      {exp.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {exp.date}
                    </div>
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

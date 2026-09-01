'use client';

import React, { useState, useMemo } from 'react';
import { useHousehold } from '@/context/HouseholdContext';
import MonthPicker from '@/components/MonthPicker';
import { CategoryIcon } from '@/components/Icons';
import { Search, Plus, Trash2, Edit2, CreditCard, User, Tag, Download, ArrowRightLeft } from 'lucide-react';
import { Expense } from '@/lib/types';

export default function ExpensesView() {
  const {
    settings,
    expenses,
    categories,
    currentMonth,
    setCurrentMonth,
    deleteExpense,
    setEditingExpense,
    setIsExpenseModalOpen,
    t,
  } = useHousehold();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayer, setFilterPayer] = useState<'all' | 'common' | 'partner1' | 'partner2'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currency = settings?.currencySymbol || '€';
  const p1Name = settings?.partner1Name || 'Tú';
  const p2Name = settings?.partner2Name || 'Pareja';

  // Filtered in memory
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (filterPayer !== 'all' && exp.paidBy !== filterPayer) return false;
      if (filterCategory !== 'all' && exp.categoryId !== filterCategory) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(term);
        const matchesNotes = exp.notes?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesNotes) return false;
      }
      return true;
    });
  }, [expenses, filterPayer, filterCategory, searchTerm]);

  // Aggregate metrics (excluding internal debt settlements from real household spending)
  const totalFiltered = filteredExpenses
    .filter((e) => !e.isSettlement)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalCommon = filteredExpenses
    .filter((e) => e.paidBy === 'common' && !e.isSettlement)
    .reduce((a, c) => a + c.amount, 0);
  const totalP1 = filteredExpenses
    .filter((e) => e.paidBy === 'partner1' && !e.isSettlement)
    .reduce((a, c) => a + c.amount, 0);
  const totalP2 = filteredExpenses
    .filter((e) => e.paidBy === 'partner2' && !e.isSettlement)
    .reduce((a, c) => a + c.amount, 0);
  const totalSettlements = filteredExpenses
    .filter((e) => e.isSettlement)
    .reduce((a, c) => a + c.amount, 0);

  // Group by date
  const groupedExpenses = useMemo(() => {
    const groups: { [date: string]: Expense[] } = {};
    for (const exp of filteredExpenses) {
      if (!groups[exp.date]) {
        groups[exp.date] = [];
      }
      groups[exp.date].push(exp);
    }
    // sort dates descending
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredExpenses]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t('deleteMovementConfirm'))) return;
    setDeletingId(id);
    await deleteExpense(id);
    setDeletingId(null);
  };

  const handleExportCsv = () => {
    window.location.href = `/api/expenses/export?month=${currentMonth}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {t('expensesLedger')}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('expensesSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <MonthPicker currentMonth={currentMonth} onChange={setCurrentMonth} />
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleExportCsv}
              title={t('exportCsv')}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 text-xs font-semibold transition-all shadow-2xs active:scale-95"
            >
              <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden md:inline ml-1.5">{t('exportCsv')}</span>
            </button>

            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('newExpense')}</span>
              <span className="sm:hidden text-xs">{t('newExpense')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-3.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">{t('totalFiltered')}</span>
          <div className="text-base sm:text-xl font-mono font-black text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
            {totalFiltered.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 truncate">
            {totalSettlements > 0 ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                + {totalSettlements.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency} {t('settlementTotalNote')}
              </span>
            ) : (
              <span>{filteredExpenses.length} {t('movements')}</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-3.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">{t('commonAccount')}</span>
          <div className="text-base sm:text-xl font-mono font-black text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
            {totalCommon.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 truncate">{t('commonCharges')}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-3.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">{p1Name}</span>
          <div className="text-base sm:text-xl font-mono font-black text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
            {totalP1.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 truncate">{t('outOfPocketAdvances')}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-3.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">{p2Name}</span>
          <div className="text-base sm:text-xl font-mono font-black text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
            {totalP2.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 truncate">{t('outOfPocketAdvances')}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={filterPayer}
              onChange={(e) => setFilterPayer(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="all">{t('allPayers')}</option>
              <option value="common">{t('onlyCommon')}</option>
              <option value="partner1">{t('only')} {p1Name}</option>
              <option value="partner2">{t('only')} {p2Name}</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="all">{t('allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Ledger */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-6">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            {t('noExpensesMatch')}
          </div>
        ) : (
          groupedExpenses.map(([dateStr, items]) => (
            <div key={dateStr} className="space-y-2">
              {/* Date Header */}
              <div className="flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800/60 pb-1.5">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">{dateStr}</span>
                <span className="text-zinc-400 font-mono text-[11px]">
                  {items.filter(i => !i.isSettlement).reduce((a, b) => a + b.amount, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>

              {/* Items in this date */}
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800/30">
                {items.map((exp) => {
                  const cat = categories.find((c) => c.id === exp.categoryId);
                  const isCommon = exp.paidBy === 'common';
                  const payerLabel = isCommon ? t('commonAccount') : exp.paidBy === 'partner1' ? p1Name : p2Name;

                  if (exp.isSettlement) {
                    return (
                      <div
                        key={exp.id}
                        onClick={() => {
                          setEditingExpense(exp);
                          setIsExpenseModalOpen(true);
                        }}
                        className="py-2.5 flex items-center justify-between gap-3 group hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600 text-white shrink-0 text-xs shadow-2xs">
                            <ArrowRightLeft className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                              <span>{exp.title}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                                {t('settlementBadge')}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                {t('settlementTransfer')}
                              </span>
                              <span>•</span>
                              <span>{payerLabel}</span>
                              <span>•</span>
                              <span className="italic text-[10px]">{t('settlementNote')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="font-mono font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                              {exp.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingExpense(exp);
                                setIsExpenseModalOpen(true);
                              }}
                              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title={t('edit')}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(exp.id, e)}
                              disabled={deletingId === exp.id}
                              className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title={t('delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
                      className="py-2.5 flex items-center justify-between gap-3 group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 text-xs shadow-2xs"
                          style={{ backgroundColor: cat?.color || '#52525b' }}
                        >
                          <CategoryIcon name={cat?.icon || 'Receipt'} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                            <span>{exp.title}</span>
                            {exp.receiptUrl && (
                              <span
                                title="Tiene comprobante adjunto"
                                className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                              >
                                📄 Ticket
                              </span>
                            )}
                            {exp.splitModeOverride === 'equal' && (
                              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                50/50
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                            <span>{cat?.name || t('general')}</span>
                            <span>•</span>
                            <span className={isCommon ? 'text-zinc-500' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                              {payerLabel}
                            </span>
                            {exp.notes && (
                              <>
                                <span>•</span>
                                <span className="italic truncate max-w-[140px]">{exp.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                            {exp.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingExpense(exp);
                              setIsExpenseModalOpen(true);
                            }}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title={t('edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(exp.id, e)}
                            disabled={deletingId === exp.id}
                            className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

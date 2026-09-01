'use client';

import React, { useState, useEffect } from 'react';
import { useHousehold } from '@/context/HouseholdContext';
import { CategoryIcon } from '@/components/Icons';
import { Plus, CheckCircle2, Save, Trash2, Edit2, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';
import { FixedBudgetItem } from '@/lib/types';

export default function BudgetView() {
  const {
    settings,
    budgetItems,
    categories,
    saveSettings,
    saveBudgetItem,
    deleteBudgetItem,
    toggleBudgetItemActive,
    setEditingBudgetItem,
    setIsBudgetModalOpen,
    t,
  } = useHousehold();

  const [liveSplitMode, setLiveSplitMode] = useState<'proportional' | 'equal'>('proportional');
  const [income1Str, setIncome1Str] = useState<string>('1800');
  const [income2Str, setIncome2Str] = useState<string>('1200');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setLiveSplitMode(settings.splitMode === 'equal' ? 'equal' : 'proportional');
      setIncome1Str(String(settings.partner1Income));
      setIncome2Str(String(settings.partner2Income));
    }
  }, [settings]);

  const currency = settings?.currencySymbol || '€';
  const p1Name = settings?.partner1Name || 'Tú';
  const p2Name = settings?.partner2Name || 'Pareja';

  const income1 = parseFloat(income1Str) || 0;
  const income2 = parseFloat(income2Str) || 0;
  const totalIncome = income1 + income2;

  const p1Ratio = liveSplitMode === 'equal' ? 0.5 : totalIncome > 0 ? income1 / totalIncome : 0.5;
  const p2Ratio = liveSplitMode === 'equal' ? 0.5 : totalIncome > 0 ? income2 / totalIncome : 0.5;

  const p1RatioPct = Math.round(p1Ratio * 100);
  const p2RatioPct = Math.round(p2Ratio * 100);

  // Active items sum
  const activeItems = budgetItems.filter((i) => i.isActive);
  const totalBudget = activeItems.reduce((acc, curr) => acc + curr.amount, 0);

  let p1Total = 0;
  let p2Total = 0;

  activeItems.forEach((item) => {
    const isOverrideEqual = item.splitModeOverride === 'equal';
    const itemP1Ratio = isOverrideEqual ? 0.5 : p1Ratio;
    const itemP2Ratio = isOverrideEqual ? 0.5 : p2Ratio;
    p1Total += item.amount * itemP1Ratio;
    p2Total += item.amount * itemP2Ratio;
  });

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSavingSettings(true);
    const ok = await saveSettings({
      ...settings,
      splitMode: liveSplitMode,
      partner1Income: income1,
      partner2Income: income2,
    });
    setIsSavingSettings(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleToggle = async (item: FixedBudgetItem) => {
    setProcessingId(item.id);
    await toggleBudgetItemActive(item);
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteItemConfirm'))) return;
    setProcessingId(id);
    await deleteBudgetItem(id);
    setProcessingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {t('fixedBudgetTitle')}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('fixedBudgetSubtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBudgetItem(null);
            setIsBudgetModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 self-stretch sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span>{t('addBudgetItem')}</span>
        </button>
      </div>

      {/* Split Rule & Salary Calculator */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              {t('householdSplitRule')}
            </h2>
            <p className="text-xs text-zinc-500">
              {t('chooseHowToSplit')}
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 w-full sm:w-auto ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('saved')}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingSettings ? t('saving') : t('saveDefault')}</span>
              </>
            )}
          </button>
        </div>

        {/* Mode Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLiveSplitMode('proportional')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              liveSplitMode === 'proportional'
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 shadow-2xs'
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                {t('proportionalToIncome')}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold">
                {t('recommended')}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {t('proportionalDesc')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setLiveSplitMode('equal')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              liveSplitMode === 'equal'
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 shadow-2xs'
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                {t('equalSplit5050')}
              </span>
              <span className="font-mono text-[10px] text-zinc-400">{t('equitable')}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {t('equalSplitDesc')}
            </p>
          </button>
        </div>

        {/* Salary Inputs (when proportional) */}
        {liveSplitMode === 'proportional' && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('netIncomeOf')} {p1Name} ({p1RatioPct}%)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={income1Str}
                onChange={(e) => setIncome1Str(e.target.value)}
                placeholder="1800"
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('netIncomeOf')} {p2Name} ({p2RatioPct}%)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={income2Str}
                onChange={(e) => setIncome2Str(e.target.value)}
                placeholder="1200"
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Live Quota Summary Banner */}
      <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-5 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">{t('totalFixedBudget')}</span>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {totalBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">
            {activeItems.length} {t('activeFixedItems')}
          </div>
        </div>

        <div className="flex items-center gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
          <div>
            <span className="text-xs text-zinc-400 block truncate">{p1Name} ({p1RatioPct}%)</span>
            <span className="text-lg sm:text-xl font-mono font-bold text-white">
              {p1Total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
            </span>
          </div>
          <div className="h-7 w-px bg-zinc-800" />
          <div>
            <span className="text-xs text-zinc-400 block truncate">{p2Name} ({p2RatioPct}%)</span>
            <span className="text-lg sm:text-xl font-mono font-bold text-white">
              {p2Total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Budget Items List */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {t('householdItems')} ({budgetItems.length})
            </h3>
            <p className="text-xs text-zinc-500">
              {t('recurringExpensesSubtitle')}
            </p>
          </div>
        </div>

        {budgetItems.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-400">
            {t('noItemsConfigured')}
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {budgetItems.map((item) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              const isOverrideEqual = item.splitModeOverride === 'equal';
              const itemP1Ratio = isOverrideEqual ? 0.5 : p1Ratio;
              const itemP2Ratio = isOverrideEqual ? 0.5 : p2Ratio;
              const p1Amt = item.amount * itemP1Ratio;
              const p2Amt = item.amount * itemP2Ratio;

              return (
                <div
                  key={item.id}
                  className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-opacity ${
                    !item.isActive ? 'opacity-40' : ''
                  }`}
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
                        <span>{item.name}</span>
                        {item.splitModeOverride === 'equal' && (
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            {t('forced5050Badge')}
                          </span>
                        )}
                        {!item.isActive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-600">
                            {t('deactivated')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                        <span>{cat?.name || t('general')}</span>
                        {item.notes && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-[150px]">{item.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        {item.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-400 flex gap-1.5">
                        <span>{p1Name}: {p1Amt.toLocaleString('es-ES', { minimumFractionDigits: 2 })}{currency}</span>
                        <span>|</span>
                        <span>{p2Name}: {p2Amt.toLocaleString('es-ES', { minimumFractionDigits: 2 })}{currency}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(item)}
                        disabled={processingId === item.id}
                        className={`text-[11px] px-2 py-1 rounded-md font-semibold border transition-colors ${
                          item.isActive
                            ? 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        }`}
                      >
                        {item.isActive ? t('pause') : t('activate')}
                      </button>
                      <button
                        onClick={() => {
                          setEditingBudgetItem(item);
                          setIsBudgetModalOpen(true);
                        }}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title={t('edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={processingId === item.id}
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
        )}
      </div>
    </div>
  );
}

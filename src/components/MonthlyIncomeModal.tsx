'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Scale, RotateCcw, Sparkles } from 'lucide-react';
import { UserSettings, MonthlyIncomeOverride } from '@/lib/types';
import { useHousehold } from '@/context/HouseholdContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
  settings: UserSettings;
  monthlyIncome: MonthlyIncomeOverride | null;
}

export default function MonthlyIncomeModal({
  isOpen,
  onClose,
  currentMonth,
  settings,
  monthlyIncome,
}: Props) {
  const { saveMonthlyIncomeOverride, resetMonthlyIncomeOverride, saveSettings, t, language } = useHousehold();

  const [partner1Income, setPartner1Income] = useState('');
  const [partner2Income, setPartner2Income] = useState('');
  const [notes, setNotes] = useState('');
  const [applyMode, setApplyMode] = useState<'this_month' | 'permanent'>('this_month');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const p1Base = settings.partner1Income || 0;
  const p2Base = settings.partner2Income || 0;
  const currency = settings.currencySymbol || '€';
  const p1Name = settings.partner1Name || 'Integrante 1';
  const p2Name = settings.partner2Name || 'Integrante 2';

  useEffect(() => {
    if (monthlyIncome) {
      setPartner1Income(String(monthlyIncome.partner1Income));
      setPartner2Income(String(monthlyIncome.partner2Income));
      setNotes(monthlyIncome.notes || '');
      setApplyMode('this_month');
    } else {
      setPartner1Income(String(p1Base));
      setPartner2Income(String(p2Base));
      setNotes('');
      setApplyMode('this_month');
    }
    setError('');
  }, [monthlyIncome, p1Base, p2Base, isOpen]);

  if (!isOpen) return null;

  const p1Val = parseFloat(partner1Income.replace(',', '.')) || 0;
  const p2Val = parseFloat(partner2Income.replace(',', '.')) || 0;
  const totalVal = p1Val + p2Val;
  const p1Ratio = totalVal > 0 ? Math.round((p1Val / totalVal) * 100) : 50;
  const p2Ratio = totalVal > 0 ? 100 - p1Ratio : 50;

  // Base split ratio
  const totalBase = p1Base + p2Base;
  const p1BaseRatio = totalBase > 0 ? Math.round((p1Base / totalBase) * 100) : 50;
  const p2BaseRatio = totalBase > 0 ? 100 - p1BaseRatio : 50;

  const handleAddBonus = (partner: 1 | 2, amount: number) => {
    if (partner === 1) {
      const current = parseFloat(partner1Income.replace(',', '.')) || p1Base;
      setPartner1Income(String(current + amount));
    } else {
      const current = parseFloat(partner2Income.replace(',', '.')) || p2Base;
      setPartner2Income(String(current + amount));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (p1Val <= 0 && p2Val <= 0) {
      setError(language === 'es' ? 'Por favor indica un importe de ingresos válido.' : 'Please enter a valid income amount.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    if (applyMode === 'permanent') {
      const ok = await saveSettings({
        ...settings,
        partner1Income: p1Val,
        partner2Income: p2Val,
      });
      if (monthlyIncome?.isCustom) {
        await resetMonthlyIncomeOverride();
      }
      setIsSubmitting(false);
      if (ok) {
        onClose();
      } else {
        setError(language === 'es' ? 'Error al guardar los sueldos habituales.' : 'Error saving standard salaries.');
      }
    } else {
      const ok = await saveMonthlyIncomeOverride(p1Val, p2Val, notes.trim() || undefined);
      setIsSubmitting(false);
      if (ok) {
        onClose();
      } else {
        setError(language === 'es' ? 'Error al guardar el ajuste de ingresos.' : 'Error saving monthly income override.');
      }
    }
  };

  const handleReset = async () => {
    if (!confirm('¿Restablecer los ingresos de este mes al sueldo base habitual?')) return;
    setIsSubmitting(true);
    await resetMonthlyIncomeOverride();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-backdrop-fade">
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                {t('adjustMonthIncome')} ({currentMonth})
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 shrink-0"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 text-xs text-zinc-500 space-y-1">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('adjustMonthIncomeSubtitle')}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {language === 'es'
                ? 'Este ajuste se aplica únicamente a este mes. Los meses anteriores y futuros conservarán su sueldo base habitual.'
                : 'This adjustment applies only to this month. Previous and future months keep their standard base salary.'}
            </p>
          </div>

          {/* Partner 1 Income */}
          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <div className="flex items-center gap-1.5">
                <span>{p1Name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  settings.partner1IncomeType === 'variable'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                }`}>
                  {settings.partner1IncomeType === 'variable' ? `🔄 ${t('variableTag')}` : `📌 ${t('fixedTag')}`}
                </span>
              </div>
              <span className="text-[11px] font-normal text-zinc-400">
                {language === 'es' ? 'Base habitual:' : 'Contractual base:'} {p1Base.toLocaleString(language === 'es' ? 'es-ES' : 'en-US')} {currency}
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">
                {t('salaryThisMonth')} ({currency})
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={partner1Income}
                onChange={(e) => setPartner1Income(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            {/* Quick Bonus Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-zinc-400 font-semibold">Bonus:</span>
              {[200, 500, 1000].map((bonus) => (
                <button
                  key={bonus}
                  type="button"
                  onClick={() => handleAddBonus(1, bonus)}
                  className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  +{bonus}{currency}
                </button>
              ))}
            </div>
          </div>

          {/* Partner 2 Income */}
          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <div className="flex items-center gap-1.5">
                <span>{p2Name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  settings.partner2IncomeType === 'variable'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                }`}>
                  {settings.partner2IncomeType === 'variable' ? `🔄 ${t('variableTag')}` : `📌 ${t('fixedTag')}`}
                </span>
              </div>
              <span className="text-[11px] font-normal text-zinc-400">
                {language === 'es' ? 'Base habitual:' : 'Contractual base:'} {p2Base.toLocaleString(language === 'es' ? 'es-ES' : 'en-US')} {currency}
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">
                {t('salaryThisMonth')} ({currency})
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={partner2Income}
                onChange={(e) => setPartner2Income(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            {/* Quick Bonus Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-zinc-400 font-semibold">Bonus:</span>
              {[200, 500, 1000].map((bonus) => (
                <button
                  key={bonus}
                  type="button"
                  onClick={() => handleAddBonus(2, bonus)}
                  className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  +{bonus}{currency}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Comparison */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">{language === 'es' ? 'Reparto habitual base:' : 'Standard base split:'}</span>
              <span className="font-mono font-bold text-zinc-600 dark:text-zinc-400">
                {p1Name} {p1BaseRatio}% • {p2Name} {p2BaseRatio}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200/60 dark:border-zinc-700/40">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{language === 'es' ? 'Nuevo reparto este mes:' : 'New split this month:'}</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {p1Name} {p1Ratio}% • {p2Name} {p2Ratio}%
              </span>
            </div>
          </div>

          {/* Scope Selector Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
            <label className="block text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
              {t('saveModeLabel')}
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                applyMode === 'this_month'
                  ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-2xs'
                  : 'border-zinc-200 dark:border-zinc-700/60 hover:bg-white/50 dark:hover:bg-zinc-800/60'
              }`}>
                <input
                  type="radio"
                  name="applyMode"
                  value="this_month"
                  checked={applyMode === 'this_month'}
                  onChange={() => setApplyMode('this_month')}
                  className="mt-0.5 text-zinc-900 focus:ring-zinc-500"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                    {t('saveModeThisMonth')}
                  </span>
                  <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">
                    {t('saveModeThisMonthDesc')}
                  </span>
                </div>
              </label>

              <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                applyMode === 'permanent'
                  ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-2xs'
                  : 'border-zinc-200 dark:border-zinc-700/60 hover:bg-white/50 dark:hover:bg-zinc-800/60'
              }`}>
                <input
                  type="radio"
                  name="applyMode"
                  value="permanent"
                  checked={applyMode === 'permanent'}
                  onChange={() => setApplyMode('permanent')}
                  className="mt-0.5 text-zinc-900 focus:ring-zinc-500"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                    {t('saveModePermanent')}
                  </span>
                  <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">
                    {t('saveModePermanentDesc')}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {applyMode === 'this_month' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('notesOptional')}
              </label>
              <input
                type="text"
                placeholder={language === 'es' ? 'Ej. Paga extra de verano, comisiones por ventas...' : 'e.g. Summer bonus, sales commission...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
            {monthlyIncome?.isCustom ? (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-xs text-rose-600 hover:underline font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('resetToBaseSalary')}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{t('saving')}</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {applyMode === 'permanent'
                        ? (language === 'es' ? 'Guardar como Sueldo Habitual' : 'Save as Standard Salary')
                        : (language === 'es' ? `Guardar para ${currentMonth}` : `Save for ${currentMonth}`)}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, PiggyBank, Plus, Minus } from 'lucide-react';
import { SavingsGoal, UserSettings } from '@/lib/types';
import { useHousehold } from '@/context/HouseholdContext';
import { CategoryIcon } from './Icons';

const GOAL_ICONS = ['PiggyBank', 'Gift', 'Car', 'Home', 'Tv', 'HeartPulse', 'Utensils', 'Wifi'];
const GOAL_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goal?: SavingsGoal | null;
  settings: UserSettings;
}

export default function SavingsGoalModal({ isOpen, onClose, goal, settings }: Props) {
  const { saveSavingsGoal, adjustSavingsGoalAmount, deleteSavingsGoal, language, t } = useHousehold();

  // Mode: 'create' | 'edit' | 'adjust'
  const [mode, setMode] = useState<'details' | 'adjust'>('details');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [icon, setIcon] = useState('PiggyBank');
  const [color, setColor] = useState('#10b981');
  const [targetDate, setTargetDate] = useState('');

  // Adjustment
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustAction, setAdjustAction] = useState<'add' | 'withdraw'>('add');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(String(goal.targetAmount));
      setCurrentAmount(String(goal.currentAmount));
      setIcon(goal.icon || 'PiggyBank');
      setColor(goal.color || '#10b981');
      setTargetDate(goal.targetDate || '');
      setMode('adjust'); // Default to adjust if clicking an existing goal
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setIcon('PiggyBank');
      setColor('#10b981');
      setTargetDate('');
      setMode('details');
    }
    setAdjustAmount('');
    setError('');
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('goalName'));
      return;
    }
    const numTarget = parseFloat(targetAmount.replace(',', '.'));
    if (isNaN(numTarget) || numTarget <= 0) {
      setError('Por favor indica un importe objetivo válido.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const ok = await saveSavingsGoal({
      id: goal?.id,
      name: name.trim(),
      targetAmount: numTarget,
      currentAmount: goal ? goal.currentAmount : parseFloat(currentAmount.replace(',', '.')) || 0,
      icon,
      color,
      targetDate: targetDate || undefined,
    });

    setIsSubmitting(false);
    if (ok) {
      onClose();
    } else {
      setError('Error al guardar el bote de ahorro');
    }
  };

  const handleAdjustFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    const numDelta = parseFloat(adjustAmount.replace(',', '.'));
    if (isNaN(numDelta) || numDelta <= 0) {
      setError('Por favor introduce un importe válido.');
      return;
    }

    setIsSubmitting(true);
    const delta = adjustAction === 'add' ? numDelta : -numDelta;
    const ok = await adjustSavingsGoalAmount(goal.id, delta);
    setIsSubmitting(false);

    if (ok) {
      onClose();
    } else {
      setError('Error al actualizar el saldo del bote');
    }
  };

  const handleDelete = async () => {
    if (!goal) return;
    if (!confirm(`¿Eliminar el bote de ahorro "${goal.name}"?`)) return;
    setIsSubmitting(true);
    await deleteSavingsGoal(goal.id);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-backdrop-fade">
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs shadow-2xs shrink-0"
              style={{ backgroundColor: color }}
            >
              <CategoryIcon name={icon} className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white truncate">
              {goal ? goal.name : (language === 'es' ? 'Crear Nuevo Bote de Ahorro' : 'Create Savings Goal')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 shrink-0"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Mode Switcher for existing goals */}
        {goal && (
          <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-5 pt-3 gap-2 bg-zinc-50/50 dark:bg-zinc-800/30">
            <button
              type="button"
              onClick={() => setMode('adjust')}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
                mode === 'adjust'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              Ingresar / Retirar
            </button>
            <button
              type="button"
              onClick={() => setMode('details')}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
                mode === 'details'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              Editar Objetivo
            </button>
          </div>
        )}

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        {mode === 'adjust' && goal ? (
          <form onSubmit={handleAdjustFunds} className="p-5 space-y-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Saldo Actual</span>
                <div className="text-2xl font-mono font-black text-zinc-900 dark:text-zinc-100">
                  {goal.currentAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {settings.currencySymbol}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Meta</span>
                <div className="text-sm font-mono font-bold text-zinc-500">
                  {goal.targetAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {settings.currencySymbol}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustAction('add')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  adjustAction === 'add'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{t('contributeFunds')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustAction('withdraw')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  adjustAction === 'withdraw'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}
              >
                <Minus className="w-4 h-4 text-rose-600" />
                <span>{t('withdrawFunds')}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Importe a {adjustAction === 'add' ? 'Ingresar' : 'Retirar'} ({settings.currencySymbol})
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                autoFocus
                placeholder="0,00"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-base font-bold font-mono focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
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
                    <span>Aplicar Movimiento</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitDetails} className="p-5 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('goalName')}
              </label>
              <input
                type="text"
                required
                placeholder={t('goalNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('targetAmount')} ({settings.currencySymbol})
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="1000,00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('targetDate')}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Icono</label>
              <div className="flex flex-wrap gap-1.5">
                {GOAL_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded-lg border transition-all ${
                      icon === iconName
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <CategoryIcon name={iconName} className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {GOAL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      color === c ? 'border-zinc-900 dark:border-zinc-100 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              {goal ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  {t('delete')}
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
                      <span>{goal ? t('update') : t('saveExpenseBtn')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

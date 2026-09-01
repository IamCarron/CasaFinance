'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Category, FixedBudgetItem, UserSettings } from '@/lib/types';
import { useHousehold } from '@/context/HouseholdContext';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  settings: UserSettings;
  editingItem?: FixedBudgetItem | null;
}

export default function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  settings,
  editingItem,
}: BudgetModalProps) {
  const { t } = useHousehold();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [splitOverride, setSplitOverride] = useState<'default' | 'equal'>('default');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setAmount(String(editingItem.amount));
      setCategoryId(editingItem.categoryId);
      setNotes(editingItem.notes || '');
      setSplitOverride(editingItem.splitModeOverride === 'equal' ? 'equal' : 'default');
      setIsActive(editingItem.isActive);
    } else {
      setName('');
      setAmount('');
      setCategoryId(categories[0]?.id || 'cat-vivienda');
      setNotes('');
      setSplitOverride('default');
      setIsActive(true);
    }
    setError('');
  }, [editingItem, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('budgetItemName'));
      return;
    }
    const cleanedAmount = amount.includes(',')
      ? amount.replace(/\./g, '').replace(',', '.')
      : amount;
    const numAmount = parseFloat(cleanedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor introduce un importe válido / Please enter a valid amount.');
      return;
    }
    if (!categoryId) {
      setError('Por favor selecciona una categoría / Please select a category.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem ? editingItem.id : undefined,
          name: name.trim(),
          amount: numAmount,
          categoryId,
          splitModeOverride: splitOverride === 'equal' ? 'equal' : null,
          notes: notes.trim(),
          isActive,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar el presupuesto');
      }

      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Hubo un error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-backdrop-fade">
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 sm:hidden" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              {editingItem ? t('editBudgetItem') : t('addBudgetItemTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('budgetItemName')}
            </label>
            <input
              type="text"
              required
              placeholder={t('budgetNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('amount')} ({settings.currencySymbol})
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('category')}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('splitCriterion')}
            </label>
            <select
              value={splitOverride}
              onChange={(e) => setSplitOverride(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="default">{t('generalHouseholdSplit')} ({settings.splitMode === 'equal' ? '50/50' : t('proportional')})</option>
              <option value="equal">{t('force5050Always')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('reminderNotes')}
            </label>
            <input
              type="text"
              placeholder={t('reminderPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-400 border-zinc-300 dark:border-zinc-700"
            />
            <label htmlFor="isActive" className="text-xs text-zinc-700 dark:text-zinc-300 select-none">
              {t('includeInMonthlyBudget')}
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
                  <span>{editingItem ? t('update') : t('saveBudgetItemBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

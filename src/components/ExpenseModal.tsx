import React, { useState, useEffect, useRef } from 'react';
import { X, CreditCard, User, Users, Check, Calendar, Tag, FileText, Camera, Sparkles, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Category, Expense, PaidBy, SplitBetween, UserSettings } from '@/lib/types';
import { useHousehold } from '@/context/HouseholdContext';
import { CategoryIcon } from './Icons';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  settings: UserSettings;
  editingExpense?: Expense | null;
  defaultMonth?: string;
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  settings,
  editingExpense,
  defaultMonth,
}: ExpenseModalProps) {
  const { t, language } = useHousehold();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paidBy, setPaidBy] = useState<PaidBy>('common');
  const [splitBetween, setSplitBetween] = useState<SplitBetween>('both');
  const [splitModeOverride, setSplitModeOverride] = useState<'default' | 'equal' | null>(null);
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);

  const [isScanning, setIsScanning] = useState(false);
  const [scanWarning, setScanWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(String(editingExpense.amount));
      setDate(editingExpense.date);
      setCategoryId(editingExpense.categoryId);
      setPaidBy(editingExpense.paidBy);
      setSplitBetween(editingExpense.splitBetween);
      setSplitModeOverride(editingExpense.splitModeOverride || null);
      setNotes(editingExpense.notes || '');
      setReceiptUrl(editingExpense.receiptUrl);
    } else {
      // Default to today or first day of selected month
      const today = new Date().toISOString().split('T')[0];
      const todayMonth = today.slice(0, 7);
      if (defaultMonth && defaultMonth !== todayMonth) {
        setDate(`${defaultMonth}-01`);
      } else {
        setDate(today);
      }
      setTitle('');
      setAmount('');
      setCategoryId(categories[0]?.id || 'cat-comida');
      setPaidBy('common');
      setSplitBetween('both');
      setSplitModeOverride(null);
      setNotes('');
      setReceiptUrl(undefined);
    }
    setError('');
    setScanWarning('');
  }, [editingExpense, isOpen, categories, defaultMonth]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError('');
    setScanWarning('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              filename: file.name,
            }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Error procesando ticket');
          }

          const data = await res.json();
          if (data.receiptUrl) {
            setReceiptUrl(data.receiptUrl);
          }

          if (data.parsed) {
            if (data.parsed.title) setTitle(data.parsed.title);
            if (data.parsed.amount > 0) setAmount(String(data.parsed.amount));
            if (data.parsed.date) setDate(data.parsed.date);
            if (data.parsed.categoryId) setCategoryId(data.parsed.categoryId);
            if (data.parsed.notes) setNotes(data.parsed.notes);
          }

          if (data.warning) {
            setScanWarning(data.warning);
          }
        } catch (err: any) {
          setError(err.message || 'Error escaneando comprobante');
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Error leyendo archivo');
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('conceptDescription'));
      return;
    }
    // Handle European number formats: 1.200,50 → 1200.50, or 1,200.50 → 1200.50
    const cleanedAmount = amount.includes(',')
      ? amount.replace(/\./g, '').replace(',', '.')
      : amount;
    const numAmount = parseFloat(cleanedAmount);
    if (isNaN(numAmount) || numAmount === 0) {
      setError('Por favor introduce un importe válido / Please enter a valid amount.');
      return;
    }
    if (!date) {
      setError('Por favor selecciona una fecha / Please select a date.');
      return;
    }
    if (!categoryId) {
      setError('Por favor selecciona una categoría / Please select a category.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingExpense ? editingExpense.id : undefined,
          title: title.trim(),
          amount: numAmount,
          date,
          categoryId,
          paidBy,
          splitBetween,
          splitModeOverride,
          notes: notes.trim(),
          receiptUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar el gasto');
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
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 sm:hidden" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              {editingExpense ? t('editExpense') : t('addNewExpense')}
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

          {scanWarning && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-medium">
              ⚠️ {scanWarning}
            </div>
          )}

          {/* OCR / Camera Scan Box */}
          <div className="p-3.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shrink-0">
                {isScanning ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                  {isScanning ? t('scanningReceipt') : t('scanReceipt')}
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  {isScanning
                    ? (language === 'es' ? 'Extrayendo importe, fecha y comercio...' : 'Extracting total, date and merchant...')
                    : (language === 'es' ? 'Auto-completa el formulario con foto o captura' : 'Auto-fill form from photo or screenshot')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isScanning}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{receiptUrl ? (language === 'es' ? 'Cambiar Foto' : 'Change Photo') : (language === 'es' ? 'Subir Foto / Ticket' : 'Upload Photo')}</span>
              </button>
            </div>
          </div>

          {/* Attached Receipt Thumbnail */}
          {receiptUrl && (
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline truncate"
                >
                  {language === 'es' ? 'Ver comprobante adjunto 📄' : 'View attached receipt 📄'}
                </a>
              </div>
              <button
                type="button"
                onClick={() => setReceiptUrl(undefined)}
                className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                title={t('removeReceipt')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Importe y Concepto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('conceptDescription')}
              </label>
              <input
                type="text"
                required
                placeholder={t('conceptPlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

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
          </div>

          {/* Categoría y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>

          {/* ¿Quién lo pagó? */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t('whoPaid')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaidBy('common')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  paidBy === 'common'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1 text-zinc-600 dark:text-zinc-400" />
                <span>{t('commonAccount')}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaidBy('partner1')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  paidBy === 'partner1'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <User className="w-4 h-4 mb-1 text-zinc-600 dark:text-zinc-400" />
                <span className="truncate max-w-[80px]">{settings.partner1Name}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaidBy('partner2')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  paidBy === 'partner2'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <User className="w-4 h-4 mb-1 text-zinc-600 dark:text-zinc-400" />
                <span className="truncate max-w-[80px]">{settings.partner2Name}</span>
              </button>
            </div>
            {paidBy !== 'common' && (
              <p className="text-[11px] text-zinc-500 mt-1.5">
                {t('paidOutOfPocketNote')}
              </p>
            )}
          </div>

          {/* ¿Para quién es el gasto? */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t('whoIsThisFor')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSplitBetween('both')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all ${
                  splitBetween === 'both'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('forBoth')}</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitBetween('partner1')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all ${
                  splitBetween === 'partner1'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <span className="truncate">{t('onlyPartner')} {settings.partner1Name}</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitBetween('partner2')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all ${
                  splitBetween === 'partner2'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <span className="truncate">{t('onlyPartner')} {settings.partner2Name}</span>
              </button>
            </div>
            
            {splitBetween === 'both' && settings.splitMode !== 'equal' && (
              <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                <input
                  type="checkbox"
                  id="override5050"
                  className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                  checked={splitModeOverride === 'equal'}
                  onChange={(e) => setSplitModeOverride(e.target.checked ? 'equal' : null)}
                />
                <label htmlFor="override5050" className="text-xs text-zinc-700 dark:text-zinc-300 leading-tight">
                  <strong className="block mb-0.5 font-bold">{t('force5050Split')}</strong>
                  <span className="text-zinc-500 text-[11px]">{t('force5050Explanation')}</span>
                </label>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('additionalNotes')}
            </label>
            <input
              type="text"
              placeholder={t('notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
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
                  <span>{editingExpense ? t('update') : t('saveExpenseBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

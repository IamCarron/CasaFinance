'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useHousehold } from '@/context/HouseholdContext';

interface MonthPickerProps {
  currentMonth: string; // 'YYYY-MM'
  onChange: (month: string) => void;
}

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthPicker({ currentMonth, onChange }: MonthPickerProps) {
  const { language, t } = useHousehold();
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  const today = new Date();
  const currentActualMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const isActualMonth = currentMonth === currentActualMonth;

  const handlePrev = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNext = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleCurrent = () => {
    onChange(currentActualMonth);
  };

  const monthList = language === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_ES;
  const monthLabel = monthList[month - 1] || '';

  return (
    <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
      <button
        onClick={handlePrev}
        title={t('prevMonth')}
        aria-label={t('prevMonth')}
        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 px-2.5 py-1 text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-sm min-w-[130px] justify-center select-none">
        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
        <span>{monthLabel}</span>
        <span className="text-zinc-400 font-normal">{year}</span>
      </div>

      <button
        onClick={handleNext}
        title={t('nextMonth')}
        aria-label={t('nextMonth')}
        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {!isActualMonth && (
        <button
          onClick={handleCurrent}
          className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold transition-colors ml-1"
        >
          {t('today')}
        </button>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { CategoryBreakdown } from '@/lib/types';
import { CategoryIcon } from './Icons';
import { AlertTriangle } from 'lucide-react';

interface CategoryProgressProps {
  breakdowns: CategoryBreakdown[];
  currency: string;
}

export default function CategoryProgress({ breakdowns, currency }: CategoryProgressProps) {
  if (!breakdowns || breakdowns.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center text-zinc-400 text-xs">
        No hay partidas de presupuesto ni gastos en este mes.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            Presupuesto por Categoría
          </h3>
          <p className="text-xs text-zinc-500">
            Seguimiento de gasto real vs previsión
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {breakdowns.map((b) => {
          const isOverBudget = b.totalSpent > b.budgeted && b.budgeted > 0;
          const isNearLimit = b.percentageUsed >= 85 && b.percentageUsed <= 100;
          const barWidth = Math.min(100, b.percentageUsed);

          let barColor = 'bg-zinc-900 dark:bg-zinc-100';
          if (isOverBudget) {
            barColor = 'bg-rose-600';
          } else if (isNearLimit) {
            barColor = 'bg-amber-500';
          }

          return (
            <div key={b.category.id} className="p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: b.category.color }}
                  >
                    <CategoryIcon name={b.category.icon} className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                      {b.category.name}
                      {isOverBudget && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3 h-3" /> Excedido
                        </span>
                      )}
                    </span>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {b.budgeted > 0 ? (
                        <>
                          Presupuesto: {b.budgeted.toLocaleString('es-ES', { minimumFractionDigits: 0 })}{currency}
                          {b.remaining >= 0 ? ` • Quedan ${b.remaining.toLocaleString('es-ES', { minimumFractionDigits: 0 })}${currency}` : ` • Exceso de ${Math.abs(b.remaining).toLocaleString('es-ES', { minimumFractionDigits: 0 })}${currency}`}
                        </>
                      ) : (
                        'Sin presupuesto fijo'
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {b.totalSpent.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                  </div>
                  {b.budgeted > 0 && (
                    <div
                      className={`text-[11px] font-semibold ${
                        isOverBudget
                          ? 'text-rose-600 dark:text-rose-400'
                          : isNearLimit
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {b.percentageUsed}%
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {b.budgeted > 0 && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

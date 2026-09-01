'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryBreakdown } from '@/lib/types';

interface CategoryChartProps {
  breakdowns: CategoryBreakdown[];
  currency: string;
}

export default function CategoryChart({ breakdowns, currency }: CategoryChartProps) {
  const chartData = breakdowns
    .filter((b) => b.totalSpent > 0)
    .map((b) => ({
      name: b.category.name,
      value: b.totalSpent,
      color: b.category.color,
    }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[280px] text-center">
        <p className="text-xs text-zinc-400">
          No hay gastos registrados en este mes para mostrar en el gráfico.
        </p>
      </div>
    );
  }

  const totalSpent = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col transition-all">
      <div className="mb-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <h3 className="font-bold text-base text-zinc-900 dark:text-white">
          Distribución del Gasto
        </h3>
        <p className="text-xs text-zinc-500">
          Desglose porcentual
        </p>
      </div>

      <div className="relative w-full h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [
                `${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2 })} ${currency} (${Math.round((Number(value) / totalSpent) * 100)}%)`,
                'Gasto',
              ]}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total in Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            {totalSpent.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currency}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2 truncate">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

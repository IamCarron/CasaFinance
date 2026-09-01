'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowRight, Wallet, UserCheck } from 'lucide-react';
import { MonthlySummary } from '@/lib/types';

interface ContributionHeroProps {
  summary: MonthlySummary;
  currency: string;
}

export default function ContributionHero({ summary, currency }: ContributionHeroProps) {
  const {
    totalFixedBudget,
    partner1FixedContribution,
    partner2FixedContribution,
    partner1Ratio,
    partner2Ratio,
    settings,
    month,
  } = summary;

  const [p1Transferred, setP1Transferred] = useState(false);
  const [p2Transferred, setP2Transferred] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`transfer_${month}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setP1Transferred(Boolean(parsed.p1));
        setP2Transferred(Boolean(parsed.p2));
      } else {
        setP1Transferred(false);
        setP2Transferred(false);
      }
    } catch {
      // Ignore
    }
  }, [month]);

  const toggleP1 = () => {
    const next = !p1Transferred;
    setP1Transferred(next);
    localStorage.setItem(`transfer_${month}`, JSON.stringify({ p1: next, p2: p2Transferred }));
  };

  const toggleP2 = () => {
    const next = !p2Transferred;
    setP2Transferred(next);
    localStorage.setItem(`transfer_${month}`, JSON.stringify({ p1: p1Transferred, p2: next }));
  };

  const splitModeLabel =
    settings.splitMode === 'equal'
      ? 'Reparto al 50/50'
      : settings.splitMode === 'proportional'
      ? `Proporcional a ingresos (${partner1Ratio}% / ${partner2Ratio}%)`
      : `Personalizado (${partner1Ratio}% / ${partner2Ratio}%)`;

  const bothTransferred = p1Transferred && p2Transferred;

  return (
    <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
            Paso 1 • Cuotas del Mes
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Aportación a la Cuenta Común
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {splitModeLabel} para cubrir {totalFixedBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency} de gastos fijos
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Fondo Total Fijo</span>
          <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            {totalFixedBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
          </div>
        </div>
      </div>

      {/* Partner Split Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-5">
        {/* Partner 1 (Tú) */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            p1Transferred
              ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
              : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300">
                {settings.partner1Name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{settings.partner1Name}</h3>
                <span className="text-[11px] text-zinc-500 font-medium">{partner1Ratio}% de la cuota</span>
              </div>
            </div>

            <button
              onClick={toggleP1}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                p1Transferred
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              {p1Transferred ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Transferido</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Pendiente</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-3.5 flex items-baseline justify-between pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs text-zinc-500 font-medium">Cuota a transferir:</span>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">
              {partner1FixedContribution.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
            </div>
          </div>
        </div>

        {/* Partner 2 */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            p2Transferred
              ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
              : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300">
                {settings.partner2Name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{settings.partner2Name}</h3>
                <span className="text-[11px] text-zinc-500 font-medium">{partner2Ratio}% de la cuota</span>
              </div>
            </div>

            <button
              onClick={toggleP2}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                p2Transferred
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              {p2Transferred ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Transferido</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Pendiente</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-3.5 flex items-baseline justify-between pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs text-zinc-500 font-medium">Cuota a transferir:</span>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">
              {partner2FixedContribution.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
            </div>
          </div>
        </div>
      </div>

      {bothTransferred && (
        <div className="mt-4 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>¡Cuenta común fondeada al 100%! Ambos habéis realizado vuestra transferencia mensual.</span>
        </div>
      )}
    </div>
  );
}

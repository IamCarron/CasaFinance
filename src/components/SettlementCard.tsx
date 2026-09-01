'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Scale, ArrowRight, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { SettlementDetail, UserSettings } from '@/lib/types';

interface SettlementCardProps {
  settlement: SettlementDetail;
  settings: UserSettings;
  currency: string;
}

export default function SettlementCard({ settlement, settings, currency }: SettlementCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const hasDebt = settlement.amountToPay > 0.01;

  return (
    <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
            Paso 2 • Reembolsos
          </span>
          <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white tracking-tight">
            Balance de Gastos Particulares
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Adelantos pagados con dinero personal de cada miembro
          </p>
        </div>

        <Link
          href="/liquidaciones"
          className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1 group"
        >
          <span>Ver liquidación</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="mt-4">
        {hasDebt ? (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-zinc-900 dark:text-white mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white text-sm">
                    <strong>{settlement.debtor}</strong> debe transferir a <strong>{settlement.creditor}</strong>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Para compensar compras adelantadas de su bolsillo.
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                  {settlement.amountToPay.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                  {currency}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-3 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
            >
              <span>{showDetails ? 'Ocultar desglose' : 'Ver desglose'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDetails && (
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs space-y-1 text-zinc-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span>{settings.partner1Name} pagó de su bolsillo:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {settlement.partner1PaidForBoth.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{settings.partner2Name} pagó de su bolsillo:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {settlement.partner2PaidForBoth.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              ¡Cuentas al día! Nadie debe nada por compras personales este mes.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

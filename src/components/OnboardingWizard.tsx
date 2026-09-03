'use client';

import React, { useState } from 'react';
import { useHousehold } from '@/context/HouseholdContext';
import Logo from '@/components/Logo';
import {
  Users,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Percent,
  Bot,
  Smartphone,
  Send,
  Slash,
  QrCode,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export default function OnboardingWizard() {
  const { settings, saveSettings, language, setLanguage, t } = useHousehold();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [partner1Name, setPartner1Name] = useState(settings?.partner1Name === 'Tú' ? '' : (settings?.partner1Name || ''));
  const [partner2Name, setPartner2Name] = useState(settings?.partner2Name === 'Pareja' ? '' : (settings?.partner2Name || ''));
  const [currencySymbol, setCurrencySymbol] = useState(settings?.currencySymbol || '€');
  const [splitMode, setSplitMode] = useState<'proportional' | 'equal'>('proportional');
  const [partner1Income, setPartner1Income] = useState(String(settings?.partner1Income || '1800'));
  const [partner2Income, setPartner2Income] = useState(String(settings?.partner2Income || '1200'));
  const [partner1IncomeType, setPartner1IncomeType] = useState<'fixed' | 'variable'>('fixed');
  const [partner2IncomeType, setPartner2IncomeType] = useState<'fixed' | 'variable'>('fixed');

  // Bot State
  const [botPlatform, setBotPlatform] = useState<'whatsapp' | 'telegram' | 'none'>('none');
  const [whatsappGroupName, setWhatsappGroupName] = useState('Gastos Casa');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramGroupName, setTelegramGroupName] = useState('Gastos Casa');
  const [whatsappStatus, setWhatsappStatus] = useState<'disconnected' | 'qr_ready' | 'connected'>('disconnected');
  const [whatsappQrDataUrl, setWhatsappQrDataUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Poll WhatsApp status in Wizard Step 3
  React.useEffect(() => {
    if (step !== 3 || botPlatform !== 'whatsapp') return;
    let timer: NodeJS.Timeout;
    const checkStatus = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/bot/status', { headers });
        if (res.ok) {
          const data = await res.json();
          setWhatsappStatus(data.status || 'disconnected');
          if (data.qrDataUrl) {
            setWhatsappQrDataUrl(data.qrDataUrl);
          } else if (data.status === 'connected') {
            setWhatsappQrDataUrl(null);
          }
        }
      } catch (e) {}
    };

    checkStatus();
    timer = setInterval(checkStatus, 2500);
    return () => clearInterval(timer);
  }, [step, botPlatform]);

  const p1Inc = parseFloat(partner1Income) || 0;
  const p2Inc = parseFloat(partner2Income) || 0;
  const totalInc = p1Inc + p2Inc;
  const p1Ratio = totalInc > 0 ? Math.round((p1Inc / totalInc) * 100) : 50;
  const p2Ratio = totalInc > 0 ? 100 - p1Ratio : 50;

  const handleFinish = async () => {
    setIsSaving(true);
    await saveSettings({
      partner1Name: partner1Name.trim() || 'Tú',
      partner2Name: partner2Name.trim() || 'Pareja',
      currencySymbol: currencySymbol.trim() || '€',
      splitMode,
      partner1Income: p1Inc,
      partner2Income: p2Inc,
      partner1IncomeType,
      partner2IncomeType,
      incomeType: partner1IncomeType === 'variable' || partner2IncomeType === 'variable' ? 'variable' : 'fixed',
      botPlatform,
      whatsappGroupName,
      telegramBotToken,
      telegramGroupName,
      isOnboarded: true,
    });
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfdfc] dark:bg-[#0c0c0e] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between">
        <Logo size="md" />

        {/* Language Pill */}
        <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-50 dark:bg-zinc-900 text-xs">
          <button
            type="button"
            onClick={() => setLanguage('es')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all ${
              language === 'es' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs' : 'text-zinc-400'
            }`}
          >
            ES
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all ${
              language === 'en' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs' : 'text-zinc-400'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Center Wizard Container */}
      <div className="max-w-xl w-full mx-auto my-8 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-2 pb-2">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-zinc-900 dark:bg-zinc-100' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-zinc-900 dark:bg-zinc-100' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 3 ? 'w-8 bg-zinc-900 dark:bg-zinc-100' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 4 ? 'w-8 bg-zinc-900 dark:bg-zinc-100' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`} />
        </div>

        {/* STEP 1: Welcome & Names */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="text-center space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {language === 'es' ? '¡Bienvenidos a vuestro hogar!' : 'Welcome to your household!'}
              </h1>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {language === 'es'
                  ? 'Configurad vuestro espacio de finanzas compartidas en menos de 1 minuto.'
                  : 'Set up your shared couple finances in less than 1 minute.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {language === 'es' ? 'Tu nombre o integrante 1' : 'Your name / Partner 1'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos, Alex..."
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {language === 'es' ? 'Nombre de tu pareja o integrante 2' : 'Partner name / Partner 2'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. María, Sam..."
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {language === 'es' ? 'Moneda de la cuenta' : 'Currency Symbol'}
                </label>
                <div className="flex gap-2">
                  {['€', '$', '£', 'CHF'].map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setCurrencySymbol(sym)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        currencySymbol === sym
                          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>{language === 'es' ? 'Siguiente: Elegir cómo repartir' : 'Next: Choose Split Rule'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Choose Financial Model */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {language === 'es' ? '¿Cómo queréis dividir los gastos?' : 'How do you want to split expenses?'}
              </h2>
              <p className="text-xs text-zinc-500">
                {language === 'es'
                  ? 'Podréis cambiar este modo o forzar excepciones en cualquier momento.'
                  : 'You can change this anytime or force per-expense exceptions.'}
              </p>
            </div>

            <div className="space-y-3">
              {/* Option A: Proportional (Recommended) */}
              <div
                onClick={() => setSplitMode('proportional')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 ${
                  splitMode === 'proportional'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50/80 dark:bg-zinc-800/40 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'es' ? 'Proporcional a Ingresos' : 'Income Proportional'}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    {language === 'es' ? '⭐ Recomendado' : '⭐ Recommended'}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  {language === 'es'
                    ? 'Cada uno aporta un porcentaje idéntico de su sueldo neto. Quien más gana, asume una cuota mayor de forma justa y equitativa.'
                    : 'Each person contributes an identical percentage of their net salary. The higher earner covers a fair, larger portion.'}
                </p>

                {splitMode === 'proportional' && (
                  <div
                    className="pt-3 border-t border-zinc-200/80 dark:border-zinc-700/60 space-y-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                        {language === 'es' ? 'Sueldos netos y tipo de nómina de cada uno:' : 'Net salaries and income type for each partner:'}
                      </span>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {language === 'es'
                          ? 'Indica si tienes nómina fija o ingresos variables (autónomo, comisiones, extras).'
                          : 'Select whether each partner has a fixed salary or variable income (freelance, bonuses).'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Partner 1 */}
                      <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/90 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {partner1Name || 'Tú'}
                          </label>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            partner1IncomeType === 'variable'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                          }`}>
                            {partner1IncomeType === 'variable' ? `🔄 ${t('variableTag')}` : `📌 ${t('fixedTag')}`}
                          </span>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={partner1Income}
                            onChange={(e) => setPartner1Income(e.target.value)}
                            placeholder="1800"
                            className="w-full pl-2.5 pr-7 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                          />
                          <span className="absolute right-2.5 top-1.5 text-xs text-zinc-400 font-bold">{currencySymbol}</span>
                        </div>

                        {/* Explicit Fixed vs Variable selector */}
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => setPartner1IncomeType('fixed')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                              partner1IncomeType === 'fixed'
                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-2xs'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            📌 {t('fixedTag')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPartner1IncomeType('variable')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                              partner1IncomeType === 'variable'
                                ? 'border-amber-600 dark:border-amber-500 bg-amber-500 text-white font-bold shadow-2xs'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            🔄 {t('variableTag')}
                          </button>
                        </div>
                      </div>

                      {/* Partner 2 */}
                      <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/90 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {partner2Name || 'Pareja'}
                          </label>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            partner2IncomeType === 'variable'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                          }`}>
                            {partner2IncomeType === 'variable' ? `🔄 ${t('variableTag')}` : `📌 ${t('fixedTag')}`}
                          </span>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={partner2Income}
                            onChange={(e) => setPartner2Income(e.target.value)}
                            placeholder="1200"
                            className="w-full pl-2.5 pr-7 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                          />
                          <span className="absolute right-2.5 top-1.5 text-xs text-zinc-400 font-bold">{currencySymbol}</span>
                        </div>

                        {/* Explicit Fixed vs Variable selector */}
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => setPartner2IncomeType('fixed')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                              partner2IncomeType === 'fixed'
                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-2xs'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            📌 {t('fixedTag')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPartner2IncomeType('variable')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                              partner2IncomeType === 'variable'
                                ? 'border-amber-600 dark:border-amber-500 bg-amber-500 text-white font-bold shadow-2xs'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            🔄 {t('variableTag')}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-500">{language === 'es' ? 'Reparto calculado:' : 'Calculated split:'}</span>
                      <span className="font-black text-zinc-900 dark:text-white">
                        {partner1Name || 'Tú'}: {p1Ratio}% • {partner2Name || 'Pareja'}: {p2Ratio}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Option B: Equal 50/50 */}
              <div
                onClick={() => setSplitMode('equal')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                  splitMode === 'equal'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50/80 dark:bg-zinc-800/40 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 opacity-80'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                  <Percent className="w-4 h-4 text-zinc-500" />
                  <span>{language === 'es' ? 'División 50% / 50% Estricta' : '50% / 50% Equal Split'}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {language === 'es'
                    ? 'Todos los gastos de la casa se dividen a partes exactamente iguales independientemente de los ingresos de cada uno.'
                    : 'All household expenses are divided exactly 50/50 regardless of salary differences.'}
                </p>

                {splitMode === 'equal' && (
                  <div
                    className="pt-3 border-t border-zinc-200/80 dark:border-zinc-700/60 space-y-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      {language === 'es' ? 'Tipo de nómina de cada uno:' : 'Income type for each partner:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/90 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{partner1Name || 'Tú'}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            partner1IncomeType === 'variable'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                          }`}>
                            {partner1IncomeType === 'variable' ? `🔄 ${t('variableTag')}` : `📌 ${t('fixedTag')}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => setPartner1IncomeType('fixed')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                              partner1IncomeType === 'fixed'
                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-2xs'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50'
                            }`}
                          >
                            📌 {t('fixedTag')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPartner1IncomeType('variable')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                              partner1IncomeType === 'variable'
                                ? 'border-amber-600 bg-amber-500 text-white font-bold shadow-2xs'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50'
                            }`}
                          >
                            🔄 {t('variableTag')}
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/90 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{partner2Name || 'Pareja'}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            partner2IncomeType === 'variable'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                          }`}>
                            {partner2IncomeType === 'variable' ? `🔄 ${t('variableTag')}` : `📌 ${t('fixedTag')}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => setPartner2IncomeType('fixed')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                              partner2IncomeType === 'fixed'
                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-2xs'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50'
                            }`}
                          >
                            📌 {t('fixedTag')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPartner2IncomeType('variable')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                              partner2IncomeType === 'variable'
                                ? 'border-amber-600 bg-amber-500 text-white font-bold shadow-2xs'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50'
                            }`}
                          >
                            🔄 {t('variableTag')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>{language === 'es' ? 'Siguiente: Asistente de Chat' : 'Next: Chat Assistant'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Chat Assistant (Optional) */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="text-center space-y-1">
              <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1">
                <Bot className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t('wizardStepBotTitle')}
              </h2>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {t('wizardStepBotSubtitle')}
              </p>
            </div>

            {/* Platform Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBotPlatform('whatsapp')}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  botPlatform === 'whatsapp'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold ring-1 ring-emerald-600/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setBotPlatform('telegram')}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  botPlatform === 'telegram'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 font-bold ring-1 ring-sky-500/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Send className="w-4 h-4 text-sky-500" />
                <span>Telegram</span>
              </button>

              <button
                type="button"
                onClick={() => setBotPlatform('none')}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  botPlatform === 'none'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Slash className="w-4 h-4 text-zinc-400" />
                <span>{language === 'es' ? 'Omitir' : 'Skip'}</span>
              </button>
            </div>

            {/* WhatsApp live QR box in wizard */}
            {botPlatform === 'whatsapp' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    {t('whatsappGroupLabel')}
                  </label>
                  <input
                    type="text"
                    value={whatsappGroupName}
                    onChange={(e) => setWhatsappGroupName(e.target.value)}
                    placeholder="Gastos Casa"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                  {whatsappStatus === 'connected' ? (
                    <div className="py-3 space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">
                        {t('whatsappStatusConnected')}
                      </span>
                    </div>
                  ) : whatsappQrDataUrl ? (
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={whatsappQrDataUrl}
                        alt="WhatsApp QR Code"
                        className="w-44 h-44 mx-auto rounded-lg"
                      />
                      <p className="text-[10px] text-zinc-500">
                        {t('whatsappQrScanInstructions')}
                      </p>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                      <p className="text-[11px] text-zinc-500">
                        {t('whatsappStatusWaiting')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Telegram config in wizard */}
            {botPlatform === 'telegram' && (
              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    {t('telegramTokenLabel')}
                  </label>
                  <input
                    type="password"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    placeholder="123456789:ABC..."
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    🤖 {t('telegramTokenHelp')}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    {t('telegramGroupLabel')}
                  </label>
                  <input
                    type="text"
                    value={telegramGroupName}
                    onChange={(e) => setTelegramGroupName(e.target.value)}
                    placeholder="Gastos Casa"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* None notice */}
            {botPlatform === 'none' && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                Podrás configurar un bot de WhatsApp o Telegram en cualquier momento desde la pantalla de Ajustes.
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>{language === 'es' ? 'Siguiente: Confirmación' : 'Next: Confirmation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Summary & Ready to Go */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {language === 'es' ? '¡Todo listo para empezar!' : 'Ready to start!'}
              </h2>
              <p className="text-xs text-zinc-500">
                {language === 'es'
                  ? 'Vuestro espacio de finanzas compartidas está configurado.'
                  : 'Your shared household finance space is configured.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-700/40">
                <span className="text-zinc-500">{language === 'es' ? 'Integrantes:' : 'Partners:'}</span>
                <span className="font-bold text-zinc-900 dark:text-white">{partner1Name} & {partner2Name}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-700/40">
                <span className="text-zinc-500">{language === 'es' ? 'Modelo de Reparto:' : 'Split Model:'}</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {splitMode === 'proportional'
                    ? `${language === 'es' ? 'Proporcional' : 'Proportional'} (${p1Ratio}% / ${p2Ratio}%)`
                    : '50% / 50%'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-700/40">
                <span className="text-zinc-500">{language === 'es' ? 'Moneda:' : 'Currency:'}</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-white">{currencySymbol}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">{language === 'es' ? 'Asistente de Chat:' : 'Chat Assistant:'}</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {botPlatform === 'whatsapp'
                    ? 'WhatsApp 🟢'
                    : botPlatform === 'telegram'
                    ? 'Telegram 🔵'
                    : (language === 'es' ? 'Desactivado' : 'Disabled')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? t('saving') : (language === 'es' ? 'Entrar a CasaFinance 🚀' : 'Launch CasaFinance 🚀')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-zinc-400">
        CasaFinance • 100% Local-First & Privado
      </div>
    </div>
  );
}

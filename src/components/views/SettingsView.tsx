'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useHousehold } from '@/context/HouseholdContext';
import { CategoryIcon } from '@/components/Icons';
import {
  Save,
  CheckCircle2,
  Download,
  Upload,
  Plus,
  Trash2,
  Users,
  Tag,
  Database,
  Server,
  Smartphone,
  Info,
  Camera,
  Sparkles,
  Cpu,
  RefreshCw,
  ExternalLink,
  Bot,
  MessageSquare,
  Send,
  Slash,
  QrCode,
  LogOut,
  X,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

const AVAILABLE_ICONS = [
  'Home',
  'Zap',
  'ShoppingBag',
  'Utensils',
  'Car',
  'HeartPulse',
  'Film',
  'Tv',
  'Gift',
  'PawPrint',
  'Coffee',
  'Wifi',
  'Receipt',
  'DollarSign',
];

const AVAILABLE_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
  '#18181b',
];

export default function SettingsView() {
  const {
    settings,
    categories,
    saveSettings,
    saveCategory,
    deleteCategory,
    refreshData,
    language,
    setLanguage,
    t,
  } = useHousehold();

  const [partner1Name, setPartner1Name] = useState('Tú');
  const [partner2Name, setPartner2Name] = useState('Pareja');
  const [partner1Income, setPartner1Income] = useState('1800');
  const [partner2Income, setPartner2Income] = useState('1200');
  const [currencySymbol, setCurrencySymbol] = useState('€');
  const [currencyCode, setCurrencyCode] = useState('EUR');
  const [partner1IncomeType, setPartner1IncomeType] = useState<'fixed' | 'variable'>('fixed');
  const [partner2IncomeType, setPartner2IncomeType] = useState<'fixed' | 'variable'>('fixed');

  // OCR AI Settings
  const [ocrProvider, setOcrProvider] = useState<'ollama' | 'openai' | 'custom' | 'none'>('ollama');
  const [ocrEndpoint, setOcrEndpoint] = useState('http://localhost:11434/api/generate');
  const [ocrModel, setOcrModel] = useState('llama3.2-vision');
  const [ocrApiKey, setOcrApiKey] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [isSavingOcr, setIsSavingOcr] = useState(false);

  // Messaging Bot Settings (Telegram / WhatsApp)
  const [botPlatform, setBotPlatform] = useState<'none' | 'whatsapp' | 'telegram'>('whatsapp');
  const [whatsappGroupName, setWhatsappGroupName] = useState('Gastos Casa');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramGroupName, setTelegramGroupName] = useState('Gastos Casa');
  const [botSuccess, setBotSuccess] = useState(false);
  const [isSavingBot, setIsSavingBot] = useState(false);

  // WhatsApp Live QR & Connection Status
  const [whatsappStatus, setWhatsappStatus] = useState<'disconnected' | 'qr_ready' | 'connected'>('disconnected');
  const [whatsappQrDataUrl, setWhatsappQrDataUrl] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDisconnectingWhatsapp, setIsDisconnectingWhatsapp] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Categories
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('ShoppingBag');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  // Backup
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [backupError, setBackupError] = useState('');

  // Version & Updates
  const CURRENT_VERSION = 'v1.0.2';
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{
    checked: boolean;
    hasUpdate: boolean;
    latestVersion?: string;
    releaseUrl?: string;
    error?: string;
  }>({ checked: false, hasUpdate: false });

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateStatus({ checked: false, hasUpdate: false });
    try {
      // 1. Try releases/latest
      let latest = '';
      let releaseUrl = 'https://github.com/IamCarron/CasaFinance/releases';

      const relRes = await fetch('https://api.github.com/repos/IamCarron/CasaFinance/releases/latest', {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (relRes.ok) {
        const data = await relRes.json();
        latest = data.tag_name || data.name || '';
        if (data.html_url) releaseUrl = data.html_url;
      } else {
        // 2. Fallback to /tags if no formal release was published on GitHub Web UI
        const tagRes = await fetch('https://api.github.com/repos/IamCarron/CasaFinance/tags', {
          headers: { Accept: 'application/vnd.github.v3+json' },
        });
        if (tagRes.ok) {
          const tags = await tagRes.json();
          if (Array.isArray(tags) && tags.length > 0) {
            latest = tags[0].name || '';
            releaseUrl = `https://github.com/IamCarron/CasaFinance/releases/tag/${latest}`;
          }
        }
      }

      if (latest) {
        const hasUpdate = latest !== CURRENT_VERSION && latest.replace(/^v/, '') > CURRENT_VERSION.replace(/^v/, '');
        setUpdateStatus({
          checked: true,
          hasUpdate,
          latestVersion: latest,
          releaseUrl,
        });
      } else {
        setUpdateStatus({
          checked: true,
          hasUpdate: false,
          error: language === 'en' ? 'Could not reach GitHub Releases' : 'No se pudo consultar GitHub Releases (repositorio privado o sin releases)',
        });
      }
    } catch (err: any) {
      setUpdateStatus({
        checked: true,
        hasUpdate: false,
        error: language === 'en' ? 'Connection error with GitHub' : 'Error de conexión con GitHub',
      });
    } finally {
      setCheckingUpdate(false);
    }
  };

  useEffect(() => {
    if (settings) {
      setPartner1Name(settings.partner1Name);
      setPartner2Name(settings.partner2Name);
      setPartner1Income(String(settings.partner1Income));
      setPartner2Income(String(settings.partner2Income));
      setCurrencySymbol(settings.currencySymbol || '€');
      setCurrencyCode(settings.currencyCode || 'EUR');
      setPartner1IncomeType(settings.partner1IncomeType || settings.incomeType || 'fixed');
      setPartner2IncomeType(settings.partner2IncomeType || settings.incomeType || 'fixed');
      setOcrProvider(settings.ocrProvider || 'ollama');
      setOcrEndpoint(settings.ocrEndpoint || 'http://localhost:11434/api/generate');
      setOcrModel(settings.ocrModel || 'llama3.2-vision');
      setOcrApiKey(settings.ocrApiKey || '');
      setBotPlatform(settings.botPlatform || 'whatsapp');
      setWhatsappGroupName(settings.whatsappGroupName || 'Gastos Casa');
      setTelegramBotToken(settings.telegramBotToken || '');
      setTelegramGroupName(settings.telegramGroupName || 'Gastos Casa');
    }
  }, [settings]);

  const handleSaveBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSavingBot(true);
    const ok = await saveSettings({
      ...settings,
      botPlatform,
      whatsappGroupName,
      telegramBotToken,
      telegramGroupName,
    });
    setIsSavingBot(false);
    if (ok) {
      setBotSuccess(true);
      setTimeout(() => setBotSuccess(false), 3000);
    }
  };

  // Poll WhatsApp pairing status
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/bot/status');
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
    timer = setInterval(checkStatus, isQrModalOpen ? 2000 : 5000);
    return () => clearInterval(timer);
  }, [isQrModalOpen]);

  const handleDisconnectWhatsapp = async () => {
    if (!window.confirm(t('whatsappDisconnectConfirm'))) return;
    setIsDisconnectingWhatsapp(true);
    try {
      await fetch('/api/bot/status', { method: 'DELETE' });
      setWhatsappStatus('disconnected');
      setWhatsappQrDataUrl(null);
    } catch (e) {
    } finally {
      setIsDisconnectingWhatsapp(false);
    }
  };

  const handleSaveOcr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSavingOcr(true);
    const ok = await saveSettings({
      ...settings,
      ocrProvider,
      ocrEndpoint,
      ocrModel,
      ocrApiKey,
    });
    setIsSavingOcr(false);
    if (ok) {
      setOcrSuccess(true);
      setTimeout(() => setOcrSuccess(false), 3000);
    }
  };

  const handleSaveProfiles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSavingSettings(true);
    const ok = await saveSettings({
      ...settings,
      partner1Name,
      partner2Name,
      partner1Income: parseFloat(partner1Income) || 0,
      partner2Income: parseFloat(partner2Income) || 0,
      currencySymbol,
      currencyCode,
      partner1IncomeType,
      partner2IncomeType,
      incomeType: partner1IncomeType === 'variable' || partner2IncomeType === 'variable' ? 'variable' : 'fixed',
    });
    setIsSavingSettings(false);
    if (ok) {
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 2500);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const ok = await saveCategory({
      name: newCatName.trim(),
      icon: newCatIcon,
      color: newCatColor,
    });

    if (ok) {
      setNewCatName('');
      setIsAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t('deleteCategoryConfirm'))) return;
    await deleteCategory(id);
  };

  const handleDownloadBackup = async () => {
    const token = localStorage.getItem('adminToken') || '';
    const res = await fetch('/api/backup', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `casafinance-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Error downloading backup. Unauthorized?');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(json),
      });

      if (res.ok) {
        setBackupSuccess(true);
        await refreshData();
        setTimeout(() => setBackupSuccess(false), 3000);
      } else {
        setBackupError(t('invalidJson'));
      }
    } catch (err: any) {
      setBackupError(t('invalidJson'));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* Couple Profiles Form */}
      <form onSubmit={handleSaveProfiles} className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t('profilesAndCurrency')}
            </h2>
          </div>

          <button
            type="submit"
            disabled={isSavingSettings}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-98"
          >
            {settingsSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('saved')}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingSettings ? t('saving') : t('saveChanges')}</span>
              </>
            )}
          </button>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            {t('languageLabel')}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                language === 'es'
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span>🇪🇸</span>
              <span>Español</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                language === 'en'
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('partner1NameLabel')}
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Carlos, Alex..."
              value={partner1Name}
              onChange={(e) => setPartner1Name(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('partner2NameLabel')}
            </label>
            <input
              type="text"
              required
              placeholder="Ej. María, Sam..."
              value={partner2Name}
              onChange={(e) => setPartner2Name(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('currencySymbolLabel')}
            </label>
            <input
              type="text"
              required
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('currencyIsoLabel')}
            </label>
            <input
              type="text"
              required
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
        </div>

        {/* Income Modality Mode per Partner */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t('incomeModeTitle')}
            </label>
            <p className="text-[11px] text-zinc-400">
              {t('incomeModeSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Partner 1 Income Type */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{partner1Name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  partner1IncomeType === 'variable'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {partner1IncomeType === 'variable' ? `🔄 ${t('variableTag')}` : `📌 ${t('fixedTag')}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPartner1IncomeType('fixed')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    partner1IncomeType === 'fixed'
                      ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-white/50'
                  }`}
                >
                  {t('fixedTag')}
                </button>
                <button
                  type="button"
                  onClick={() => setPartner1IncomeType('variable')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    partner1IncomeType === 'variable'
                      ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-white/50'
                  }`}
                >
                  {t('variableTag')}
                </button>
              </div>
            </div>

            {/* Partner 2 Income Type */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{partner2Name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  partner2IncomeType === 'variable'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {partner2IncomeType === 'variable' ? `🔄 ${t('variableTag')}` : `📌 ${t('fixedTag')}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPartner2IncomeType('fixed')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    partner2IncomeType === 'fixed'
                      ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-white/50'
                  }`}
                >
                  {t('fixedTag')}
                </button>
                <button
                  type="button"
                  onClick={() => setPartner2IncomeType('variable')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    partner2IncomeType === 'variable'
                      ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-white/50'
                  }`}
                >
                  {t('variableTag')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            {language === 'es' ? '¿Quieres volver a realizar la configuración guiada inicial?' : 'Want to re-run the initial guided setup?'}
          </span>
          <button
            type="button"
            onClick={async () => {
              if (confirm(language === 'es' ? '¿Abrir el Asistente de Configuración Inicial?' : 'Open the Setup Wizard?')) {
                await saveSettings({ ...settings, isOnboarded: false });
              }
            }}
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline"
          >
            {language === 'es' ? 'Abrir Asistente Inicial' : 'Launch Setup Wizard'}
          </button>
        </div>
      </form>

      {/* Category Manager */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t('categoriesTitle')} ({categories.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingCat(!isAddingCat)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingCat ? t('close') : t('newCategory')}</span>
          </button>
        </div>

        {isAddingCat && (
          <form onSubmit={handleAddCategory} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t('name')}</label>
              <input
                type="text"
                required
                placeholder="Ej. Ocio, Viajes, Mascotas..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t('icon')}</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setNewCatIcon(iconName)}
                    className={`p-2 rounded-lg border transition-all ${
                      newCatIcon === iconName
                        ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-white'
                    }`}
                  >
                    <CategoryIcon name={iconName} className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t('color')}</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCatColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      newCatColor === color ? 'border-zinc-900 dark:border-zinc-100 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all"
            >
              {t('createCategory')}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs shadow-2xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">{cat.name}</span>
              </div>

              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <Database className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
            {t('backupTitle')}
          </h2>
        </div>

        {backupSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            {t('backupRestoredSuccess')}
          </div>
        )}

        {backupError && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-xs font-semibold">
            {backupError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 text-zinc-900 dark:text-zinc-100 text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t('downloadBackupJson')}</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 text-zinc-900 dark:text-zinc-100 text-xs font-bold transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{t('restoreBackupJson')}</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* OCR AI Vision Receipt Scanner Settings */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{t('visionSettingsTitle')}</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                  Local / Ollama / OpenAI
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                {t('visionSettingsSubtitle')}
              </p>
            </div>
          </div>

          {ocrSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('saved')}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveOcr} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('visionEngineLabel')}
              </label>
              <select
                value={ocrProvider}
                onChange={(e) => setOcrProvider(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="ollama">{t('visionEngineOllama')}</option>
                <option value="openai">{t('visionEngineOpenai')}</option>
                <option value="custom">{t('visionEngineCustom')}</option>
                <option value="none">{t('visionEngineNone')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('visionModelLabel')}
              </label>
              <input
                type="text"
                value={ocrModel}
                onChange={(e) => setOcrModel(e.target.value)}
                placeholder="llama3.2-vision / gpt-4o-mini / minicpm-v"
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('visionEndpointLabel')}
              </label>
              <input
                type="text"
                value={ocrEndpoint}
                onChange={(e) => setOcrEndpoint(e.target.value)}
                placeholder="http://localhost:11434/api/generate"
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('visionApiKeyLabel')}
              </label>
              <input
                type="password"
                value={ocrApiKey}
                onChange={(e) => setOcrApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{t('visionOllamaHelp')} <code>ollama run llama3.2-vision</code></span>
            </div>

            <button
              type="submit"
              disabled={isSavingOcr}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingOcr ? t('saving') : t('visionSaveBtn')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Messaging Bot Integration (Telegram & WhatsApp) */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {t('whatsappBotTitle')}
              </h2>
              <p className="text-xs text-zinc-500">
                {t('whatsappBotSubtitle')}
              </p>
            </div>
          </div>

          {botSuccess && (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('saved')}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveBot} className="space-y-4">
          {/* Platform Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t('botPlatformLabel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBotPlatform('whatsapp')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  botPlatform === 'whatsapp'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold ring-1 ring-emerald-600/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>{t('botPlatformWhatsApp')}</span>
              </button>

              <button
                type="button"
                onClick={() => setBotPlatform('telegram')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  botPlatform === 'telegram'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 font-bold ring-1 ring-sky-500/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Send className="w-4 h-4 text-sky-500" />
                <span>{t('botPlatformTelegram')}</span>
              </button>

              <button
                type="button"
                onClick={() => setBotPlatform('none')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  botPlatform === 'none'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold ring-1 ring-zinc-500/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Slash className="w-4 h-4 text-zinc-400" />
                <span>{t('botPlatformNone')}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Specific Config */}
          {botPlatform === 'whatsapp' && (
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  {t('whatsappGroupLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={whatsappGroupName}
                  onChange={(e) => setWhatsappGroupName(e.target.value)}
                  placeholder={t('whatsappGroupPlaceholder')}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  🔒 {t('whatsappGroupHelp')}
                </p>
              </div>

              {/* Live WhatsApp Pairing & Connection Status Card */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${whatsappStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      {whatsappStatus === 'connected' ? t('whatsappStatusConnected') : t('whatsappStatusDisconnected')}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {whatsappStatus === 'connected'
                        ? 'Servidor vinculado y listo para recibir gastos'
                        : 'Escanea el código QR desde tu app de WhatsApp para vincular'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {whatsappStatus === 'connected' ? (
                    <button
                      type="button"
                      onClick={handleDisconnectWhatsapp}
                      disabled={isDisconnectingWhatsapp}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('whatsappBtnDisconnect')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{t('whatsappBtnLink')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Security Advisory */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-[11px] text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>{t('whatsappDedicatedNotice')}</span>
              </div>
            </div>
          )}

          {/* Telegram Specific Config */}
          {botPlatform === 'telegram' && (
            <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  {t('telegramTokenLabel')}
                </label>
                <input
                  type="password"
                  required
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder={t('telegramTokenPlaceholder')}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  🤖 {t('telegramTokenHelp')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  {t('telegramGroupLabel')}
                </label>
                <input
                  type="text"
                  value={telegramGroupName}
                  onChange={(e) => setTelegramGroupName(e.target.value)}
                  placeholder={t('telegramGroupPlaceholder')}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  👥 {t('telegramGroupHelp')}
                </p>
              </div>
            </div>
          )}

          {/* Syntax Cheat Sheet */}
          {botPlatform !== 'none' && (
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                💬 {t('botInstruction')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold block">42.50 Mercadona</span>
                  <span className="text-zinc-400 text-[10px]">💳 Cuenta Común</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-amber-600 dark:text-amber-400 font-bold block">18.50 Farmacia adelanto</span>
                  <span className="text-zinc-400 text-[10px]">⚡ Adelanto de bolsillo</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-purple-600 dark:text-purple-400 font-bold block">60 Cena 50/50</span>
                  <span className="text-zinc-400 text-[10px]">🔀 Reparto a medias</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold block">/balance • /resumen</span>
                  <span className="text-zinc-400 text-[10px]">📊 Consultar deudas</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingBot}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingBot ? t('saving') : t('saveChanges')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Local Access & Mobile PWA */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <Server className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
            {t('localAccessTitle')}
          </h2>
        </div>

        <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <Smartphone className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <span>{t('installAsApp')}</span>
            </div>
            <p className="leading-relaxed whitespace-pre-line">
              {t('installSteps')}
            </p>
          </div>
        </div>
      </div>

      {/* Version & Updates */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-zinc-700 dark:text-zinc-300 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {t('versionTitle')}
              </h2>
              <p className="text-xs text-zinc-500 font-mono">
                CasaFinance {CURRENT_VERSION}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckUpdate}
            disabled={checkingUpdate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-colors disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>{checkingUpdate ? t('checkingUpdates') : t('checkUpdatesBtn')}</span>
          </button>
        </div>

        {/* Update Status Banner */}
        {updateStatus.checked && (
          <div>
            {updateStatus.hasUpdate ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    🎉 {updateStatus.latestVersion} — {t('newVersionAvailable')}
                  </span>
                  <p className="text-emerald-700/80 dark:text-emerald-400 text-[11px]">
                    {t('runUpdateCommand')}
                  </p>
                </div>
                {updateStatus.releaseUrl && (
                  <a
                    href={updateStatus.releaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors w-fit"
                  >
                    <span>{t('viewChangelog')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : updateStatus.error ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-700 dark:text-amber-400">
                {updateStatus.error}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('upToDate')}</span>
              </div>
            )}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            ⚡ {t('howToUpdate')}
          </p>
          <p className="text-[11px] text-zinc-500">
            {t('howToUpdateSubtitle')}
          </p>
          <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-[11px] select-all flex items-center justify-between">
            <code>./update.sh</code>
            <span className="text-[10px] text-zinc-400">{t('updateScriptTag')}</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 sm:p-6 transition-all space-y-4">
        <div className="flex items-center gap-2 border-b border-red-200/60 dark:border-red-900/40 pb-3">
          <div className="w-4 h-4 text-red-600 dark:text-red-500">⚠️</div>
          <h2 className="text-sm sm:text-base font-bold text-red-700 dark:text-red-400">
            {t('dangerZoneTitle')}
          </h2>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-red-600/90 dark:text-red-400/90 leading-relaxed">
            {t('dangerZoneDescription')}
          </p>
          <button
            onClick={async () => {
              const confirmText = window.prompt(t('dangerZonePrompt'));
              const targetWord = t('dangerZoneWord');
              if (confirmText === targetWord || confirmText === 'BORRAR' || confirmText === 'DELETE') {
                const token = localStorage.getItem('adminToken') || '';
                const res = await fetch('/api/reset', { 
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                  window.location.reload();
                } else {
                  alert(t('dangerZoneError'));
                }
              } else if (confirmText !== null) {
                alert(t('dangerZoneWrongWord'));
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors w-full sm:w-auto"
          >
            {t('dangerZoneBtn')}
          </button>
        </div>
      </div>

      {/* WhatsApp QR Pairing Modal (Portaled to document.body for full-screen backdrop) */}
      {mounted && isQrModalOpen && createPortal(
        <div 
          onClick={() => setIsQrModalOpen(false)}
          className="fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-backdrop-fade"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center relative animate-scale-up"
          >
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-1">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {t('whatsappQrModalTitle')}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed px-2">
                {t('whatsappQrScanInstructions')}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="py-2">
              {whatsappStatus === 'connected' ? (
                <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-scale-up">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {t('whatsappStatusConnected')}
                  </p>
                  <p className="text-xs text-zinc-500">
                    ¡Listo! Ya podéis enviar gastos al grupo de WhatsApp.
                  </p>
                </div>
              ) : whatsappQrDataUrl ? (
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-2xl border border-zinc-200 shadow-inner inline-block mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={whatsappQrDataUrl}
                      alt="WhatsApp Pairing QR Code"
                      className="w-56 h-56 mx-auto rounded-lg"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Esperando escaneo con tu teléfono...</span>
                  </p>
                </div>
              ) : (
                <div className="py-12 space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs text-zinc-500">
                    {t('whatsappStatusWaiting')}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

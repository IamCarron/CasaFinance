'use client';

import React, { useState, useEffect } from 'react';
import { useHousehold, ActiveTab } from '@/context/HouseholdContext';
import DashboardView from '@/components/views/DashboardView';
import ExpensesView from '@/components/views/ExpensesView';
import BudgetView from '@/components/views/BudgetView';
import BalanceView from '@/components/views/BalanceView';
import SettingsView from '@/components/views/SettingsView';
import ExpenseModal from '@/components/ExpenseModal';
import BudgetModal from '@/components/BudgetModal';
import SavingsGoalModal from '@/components/SavingsGoalModal';
import MonthlyIncomeModal from '@/components/MonthlyIncomeModal';
import OnboardingWizard from '@/components/OnboardingWizard';
import Logo from '@/components/Logo';
import {
  LayoutDashboard,
  Receipt,
  Calculator,
  Scale,
  Settings as SettingsIcon,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AppShell() {
  const {
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    t,
    currentMonth,
    settings,
    categories,
    budgetItems,
    expenses,
    monthlyIncome,
    isLoading,
    refreshData,
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    editingExpense,
    setEditingExpense,
    isBudgetModalOpen,
    setIsBudgetModalOpen,
    editingBudgetItem,
    setEditingBudgetItem,
    isGoalModalOpen,
    setIsGoalModalOpen,
    editingGoal,
    isIncomeModalOpen,
    setIsIncomeModalOpen,
  } = useHousehold();

  const [isPrivateMode, setIsPrivateMode] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isPrivateMode) {
        document.body.classList.add('privacy-mode');
      } else {
        document.body.classList.remove('privacy-mode');
      }
    }
  }, [isPrivateMode]);

  // If first time running and not yet configured, show the clean onboarding setup wizard
  if (settings && settings.isOnboarded === false) {
    return <OnboardingWizard />;
  }

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'expenses', label: t('expenses'), icon: Receipt },
    { id: 'budget', label: t('budget'), icon: Calculator },
    { id: 'balance', label: t('balance'), icon: Scale },
    { id: 'settings', label: t('settings'), icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfc] dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900 pb-20 md:pb-8">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#fdfdfc]/90 dark:bg-[#0c0c0e]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer group flex items-center"
          >
            <Logo size="sm" />
          </div>

          {/* Desktop Tactile Segmented Navigation (Instant Switching) */}
          <nav className="hidden md:flex items-center bg-zinc-100/90 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                    isActive
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-bold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons & Switches */}
          <div className="flex items-center gap-2">
            {/* Privacy Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsPrivateMode(!isPrivateMode)}
              title={isPrivateMode ? t('privacyModeOn') : t('privacyModeOff')}
              className={`p-1.5 rounded-lg border transition-all ${
                isPrivateMode
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 shadow-2xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/60 dark:border-zinc-700/60 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {isPrivateMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`px-1.5 py-0.5 rounded-md transition-all ${
                  language === 'es'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('newExpense')}</span>
              <span className="sm:hidden">{t('expenses')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Fluid In-Memory View Switching */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        <ErrorBoundary>
          <div key={activeTab} className="view-transition">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'expenses' && <ExpensesView />}
            {activeTab === 'budget' && <BudgetView />}
            {activeTab === 'balance' && <BalanceView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </ErrorBoundary>
      </main>

      {/* Mobile Bottom Dock Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fdfdfc]/95 dark:bg-[#0c0c0e]/95 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 py-1.5 flex items-center justify-around pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all min-w-[56px] select-none ${
                isActive
                  ? 'text-zinc-900 dark:text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Modals */}
      {isExpenseModalOpen && (
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={refreshData}
          categories={categories}
          settings={
            settings || {
              partner1Name: 'Tú',
              partner2Name: 'Pareja',
              partner1Income: 1800,
              partner2Income: 1200,
              splitMode: 'proportional',
              customRatioPartner1: 50,
              currencySymbol: '€',
              currencyCode: 'EUR',
            }
          }
          editingExpense={editingExpense}
        />
      )}

      {isBudgetModalOpen && (
        <BudgetModal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          onSuccess={refreshData}
          categories={categories}
          settings={
            settings || {
              partner1Name: 'Tú',
              partner2Name: 'Pareja',
              partner1Income: 1800,
              partner2Income: 1200,
              splitMode: 'proportional',
              customRatioPartner1: 50,
              currencySymbol: '€',
              currencyCode: 'EUR',
            }
          }
          editingItem={editingBudgetItem}
        />
      )}

      {isGoalModalOpen && (
        <SavingsGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          goal={editingGoal}
          settings={
            settings || {
              partner1Name: 'Tú',
              partner2Name: 'Pareja',
              partner1Income: 1800,
              partner2Income: 1200,
              splitMode: 'proportional',
              customRatioPartner1: 50,
              currencySymbol: '€',
              currencyCode: 'EUR',
            }
          }
        />
      )}

      {isIncomeModalOpen && (
        <MonthlyIncomeModal
          isOpen={isIncomeModalOpen}
          onClose={() => setIsIncomeModalOpen(false)}
          currentMonth={currentMonth}
          monthlyIncome={monthlyIncome}
          settings={
            settings || {
              partner1Name: 'Tú',
              partner2Name: 'Pareja',
              partner1Income: 1800,
              partner2Income: 1200,
              splitMode: 'proportional',
              customRatioPartner1: 50,
              currencySymbol: '€',
              currencyCode: 'EUR',
            }
          }
        />
      )}
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Settings, Category, FixedBudgetItem, Expense, MonthSummary, SavingsGoal, MonthlyTrendPoint, MonthlyIncomeOverride } from '@/lib/types';
import { Language, TranslationKey, TRANSLATIONS } from '@/lib/i18n';
import { calculateSettlement } from '@/lib/budget-calculator';

export type ActiveTab = 'dashboard' | 'expenses' | 'budget' | 'balance' | 'settings';

interface HouseholdContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;

  // Month
  currentMonth: string; // 'YYYY-MM'
  setCurrentMonth: (month: string) => void;

  // Data
  settings: Settings;
  categories: Category[];
  budgetItems: FixedBudgetItem[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  monthlyTrends: MonthlyTrendPoint[];
  monthlyIncome: MonthlyIncomeOverride | null;
  summary: MonthSummary | null;
  isLoading: boolean;

  // Actions / Mutations
  refreshData: () => Promise<void>;
  saveSettings: (newSettings: Partial<Settings>) => Promise<boolean>;
  saveExpense: (expense: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  saveBudgetItem: (item: Partial<FixedBudgetItem>) => Promise<boolean>;
  deleteBudgetItem: (id: string) => Promise<boolean>;
  toggleBudgetItemActive: (item: FixedBudgetItem) => Promise<boolean>;
  saveCategory: (category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  settleDebt: (amount: number, debtor: 'partner1' | 'partner2', creditor: 'partner1' | 'partner2') => Promise<boolean>;
  saveSavingsGoal: (goal: Partial<SavingsGoal>) => Promise<boolean>;
  adjustSavingsGoalAmount: (id: string, delta: number) => Promise<boolean>;
  deleteSavingsGoal: (id: string) => Promise<boolean>;
  saveMonthlyIncomeOverride: (p1Income: number, p2Income: number, notes?: string) => Promise<boolean>;
  resetMonthlyIncomeOverride: () => Promise<boolean>;

  // Modal State
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  editingExpense: Expense | null;
  setEditingExpense: (expense: Expense | null) => void;
  isBudgetModalOpen: boolean;
  setIsBudgetModalOpen: (open: boolean) => void;
  editingBudgetItem: FixedBudgetItem | null;
  setEditingBudgetItem: (item: FixedBudgetItem | null) => void;
  isGoalModalOpen: boolean;
  setIsGoalModalOpen: (open: boolean) => void;
  editingGoal: SavingsGoal | null;
  setEditingGoal: (goal: SavingsGoal | null) => void;
  isIncomeModalOpen: boolean;
  setIsIncomeModalOpen: (open: boolean) => void;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  partner1Name: 'Tú',
  partner2Name: 'Pareja',
  partner1Income: 1800,
  partner2Income: 1200,
  splitMode: 'proportional',
  customRatioPartner1: 50,
  currencySymbol: '€',
  currencyCode: 'EUR',
};

export function HouseholdProvider({
  children,
  initialTab = 'dashboard',
}: {
  children: React.ReactNode;
  initialTab?: ActiveTab;
}) {
  const [activeTab, setActiveTabState] = useState<ActiveTab>(initialTab);
  const [language, setLanguageState] = useState<Language>('es');

  // Load language from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('casafinance_lang') as Language;
      if (savedLang === 'es' || savedLang === 'en') {
        setLanguageState(savedLang);
      }
    }
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('casafinance_lang', newLang);
    }
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: newLang }),
    }).catch(() => {});
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS['es'];
      return (dict as any)[key] || TRANSLATIONS['es'][key] || key;
    },
    [language]
  );

  const getCurrentMonthStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonthStr);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgetItems, setBudgetItems] = useState<FixedBudgetItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendPoint[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncomeOverride | null>(null);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState<FixedBudgetItem | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  // Sync tab with URL without full page reload
  const setActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const url = tab === 'dashboard' ? '/' : `/${tab === 'expenses' ? 'gastos' : tab === 'budget' ? 'presupuesto' : tab === 'balance' ? 'liquidaciones' : 'ajustes'}`;
      window.history.replaceState({ tab }, '', url);
    }
  }, []);

  // Fetch all initial data once and per month change
  const fetchData = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';
      const fetchOpts: RequestInit = {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          'Authorization': `Bearer ${token}`,
        },
      };
      const ts = Date.now();

      const [settRes, catRes, budRes, expRes, sumRes, goalsRes, trendsRes, incRes] = await Promise.all([
        fetch(`/api/settings?_t=${ts}`, fetchOpts).catch(() => null),
        fetch(`/api/categories?_t=${ts}`, fetchOpts).catch(() => null),
        fetch(`/api/budget?_t=${ts}`, fetchOpts).catch(() => null),
        fetch(`/api/expenses?month=${currentMonth}&_t=${ts}`, fetchOpts).catch(() => null),
        fetch(`/api/summary?month=${currentMonth}&_t=${ts}`, fetchOpts).catch(() => null),
        fetch(`/api/goals?_t=${ts}`, fetchOpts).catch(() => null),
        fetch(`/api/trends?_t=${ts}`, fetchOpts).catch(() => null),
        fetch(`/api/incomes?month=${currentMonth}&_t=${ts}`, fetchOpts).catch(() => null),
      ]);

      if (settRes?.ok) setSettings(await settRes.json());
      if (catRes?.ok) setCategories(await catRes.json());
      if (budRes?.ok) setBudgetItems(await budRes.json());
      if (expRes?.ok) setExpenses(await expRes.json());
      if (sumRes?.ok) setSummary(await sumRes.json());
      if (goalsRes?.ok) setSavingsGoals(await goalsRes.json());
      if (trendsRes?.ok) setMonthlyTrends(await trendsRes.json());
      if (incRes?.ok) setMonthlyIncome(await incRes.json());
    } catch (err) {
      console.error('Error loading household data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mutations
  const saveSettings = async (newSettings: Partial<Settings>): Promise<boolean> => {
    try {
      let token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';
      let res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newSettings),
      });

      if (res.status === 401 && typeof window !== 'undefined') {
        const inputToken = window.prompt(
          language === 'en'
            ? 'Admin authorization required. Enter ADMIN_TOKEN:'
            : 'Autorización administrativa requerida. Introduce el ADMIN_TOKEN del servidor:'
        );
        if (inputToken) {
          token = inputToken.trim();
          localStorage.setItem('adminToken', token);
          res = await fetch('/api/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newSettings),
          });
        }
      }

      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving settings:', err);
      return false;
    }
  };

  const saveExpense = async (expense: Partial<Expense>): Promise<boolean> => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (res.ok) {
        const saved: Expense = await res.json();
        // Instant optimistic update in local state
        setExpenses((prev) => {
          const exists = prev.some((e) => e.id === saved.id);
          if (exists) {
            return prev.map((e) => (e.id === saved.id ? saved : e));
          }
          return [saved, ...prev];
        });
        // Re-sync all summaries & totals
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving expense:', err);
      return false;
    }
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      // Instant optimistic delete from local state
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting expense:', err);
      return false;
    }
  };

  const saveBudgetItem = async (item: Partial<FixedBudgetItem>): Promise<boolean> => {
    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving budget item:', err);
      return false;
    }
  };

  const deleteBudgetItem = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/budget?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting budget item:', err);
      return false;
    }
  };

  const toggleBudgetItemActive = async (item: FixedBudgetItem): Promise<boolean> => {
    return saveBudgetItem({ ...item, isActive: !item.isActive });
  };

  const saveCategory = async (category: Partial<Category>): Promise<boolean> => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving category:', err);
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting category:', err);
      return false;
    }
  };

  const settleDebt = async (
    amount: number,
    debtor: 'partner1' | 'partner2',
    creditor: 'partner1' | 'partner2'
  ): Promise<boolean> => {
    try {
      const debtName = debtor === 'partner1' ? settings?.partner1Name || 'Integrante 1' : settings?.partner2Name || 'Integrante 2';
      const credName = creditor === 'partner1' ? settings?.partner1Name || 'Integrante 1' : settings?.partner2Name || 'Integrante 2';
      
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Compensación de gastos (${debtName} a ${credName})`,
          amount,
          date: new Date().toISOString().split('T')[0],
          categoryId: categories[0]?.id || 'cat-1',
          paidBy: debtor,
          splitBetween: creditor,
          isSettlement: true,
          notes: 'Liquidación registrada mediante botón directo',
        }),
      });

      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error settling debt:', err);
      return false;
    }
  };

  const saveSavingsGoal = async (goal: Partial<SavingsGoal>): Promise<boolean> => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving savings goal:', err);
      return false;
    }
  };

  const adjustSavingsGoalAmount = async (id: string, delta: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, delta }),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adjusting savings goal amount:', err);
      return false;
    }
  };

  const deleteSavingsGoal = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting savings goal:', err);
      return false;
    }
  };

  const saveMonthlyIncomeOverride = async (
    p1Income: number,
    p2Income: number,
    notes?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: currentMonth,
          partner1Income: p1Income,
          partner2Income: p2Income,
          notes,
        }),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving monthly income override:', err);
      return false;
    }
  };

  const resetMonthlyIncomeOverride = async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/incomes?month=${currentMonth}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error resetting monthly income override:', err);
      return false;
    }
  };

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      language,
      setLanguage,
      t,
      currentMonth,
      setCurrentMonth,
      settings,
      categories,
      budgetItems,
      expenses,
      savingsGoals,
      monthlyTrends,
      monthlyIncome,
      summary,
      isLoading,
      refreshData: fetchData,
      saveSettings,
      saveExpense,
      deleteExpense,
      saveBudgetItem,
      deleteBudgetItem,
      toggleBudgetItemActive,
      saveCategory,
      deleteCategory,
      settleDebt,
      saveSavingsGoal,
      adjustSavingsGoalAmount,
      deleteSavingsGoal,
      saveMonthlyIncomeOverride,
      resetMonthlyIncomeOverride,
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
      setEditingGoal,
      isIncomeModalOpen,
      setIsIncomeModalOpen,
    }),
    [
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
      savingsGoals,
      monthlyTrends,
      monthlyIncome,
      summary,
      isLoading,
      fetchData,
      isExpenseModalOpen,
      editingExpense,
      isBudgetModalOpen,
      editingBudgetItem,
      isGoalModalOpen,
      editingGoal,
      isIncomeModalOpen,
    ]
  );

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
}

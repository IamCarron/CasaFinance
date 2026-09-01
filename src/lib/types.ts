export type SplitMode = 'equal' | 'proportional' | 'custom';

export type PaidBy = 'common' | 'partner1' | 'partner2';

export type SplitBetween = 'both' | 'partner1' | 'partner2';

export interface UserSettings {
  partner1Name: string;
  partner2Name: string;
  partner1Income: number;
  partner2Income: number;
  splitMode: SplitMode;
  customRatioPartner1: number; // e.g. 50 for 50/50, 60 for 60/40
  currencySymbol: string;
  currencyCode?: string;
  pinCode?: string;
  isOnboarded?: boolean;
  incomeType?: 'fixed' | 'variable';
  partner1IncomeType?: 'fixed' | 'variable';
  partner2IncomeType?: 'fixed' | 'variable';
  ocrProvider?: 'ollama' | 'openai' | 'custom' | 'none';
  ocrEndpoint?: string;
  ocrApiKey?: string;
  ocrModel?: string;
  botPlatform?: 'none' | 'whatsapp' | 'telegram';
  whatsappGroupName?: string;
  telegramBotToken?: string;
  telegramGroupName?: string;
  language?: 'es' | 'en';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface FixedBudgetItem {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  splitModeOverride?: SplitMode | null;
  notes?: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  paidBy: PaidBy;
  splitBetween: SplitBetween;
  splitModeOverride?: 'default' | 'equal' | null;
  notes?: string;
  receiptUrl?: string;
  isSettlement?: boolean;
  createdAt: string;
}

export interface CategoryBreakdown {
  category: Category;
  budgeted: number;
  spentFromCommon: number;
  spentOutPocket: number;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
}

export interface SettlementDetail {
  partner1PaidForBoth: number;
  partner2PaidForBoth: number;
  partner1PaidForPartner2: number;
  partner2PaidForPartner1: number;
  netBalance: number; // Positive: partner2 owes partner1; Negative: partner1 owes partner2
  debtor: string | null;
  creditor: string | null;
  amountToPay: number;
}

export interface MonthlyIncomeOverride {
  month: string; // YYYY-MM
  partner1Income: number;
  partner2Income: number;
  isCustom: boolean;
  notes?: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalFixedBudget: number;
  partner1FixedContribution: number;
  partner2FixedContribution: number;
  partner1Ratio: number;
  partner2Ratio: number;
  totalSpentCommon: number;
  totalSpentOutOfPocket: number;
  totalSpentMonth: number;
  commonRemaining: number;
  settlement: SettlementDetail;
  categoryBreakdowns: CategoryBreakdown[];
  recentExpenses: Expense[];
  settings: UserSettings;
  effectiveIncomes?: MonthlyIncomeOverride;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  targetDate?: string;
  createdAt: string;
}

export interface MonthlyTrendPoint {
  month: string; // YYYY-MM
  label: string; // e.g. "Ago 2026"
  totalSpent: number;
  totalBudgeted: number;
  outOfPocket: number;
}

export interface BotParsedExpense {
  title: string;
  amount: number;
  categoryId: string;
  paidBy: PaidBy;
  splitBetween: SplitBetween;
  splitModeOverride?: 'default' | 'equal' | null;
  notes?: string;
  confidence: number;
}

export type Settings = UserSettings;
export type MonthSummary = MonthlySummary;

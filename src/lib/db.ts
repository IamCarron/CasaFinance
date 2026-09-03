import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { UserSettings, Category, FixedBudgetItem, Expense, SavingsGoal, MonthlyTrendPoint, MonthlyIncomeOverride } from './types';

// Ensure data directory exists
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'casafinance.db');

// Singleton database instance
let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Fixed Budget items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fixed_budget (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      split_mode_override TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // Expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      category_id TEXT NOT NULL,
      paid_by TEXT NOT NULL,
      split_between TEXT NOT NULL,
      split_mode_override TEXT,
      notes TEXT,
      receipt_url TEXT,
      is_settlement INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  `);

  // Savings goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      target_date TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Monthly income overrides table (for bonuses / variable salaries per month)
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_incomes (
      month TEXT PRIMARY KEY,
      partner1_income REAL NOT NULL,
      partner2_income REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Migration for existing DBs
  try {
    db.exec(`ALTER TABLE expenses ADD COLUMN split_mode_override TEXT;`);
  } catch (err) {
    // Column likely already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE expenses ADD COLUMN receipt_url TEXT;`);
  } catch (err) {
    // Column likely already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE expenses ADD COLUMN is_settlement INTEGER DEFAULT 0;`);
  } catch (err) {
    // Column likely already exists, ignore
  }

  // Seed default data if empty
  seedInitialData(db);
}

export function seedInitialData(db: DatabaseSync) {
  // Check settings
  const hasSettings = db.prepare('SELECT count(*) as count FROM settings').get() as { count: number | bigint };
  if (Number(hasSettings.count) === 0) {
    const defaultSettings: UserSettings = {
      partner1Name: 'Tú',
      partner2Name: 'Pareja',
      partner1Income: 1800,
      partner2Income: 1200,
      splitMode: 'proportional',
      customRatioPartner1: 50,
      currencySymbol: '€',
      currencyCode: 'EUR',
      isOnboarded: false,
      incomeType: 'fixed',
      partner1IncomeType: 'fixed',
      partner2IncomeType: 'fixed',
      ocrProvider: 'ollama',
      ocrEndpoint: 'http://localhost:11434/api/generate',
      ocrModel: 'llama3.2-vision',
      botPlatform: 'whatsapp',
      whatsappGroupName: 'Gastos Casa',
      telegramBotToken: '',
      telegramGroupName: 'Gastos Casa',
      language: 'es',
    };

    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(defaultSettings)) {
      insertSetting.run(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
  }

  // Check and seed default categories (ensuring existing databases get missing categories)
  const defaultCategories = [
    { id: 'cat-1', name: 'Alquiler / Hipoteca', icon: 'Home', color: '#10b981', is_default: 1 },
    { id: 'cat-2', name: 'Supermercado & Alimentación', icon: 'ShoppingCart', color: '#3b82f6', is_default: 1 },
    { id: 'cat-3', name: 'Facturas (Luz, Agua, Gas, WiFi)', icon: 'Zap', color: '#f59e0b', is_default: 1 },
    { id: 'cat-4', name: 'Suscripciones (Netflix, Spotify...)', icon: 'Tv', color: '#8b5cf6', is_default: 1 },
    { id: 'cat-5', name: 'Transporte & Gasolina', icon: 'Car', color: '#ec4899', is_default: 1 },
    { id: 'cat-6', name: 'Ocio & Cenas Fuera', icon: 'Utensils', color: '#f97316', is_default: 1 },
    { id: 'cat-7', name: 'Fondo de Ahorro e Imprevistos', icon: 'PiggyBank', color: '#06b6d4', is_default: 1 },
    { id: 'cat-salud', name: 'Farmacia & Salud', icon: 'Pill', color: '#14b8a6', is_default: 1 },
    { id: 'cat-mascotas', name: 'Mascotas & Veterinario', icon: 'Dog', color: '#84cc16', is_default: 1 },
    { id: 'cat-hogar', name: 'Hogar & Bricolaje', icon: 'Wrench', color: '#6366f1', is_default: 1 },
    { id: 'cat-ropa', name: 'Ropa & Calzado', icon: 'Shirt', color: '#a855f7', is_default: 1 },
    { id: 'cat-personal', name: 'Cuidado Personal & Peluquería', icon: 'Scissors', color: '#f43f5e', is_default: 1 },
    { id: 'cat-viajes', name: 'Viajes & Vacaciones', icon: 'Plane', color: '#0284c7', is_default: 1 },
    { id: 'cat-educacion', name: 'Niños & Educación', icon: 'Baby', color: '#eab308', is_default: 1 },
    { id: 'cat-deporte', name: 'Deportes & Gimnasio', icon: 'Dumbbell', color: '#059669', is_default: 1 },
    { id: 'cat-seguros', name: 'Seguros & Impuestos', icon: 'Shield', color: '#475569', is_default: 1 },
    { id: 'cat-8', name: 'Otros Gastos', icon: 'Receipt', color: '#64748b', is_default: 1 },
  ];

  const checkCat = db.prepare('SELECT id FROM categories WHERE id = ? OR LOWER(name) = ?');
  const insertCat = db.prepare('INSERT INTO categories (id, name, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  const now = new Date().toISOString();
  for (const c of defaultCategories) {
    const existing = checkCat.get(c.id, c.name.toLowerCase());
    if (!existing) {
      insertCat.run(c.id, c.name, c.icon, c.color, c.is_default, now);
    }
  }
}

export function resetDatabase() {
  const db = getDb();
  db.exec('BEGIN TRANSACTION');
  try {
    // 1. Delete dependent tables first to respect foreign keys
    db.exec('DELETE FROM expenses');
    db.exec('DELETE FROM fixed_budget');
    db.exec('DELETE FROM savings_goals');
    db.exec('DELETE FROM monthly_incomes');
    
    // 2. Clear categories and settings
    db.exec('DELETE FROM categories');
    db.exec('DELETE FROM settings');

    try {
      db.exec('DELETE FROM sqlite_sequence');
    } catch (e) {}

    // 3. Re-seed default settings & all 17 standard household categories
    seedInitialData(db);
    
    db.exec('COMMIT');
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (e) {}
    throw err;
  }
}

// ----------------- CRUD Operations -----------------

export function getSettings(): UserSettings {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
  const map = new Map<string, string>();
  for (const r of rows) {
    map.set(r.key, r.value);
  }

  return {
    partner1Name: map.get('partner1Name') || 'Tú',
    partner2Name: map.get('partner2Name') || 'Pareja',
    partner1Income: parseFloat(map.get('partner1Income') || '1800'),
    partner2Income: parseFloat(map.get('partner2Income') || '1200'),
    splitMode: (map.get('splitMode') as any) || 'proportional',
    customRatioPartner1: parseFloat(map.get('customRatioPartner1') || '50'),
    currencySymbol: map.get('currencySymbol') || '€',
    currencyCode: map.get('currencyCode') || 'EUR',
    pinCode: map.get('pinCode') || '',
    isOnboarded: map.get('isOnboarded') === 'true' || map.get('isOnboarded') === '1',
    incomeType: (map.get('incomeType') as any) || 'fixed',
    partner1IncomeType: (map.get('partner1IncomeType') as any) || (map.get('incomeType') as any) || 'fixed',
    partner2IncomeType: (map.get('partner2IncomeType') as any) || (map.get('incomeType') as any) || 'fixed',
    ocrProvider: (map.get('ocrProvider') as any) || 'ollama',
    ocrEndpoint: map.get('ocrEndpoint') || 'http://localhost:11434/api/generate',
    ocrApiKey: map.get('ocrApiKey') || '',
    ocrModel: map.get('ocrModel') || 'llama3.2-vision',
    botPlatform: (map.get('botPlatform') as any) || 'whatsapp',
    whatsappGroupName: map.get('whatsappGroupName') || 'Gastos Casa',
    telegramBotToken: map.get('telegramBotToken') || '',
    telegramGroupName: map.get('telegramGroupName') || 'Gastos Casa',
    language: (map.get('language') as any) || 'es',
  };
}

export function updateSettings(settings: Partial<UserSettings>): UserSettings {
  const db = getDb();
  const update = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  db.exec('BEGIN TRANSACTION;');
  try {
    for (const [k, v] of Object.entries(settings)) {
      if (v !== undefined) {
        update.run(k, String(v));
      }
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
  return getSettings();
}

export function getCategories(): Category[] {
  const db = getDb();
  const rows = db.prepare('SELECT id, name, icon, color, is_default FROM categories ORDER BY is_default DESC, name ASC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    isDefault: Boolean(r.is_default),
  }));
}

export function saveCategory(cat: { id?: string; name: string; icon: string; color: string }): Category {
  const db = getDb();
  const id = cat.id || `cat-${Date.now()}`;
  db.prepare(`
    INSERT INTO categories (id, name, icon, color, is_default, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      icon = excluded.icon,
      color = excluded.color
  `).run(id, cat.name, cat.icon, cat.color, new Date().toISOString());

  return { id, name: cat.name, icon: cat.icon, color: cat.color, isDefault: false };
}

export function deleteCategory(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return Number(info.changes) > 0;
}

export function getFixedBudgetItems(): FixedBudgetItem[] {
  const db = getDb();
  const rows = db.prepare('SELECT id, category_id, name, amount, split_mode_override, notes, is_active FROM fixed_budget ORDER BY amount DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    categoryId: r.category_id,
    name: r.name,
    amount: Number(r.amount),
    splitModeOverride: r.split_mode_override,
    notes: r.notes,
    isActive: Boolean(r.is_active),
  }));
}

export function saveFixedBudgetItem(item: {
  id?: string;
  categoryId: string;
  name: string;
  amount: number;
  splitModeOverride?: string | null;
  notes?: string;
  isActive?: boolean;
}): FixedBudgetItem {
  const db = getDb();
  const id = item.id || `b-${Date.now()}`;
  const isActive = item.isActive !== undefined ? (item.isActive ? 1 : 0) : 1;

  db.prepare(`
    INSERT INTO fixed_budget (id, category_id, name, amount, split_mode_override, notes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      category_id = excluded.category_id,
      name = excluded.name,
      amount = excluded.amount,
      split_mode_override = excluded.split_mode_override,
      notes = excluded.notes,
      is_active = excluded.is_active
  `).run(id, item.categoryId, item.name, item.amount, item.splitModeOverride || null, item.notes || '', isActive);

  return {
    id,
    categoryId: item.categoryId,
    name: item.name,
    amount: item.amount,
    splitModeOverride: (item.splitModeOverride as any) || null,
    notes: item.notes,
    isActive: Boolean(isActive),
  };
}

export function deleteFixedBudgetItem(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM fixed_budget WHERE id = ?').run(id);
  return Number(info.changes) > 0;
}

export function getExpenses(month?: string): Expense[] {
  const db = getDb();
  let query = 'SELECT id, title, amount, date, category_id, paid_by, split_between, split_mode_override, notes, receipt_url, is_settlement, created_at FROM expenses';
  const params: any[] = [];

  if (month) {
    query += ' WHERE date LIKE ?';
    params.push(`${month}%`);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r) => {
    const isSettlement = Boolean(r.is_settlement) || 
      (typeof r.title === 'string' && (
        r.title.startsWith('Compensación de gastos') || 
        r.title.startsWith('Liquidación') || 
        r.title.startsWith('Settlement')
      ));

    return {
      id: r.id,
      title: r.title,
      amount: Number(r.amount),
      date: r.date,
      categoryId: r.category_id,
      paidBy: r.paid_by,
      splitBetween: r.split_between,
      splitModeOverride: r.split_mode_override,
      notes: r.notes,
      receiptUrl: r.receipt_url || undefined,
      isSettlement,
      createdAt: r.created_at,
    };
  });
}

export function saveExpense(exp: {
  id?: string;
  title: string;
  amount: number;
  date: string;
  categoryId: string;
  paidBy: string;
  splitBetween: string;
  splitModeOverride?: string | null;
  notes?: string;
  receiptUrl?: string;
  isSettlement?: boolean;
}): Expense {
  const db = getDb();
  const id = exp.id || `exp-${Date.now()}`;
  const now = new Date().toISOString();
  const isSettlement = exp.isSettlement ? 1 : 0;

  // Validate category_id against existing categories to guarantee foreign key integrity
  let validCategoryId = exp.categoryId;
  const catCheck = db.prepare('SELECT id FROM categories WHERE id = ?').get(validCategoryId) as { id: string } | undefined;
  if (!catCheck) {
    // Fallback to the first available category
    const firstCat = db.prepare('SELECT id FROM categories ORDER BY is_default DESC, id ASC LIMIT 1').get() as { id: string } | undefined;
    if (firstCat) {
      validCategoryId = firstCat.id;
    } else {
      // If categories table is completely empty, insert a fallback category first
      db.prepare('INSERT INTO categories (id, name, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run('cat-general', 'General', 'Receipt', '#64748b', 1, now);
      validCategoryId = 'cat-general';
    }
  }

  db.prepare(`
    INSERT INTO expenses (id, title, amount, date, category_id, paid_by, split_between, split_mode_override, notes, receipt_url, is_settlement, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      amount = excluded.amount,
      date = excluded.date,
      category_id = excluded.category_id,
      paid_by = excluded.paid_by,
      split_between = excluded.split_between,
      split_mode_override = excluded.split_mode_override,
      notes = excluded.notes,
      receipt_url = excluded.receipt_url,
      is_settlement = excluded.is_settlement
  `).run(id, exp.title, exp.amount, exp.date, validCategoryId, exp.paidBy, exp.splitBetween, exp.splitModeOverride || null, exp.notes || '', exp.receiptUrl || null, isSettlement, now);

  return {
    id,
    title: exp.title,
    amount: exp.amount,
    date: exp.date,
    categoryId: validCategoryId,
    paidBy: exp.paidBy as any,
    splitBetween: exp.splitBetween as any,
    splitModeOverride: exp.splitModeOverride as any,
    notes: exp.notes,
    receiptUrl: exp.receiptUrl,
    isSettlement: Boolean(exp.isSettlement),
    createdAt: now,
  };
}

export function deleteExpense(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return Number(info.changes) > 0;
}

export function exportAllData() {
  const settings = getSettings();
  const categories = getCategories();
  const budget = getFixedBudgetItems();
  const expenses = getExpenses();
  const savingsGoals = getSavingsGoals();
  const monthlyIncomes = getAllMonthlyIncomes();

  return {
    version: '1.1',
    exportedAt: new Date().toISOString(),
    settings,
    categories,
    budget,
    expenses,
    savingsGoals,
    monthlyIncomes,
  };
}

export function importAllData(data: any): boolean {
  const db = getDb();
  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. Settings inline
    if (data.settings) {
      const update = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      for (const [k, v] of Object.entries(data.settings)) {
        if (v !== undefined) {
          update.run(k, String(v));
        }
      }
    }

    // 2. Categories
    if (Array.isArray(data.categories)) {
      // First delete dependents that reference these categories
      db.prepare('DELETE FROM expenses').run();
      db.prepare('DELETE FROM fixed_budget').run();
      db.prepare('DELETE FROM categories').run();
      const insertCat = db.prepare('INSERT INTO categories (id, name, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)');
      for (const c of data.categories) {
        insertCat.run(c.id, c.name, c.icon, c.color, c.isDefault || c.is_default ? 1 : 0, new Date().toISOString());
      }
    }

    // 3. Fixed Budget
    if (Array.isArray(data.budget)) {
      db.prepare('DELETE FROM fixed_budget').run();
      const insertB = db.prepare(`
        INSERT INTO fixed_budget (id, category_id, name, amount, split_mode_override, notes, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const b of data.budget) {
        const id = b.id || `b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        insertB.run(
          id, 
          b.categoryId || b.category_id, 
          b.name, 
          b.amount, 
          b.splitModeOverride || b.split_mode_override || null, 
          b.notes || '', 
          b.isActive !== false && b.is_active !== 0 ? 1 : 0
        );
      }
    }

    // 4. Expenses (with receipt_url and is_settlement preserved)
    if (Array.isArray(data.expenses)) {
      db.prepare('DELETE FROM expenses').run();
      const insertE = db.prepare(`
        INSERT INTO expenses (id, title, amount, date, category_id, paid_by, split_between, split_mode_override, notes, receipt_url, is_settlement, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const e of data.expenses) {
        const id = e.id || `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const isSettlement = Boolean(e.isSettlement || e.is_settlement) ||
          (typeof e.title === 'string' && (
            e.title.startsWith('Compensación de gastos') || 
            e.title.startsWith('Liquidación') || 
            e.title.startsWith('Settlement')
          ));

        insertE.run(
          id, 
          e.title, 
          e.amount, 
          e.date, 
          e.categoryId || e.category_id, 
          e.paidBy || e.paid_by, 
          e.splitBetween || e.split_between, 
          e.splitModeOverride || e.split_mode_override || null, 
          e.notes || '', 
          e.receiptUrl || e.receipt_url || null, 
          isSettlement ? 1 : 0, 
          e.createdAt || e.created_at || new Date().toISOString()
        );
      }
    }

    // 5. Savings Goals
    const savingsGoalsList = data.savingsGoals || data.savings_goals;
    if (Array.isArray(savingsGoalsList)) {
      db.prepare('DELETE FROM savings_goals').run();
      const insertSG = db.prepare(`
        INSERT INTO savings_goals (id, name, target_amount, current_amount, icon, color, target_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const sg of savingsGoalsList) {
        const id = sg.id || `sg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        insertSG.run(
          id,
          sg.name,
          sg.targetAmount ?? sg.target_amount ?? 0,
          sg.currentAmount ?? sg.current_amount ?? 0,
          sg.icon || 'PiggyBank',
          sg.color || '#10b981',
          sg.targetDate || sg.target_date || null,
          sg.createdAt || sg.created_at || new Date().toISOString()
        );
      }
    }

    // 6. Monthly Incomes (Overrides & Bonuses)
    const monthlyIncomesList = data.monthlyIncomes || data.monthly_incomes;
    if (Array.isArray(monthlyIncomesList)) {
      db.prepare('DELETE FROM monthly_incomes').run();
      const insertMI = db.prepare(`
        INSERT INTO monthly_incomes (month, partner1_income, partner2_income, notes, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const mi of monthlyIncomesList) {
        insertMI.run(
          mi.month,
          mi.partner1Income ?? mi.partner1_income ?? 0,
          mi.partner2Income ?? mi.partner2_income ?? 0,
          mi.notes || null,
          mi.createdAt || mi.created_at || new Date().toISOString()
        );
      }
    }

    db.exec('COMMIT;');
    return true;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

// ----------------- Savings Goals -----------------

export function getSavingsGoals(): SavingsGoal[] {
  const db = getDb();
  const rows = db.prepare('SELECT id, name, target_amount, current_amount, icon, color, target_date, created_at FROM savings_goals ORDER BY created_at ASC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    targetAmount: Number(r.target_amount),
    currentAmount: Number(r.current_amount),
    icon: r.icon,
    color: r.color,
    targetDate: r.target_date || undefined,
    createdAt: r.created_at,
  }));
}

export function saveSavingsGoal(goal: {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount?: number;
  icon: string;
  color: string;
  targetDate?: string;
}): SavingsGoal {
  const db = getDb();
  const id = goal.id || `goal-${Date.now()}`;
  const now = new Date().toISOString();
  const currentAmount = goal.currentAmount !== undefined ? goal.currentAmount : 0;

  db.prepare(`
    INSERT INTO savings_goals (id, name, target_amount, current_amount, icon, color, target_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      target_amount = excluded.target_amount,
      current_amount = excluded.current_amount,
      icon = excluded.icon,
      color = excluded.color,
      target_date = excluded.target_date
  `).run(id, goal.name, goal.targetAmount, currentAmount, goal.icon, goal.color, goal.targetDate || null, now);

  return {
    id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount,
    icon: goal.icon,
    color: goal.color,
    targetDate: goal.targetDate,
    createdAt: now,
  };
}

export function adjustGoalAmount(id: string, delta: number): SavingsGoal | null {
  const db = getDb();
  db.prepare(`
    UPDATE savings_goals 
    SET current_amount = MAX(0, current_amount + ?)
    WHERE id = ?
  `).run(delta, id);

  const row = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(id) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    icon: row.icon,
    color: row.color,
    targetDate: row.target_date || undefined,
    createdAt: row.created_at,
  };
}

export function deleteSavingsGoal(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM savings_goals WHERE id = ?').run(id);
  return Number(info.changes) > 0;
}

// ----------------- Monthly Trends -----------------

export function getMonthlyTrends(monthsCount = 6): MonthlyTrendPoint[] {
  const db = getDb();
  const results: MonthlyTrendPoint[] = [];
  const now = new Date();

  // Get active fixed budget sum
  const budgetSumRow = db.prepare('SELECT SUM(amount) as total FROM fixed_budget WHERE is_active = 1').get() as { total: number | null };
  const totalBudgeted = Number(budgetSumRow?.total) || 0;

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const monthKey = `${yyyy}-${mm}`;

    const monthNamesEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const label = `${monthNamesEs[d.getMonth()]} ${String(yyyy).slice(2)}`;

    // Total spent in this month (excluding internal settlement transfers)
    const totalRow = db.prepare(`
      SELECT 
        COALESCE(SUM(amount), 0) as totalSpent,
        COALESCE(SUM(CASE WHEN paid_by != 'common' THEN amount ELSE 0 END), 0) as outOfPocket
      FROM expenses
      WHERE date LIKE ?
        AND (is_settlement IS NULL OR is_settlement = 0)
        AND title NOT LIKE 'Compensación de gastos%'
        AND title NOT LIKE 'Liquidación%'
        AND title NOT LIKE 'Settlement%'
    `).get(`${monthKey}%`) as { totalSpent: number; outOfPocket: number };

    results.push({
      month: monthKey,
      label,
      totalSpent: Number(totalRow.totalSpent) || 0,
      totalBudgeted,
      outOfPocket: Number(totalRow.outOfPocket) || 0,
    });
  }

  return results;
}

// ----------------- Monthly Incomes (Bonuses & Variable Incomes) -----------------

export function getMonthlyIncome(month: string): MonthlyIncomeOverride {
  const db = getDb();
  const row = db.prepare('SELECT month, partner1_income, partner2_income, notes FROM monthly_incomes WHERE month = ?').get(month) as any;
  if (row) {
    return {
      month: row.month,
      partner1Income: Number(row.partner1_income),
      partner2Income: Number(row.partner2_income),
      isCustom: true,
      notes: row.notes || undefined,
    };
  }
  const settings = getSettings();
  return {
    month,
    partner1Income: settings.partner1Income,
    partner2Income: settings.partner2Income,
    isCustom: false,
  };
}

export function saveMonthlyIncome(
  month: string,
  partner1Income: number,
  partner2Income: number,
  notes?: string
): MonthlyIncomeOverride {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO monthly_incomes (month, partner1_income, partner2_income, notes, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(month) DO UPDATE SET
      partner1_income = excluded.partner1_income,
      partner2_income = excluded.partner2_income,
      notes = excluded.notes,
      created_at = excluded.created_at
  `).run(month, partner1Income, partner2Income, notes || null, now);

  return getMonthlyIncome(month);
}

export function deleteMonthlyIncome(month: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM monthly_incomes WHERE month = ?').run(month);
  return true;
}

export function getAllMonthlyIncomes(): Array<{ month: string; partner1Income: number; partner2Income: number; notes?: string }> {
  const db = getDb();
  const rows = db.prepare('SELECT month, partner1_income, partner2_income, notes FROM monthly_incomes ORDER BY month ASC').all() as any[];
  return rows.map(r => ({
    month: r.month,
    partner1Income: Number(r.partner1_income),
    partner2Income: Number(r.partner2_income),
    notes: r.notes || undefined,
  }));
}


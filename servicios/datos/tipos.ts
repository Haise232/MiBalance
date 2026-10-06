// ─── Tipos (interfaz en inglés, BD en español) ────────────────────────────────

export type TransactionType = 'income' | 'expense' | 'debt';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}

export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalAssets: number;        // suma de saldos de cuentas (base manual)
  currentBalance: number;     // totalAssets + netBalance (lo que ves en el hero)
  subscriptionCost: number;
}

export interface Account {
  id: number;
  name: string;
  type: 'cash' | 'bank' | 'card';
  balance: number;
  color: string;
}

export interface Debt {
  id: number;
  direction: 'owe' | 'owed_to_me';
  who: string;
  what: string;
  total: number;
  paid: number;
  due_date: string | null;
  created_at: string;
}

export interface DebtSummary {
  totalOwe: number;
  totalOwedToMe: number;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  glyph: string;
  budget: number;
  sort_order: number;
}


export interface Subscription {
  id: number;
  name: string;
  amount: number;
  billing_cycle: 'monthly' | 'annual' | 'weekly';
  next_due_date: string | null;
  icon: string;
  is_active: number;
  created_at: string;
}

export interface MonthlyFlow {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryExpense {
  category: string;
  total: number;
  glyph?: string;
}

// ─── Importación desde la app antigua ─────────────────────────────────────────

export interface OldCategory { id: number; nombre: string; tipo: 'ingreso' | 'gasto'; icono: string; }
export interface OldRecord   { id: number; tipo: 'ingreso' | 'gasto'; fecha: string; monto: number; descripcion: string; categoria_id: number; created_at: string; }
export interface OldAppData  { version: string; export_date: string; data: { categorias: OldCategory[]; registros: OldRecord[] } }

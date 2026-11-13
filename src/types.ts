export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category_id: string | null;
  description: string;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category?: Category | null;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  color: string;
  icon: string;
  deadline: string | null;
  created_at: string;
}

export interface SavingsContribution {
  id: string;
  goal_id: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export type ViewKey = 'dashboard' | 'transactions' | 'budgets' | 'goals';

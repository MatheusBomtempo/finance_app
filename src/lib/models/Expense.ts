export interface Expense {
  id: number;
  user_id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseRequest {
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface UpdateExpenseRequest {
  description?: string;
  amount?: number;
  category?: string;
  date?: string;
}

export const ExpenseCategories = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Utilidades',
  'Saúde',
  'Educação',
  'Entretenimento',
  'Compras',
  'Outros'
] as const;

export type ExpenseCategory = typeof ExpenseCategories[number];
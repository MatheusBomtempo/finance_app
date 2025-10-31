export interface Investment {
  id: number;
  user_id: number;
  name: string;
  type: string;
  amount: number;
  current_value: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentRequest {
  name: string;
  type: string;
  amount: number;
  current_value: number;
  purchase_date: string;
}

export interface UpdateInvestmentRequest {
  name?: string;
  type?: string;
  amount?: number;
  current_value?: number;
  purchase_date?: string;
}

export const InvestmentTypes = [
  'Renda Fixa',
  'Ações',
  'Fundos',
  'Criptomoedas',
  'Imóveis',
  'Commodities',
  'Outros'
] as const;

export type InvestmentType = typeof InvestmentTypes[number];
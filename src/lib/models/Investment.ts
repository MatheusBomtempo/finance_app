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
  api_id?: string;
  yield_rate?: number;
  is_automated?: boolean;
  quantity?: number;
}

export interface CreateInvestmentRequest {
  name: string;
  type: string;
  amount: number;
  current_value: number;
  purchase_date: string;
  api_id?: string;
  yield_rate?: number;
  is_automated?: boolean;
  quantity?: number;
}

export interface UpdateInvestmentRequest {
  name?: string;
  type?: string;
  amount?: number;
  current_value?: number;
  purchase_date?: string;
  api_id?: string;
  yield_rate?: number;
  is_automated?: boolean;
  quantity?: number;
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
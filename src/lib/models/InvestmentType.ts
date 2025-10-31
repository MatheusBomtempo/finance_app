export interface InvestmentType {
  id: number;
  name: string;
  description?: string;
  expected_return_percent: number;
  risk_level: 'Baixo' | 'Médio' | 'Alto';
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentTypeData {
  name: string;
  description?: string;
  expected_return_percent: number;
  risk_level: 'Baixo' | 'Médio' | 'Alto';
}

export interface UpdateInvestmentTypeData {
  name?: string;
  description?: string;
  expected_return_percent?: number;
  risk_level?: 'Baixo' | 'Médio' | 'Alto';
}

export const RISK_LEVELS = [
  { value: 'Baixo', label: 'Baixo Risco', color: 'green' },
  { value: 'Médio', label: 'Médio Risco', color: 'yellow' },
  { value: 'Alto', label: 'Alto Risco', color: 'red' }
] as const;

export const INVESTMENT_TYPE_VALIDATION = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 255
  },
  description: {
    maxLength: 1000
  },
  expected_return_percent: {
    required: true,
    min: 0,
    max: 100
  },
  risk_level: {
    required: true,
    options: ['Baixo', 'Médio', 'Alto']
  }
} as const;
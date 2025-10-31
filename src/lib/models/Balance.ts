export interface Balance {
  id: number;
  user_id: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBalanceRequest {
  amount: number;
}

export interface UpdateBalanceRequest {
  amount: number;
}
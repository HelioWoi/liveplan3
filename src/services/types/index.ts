export interface WeeklyBudgetEntry {
  id: string;
  user_id: string;
  month: string;
  week: number;
  year: number;
  category: string;
  description: string;
  amount: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  weekly_budget_id: string;
  user_id: string;
  title: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  created_at: string;
}

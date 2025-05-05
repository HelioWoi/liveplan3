import { create } from 'zustand';

export interface WeeklyBudgetEntry {
  id: string;
  week: 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4';
  description: string;
  amount: number;
  category: string;
}

interface WeeklyBudgetState {
  entries: WeeklyBudgetEntry[];
}

export const useWeeklyBudgetStore = create<WeeklyBudgetState>(() => ({
  entries: [
    { id: '1', week: 'Week 1', description: 'Salary', amount: 5000, category: 'Income' },
    { id: '2', week: 'Week 1', description: 'Rent', amount: -1500, category: 'Fixed' },
    { id: '3', week: 'Week 2', description: 'Freelance', amount: 2000, category: 'Extra' },
    { id: '4', week: 'Week 2', description: 'Groceries', amount: -400, category: 'Variable' },
    { id: '5', week: 'Week 3', description: 'Investment', amount: -1000, category: 'Investment' },
    { id: '6', week: 'Week 3', description: 'Utilities', amount: -300, category: 'Fixed' },
    { id: '7', week: 'Week 4', description: 'Bonus', amount: 1500, category: 'Income' },
    { id: '8', week: 'Week 4', description: 'Shopping', amount: -800, category: 'Variable' },
  ],
}));
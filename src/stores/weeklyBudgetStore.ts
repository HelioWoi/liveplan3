import { create } from 'zustand';

export interface WeeklyBudgetEntry {
  id: string;
  week: 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4';
  description: string;
  amount: number;
  category: string;
  month: string;
  year: number;
}

interface WeeklyBudgetState {
  entries: WeeklyBudgetEntry[];
  addEntry: (entry: WeeklyBudgetEntry) => void;
  currentYear: number;
  setCurrentYear: (year: number) => void;
}

const currentYear = 2025;

export const useWeeklyBudgetStore = create<WeeklyBudgetState>((set) => ({
  currentYear,
  setCurrentYear: (year: number) => set({ currentYear: year }),
  entries: [
    // Week 1
    { id: '1', week: 'Week 1', description: 'Salary', amount: 5000, category: 'Income', month: 'April', year: currentYear },
    { id: '2', week: 'Week 1', description: 'Stocks', amount: -1000, category: 'Investment', month: 'April', year: currentYear },
    { id: '3', week: 'Week 1', description: 'Rent', amount: -1500, category: 'Fixed', month: 'April', year: currentYear },
    { id: '4', week: 'Week 1', description: 'Groceries', amount: -400, category: 'Variable', month: 'April', year: currentYear },
    { id: '5', week: 'Week 1', description: 'Freelance', amount: 800, category: 'Extra', month: 'April', year: currentYear },
    { id: '6', week: 'Week 1', description: 'Gift', amount: 200, category: 'Additional', month: 'April', year: currentYear },

    // Week 2
    { id: '7', week: 'Week 2', description: 'Salary', amount: 5000, category: 'Income', month: 'April', year: currentYear },
    { id: '8', week: 'Week 2', description: 'Bonds', amount: -800, category: 'Investment', month: 'April', year: currentYear },
    { id: '9', week: 'Week 2', description: 'Utilities', amount: -300, category: 'Fixed', month: 'April', year: currentYear },
    { id: '10', week: 'Week 2', description: 'Shopping', amount: -600, category: 'Variable', month: 'April', year: currentYear },
    { id: '11', week: 'Week 2', description: 'Consulting', amount: 1000, category: 'Extra', month: 'April', year: currentYear },
    { id: '12', week: 'Week 2', description: 'Refund', amount: 150, category: 'Additional', month: 'April', year: currentYear },

    // Week 3
    { id: '13', week: 'Week 3', description: 'Salary', amount: 5000, category: 'Income', month: 'April', year: currentYear },
    { id: '14', week: 'Week 3', description: 'ETF', amount: -1200, category: 'Investment', month: 'April', year: currentYear },
    { id: '15', week: 'Week 3', description: 'Insurance', amount: -400, category: 'Fixed', month: 'April', year: currentYear },
    { id: '16', week: 'Week 3', description: 'Dining', amount: -500, category: 'Variable', month: 'April', year: currentYear },
    { id: '17', week: 'Week 3', description: 'Project', amount: 1200, category: 'Extra', month: 'April', year: currentYear },
    { id: '18', week: 'Week 3', description: 'Cashback', amount: 100, category: 'Additional', month: 'April', year: currentYear },

    // Week 4
    { id: '19', week: 'Week 4', description: 'Salary', amount: 5000, category: 'Income', month: 'April', year: currentYear },
    { id: '20', week: 'Week 4', description: 'Crypto', amount: -600, category: 'Investment', month: 'April', year: currentYear },
    { id: '21', week: 'Week 4', description: 'Phone', amount: -200, category: 'Fixed', month: 'April', year: currentYear },
    { id: '22', week: 'Week 4', description: 'Travel', amount: -800, category: 'Variable', month: 'April', year: currentYear },
    { id: '23', week: 'Week 4', description: 'Bonus', amount: 1500, category: 'Extra', month: 'April', year: currentYear },
    { id: '24', week: 'Week 4', description: 'Rewards', amount: 180, category: 'Additional', month: 'April', year: currentYear },
  ],
  addEntry: (entry: WeeklyBudgetEntry) =>
    set((state) => ({
      entries: [...state.entries, entry],
    })),
}));
import { create } from 'zustand';
import { weekToDate } from '../utils/dateUtils';
import { TransactionCategory } from '../types/transaction';

export interface WeeklyBudgetEntry {
  id: string;
  week: 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4';
  description: string;
  amount: number;
  category: TransactionCategory;
  month: string;
  year: number;
}

interface WeeklyBudgetState {
  entries: WeeklyBudgetEntry[];
  addEntry: (entry: WeeklyBudgetEntry) => void;
  createTransactionFromEntry: (entry: WeeklyBudgetEntry) => Promise<boolean>;
  updateEntry: (id: string, entry: Partial<WeeklyBudgetEntry>) => void;
  deleteEntry: (id: string) => void;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  syncWithTransactions: () => void;
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
  addEntry: (entry: WeeklyBudgetEntry) => {
    // Add to weekly budget entries only - no automatic sync to transactions
    // This avoids foreign key constraint errors when there's no valid user
    set((state) => ({
      entries: [...state.entries, entry],
    }));
  },
  
  // Versão local que não depende do banco de dados
  createTransactionFromEntry: async (entry: WeeklyBudgetEntry) => {
    // Simula a criação de uma transação sem usar o banco de dados
    // Isso evita erros de chave estrangeira
    console.log('Simulando criação de transação a partir da entrada de orçamento:', entry);
    
    // Converte a semana para uma data real
    const entryDate = weekToDate(entry.week, entry.month, entry.year);
    
    // Adiciona a entrada ao localStorage para simular persistência
    try {
      // Recupera transações existentes do localStorage
      const storedTransactions = localStorage.getItem('local_transactions');
      const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      
      // Cria uma nova transação local
      const newTransaction = {
        id: Date.now().toString(),
        date: entryDate.toISOString(),
        amount: entry.amount,
        category: entry.category,
        type: entry.amount > 0 ? 'income' : 'expense',
        description: entry.description,
        origin: 'Weekly Budget',
        user_id: 'local-user'
      };
      
      // Adiciona à lista e salva de volta no localStorage
      transactions.push(newTransaction);
      localStorage.setItem('local_transactions', JSON.stringify(transactions));
      
      // Dispara um evento para notificar outras partes do app
      window.dispatchEvent(new CustomEvent('local-transaction-added', { detail: newTransaction }));
      
      return true;
    } catch (error) {
      console.error('Erro ao criar transação local:', error);
      return false;
    }
  },
  
  updateEntry: (id: string, updatedEntry: Partial<WeeklyBudgetEntry>) => {
    set((state) => {
      const entryIndex = state.entries.findIndex(entry => entry.id === id);
      if (entryIndex === -1) return state;
      
      const updatedEntries = [...state.entries];
      updatedEntries[entryIndex] = { ...updatedEntries[entryIndex], ...updatedEntry };
      
      return { entries: updatedEntries };
    });
  },
  
  deleteEntry: (id: string) => {
    set((state) => ({
      entries: state.entries.filter(entry => entry.id !== id)
    }));
  },
  
  syncWithTransactions: () => {
    // Versão local que não depende do banco de dados
    // Sincroniza entradas do orçamento semanal com transações locais
    console.log('Sincronizando entradas do orçamento semanal com transações locais');
    
    const state = useWeeklyBudgetStore.getState();
    
    // Recupera transações existentes do localStorage
    const storedTransactions = localStorage.getItem('local_transactions');
    const localTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    
    // Encontra entradas do orçamento que não têm transações correspondentes
    state.entries.forEach(entry => {
      const entryDate = weekToDate(entry.week, entry.month, entry.year);
      const entryDateStr = entryDate.toISOString().split('T')[0]; // Apenas a parte da data
      
      // Verifica se existe uma transação correspondente
      const matchingTransaction = localTransactions.find((t: any) => 
        t.description === entry.description && 
        t.amount === entry.amount && 
        t.date.includes(entryDateStr) &&
        t.origin === 'Weekly Budget'
      );
      
      // Se não existir uma transação correspondente, cria uma
      if (!matchingTransaction) {
        try {
          const newTransaction = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            date: entryDate.toISOString(),
            amount: entry.amount,
            category: entry.category,
            type: entry.amount > 0 ? 'income' : 'expense',
            description: entry.description,
            origin: 'Weekly Budget',
            user_id: 'local-user'
          };
          
          localTransactions.push(newTransaction);
          localStorage.setItem('local_transactions', JSON.stringify(localTransactions));
          
          console.log('Transação local criada a partir de entrada do orçamento:', newTransaction);
        } catch (error) {
          console.error('Erro ao sincronizar entrada do orçamento com transação local:', error);
        }
      }
    });
    
    // Dispara um evento para notificar outras partes do app
    window.dispatchEvent(new CustomEvent('local-transactions-updated'));
  },
}));
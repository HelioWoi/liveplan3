import { create } from 'zustand';
import { formatISO } from 'date-fns';
import { Transaction, TaxType, isIncomeCategory } from '../types/transaction';

interface TaxEntry {
  id: string;
  date: string;
  amount: number;
  type: TaxType;
  notes?: string;
  userId: string;
}

interface TransactionState {
  transactions: Transaction[];
  taxEntries: TaxEntry[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addTaxEntry: (entry: Omit<TaxEntry, 'id'>) => Promise<void>;
  updateTaxEntry: (id: string, entry: Partial<TaxEntry>) => Promise<void>;
  deleteTaxEntry: (id: string) => Promise<void>;
  fetchTaxEntries: () => Promise<void>;
  clearTransactions: () => Promise<void>;
  bulkAddTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  taxEntries: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ transactions: [], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch transactions', isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
      };
      
      set(state => ({
        transactions: [...state.transactions, newTransaction],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add transaction', isLoading: false });
    }
  },

  updateTransaction: async (id, transaction) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...transaction } : t
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update transaction', isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete transaction', isLoading: false });
    }
  },

  fetchTaxEntries: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ taxEntries: [], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch tax entries', isLoading: false });
    }
  },

  addTaxEntry: async (entry) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEntry = {
        ...entry,
        id: Date.now().toString(),
      };
      
      set(state => ({
        taxEntries: [...state.taxEntries, newEntry],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add tax entry', isLoading: false });
    }
  },

  updateTaxEntry: async (id, entry) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        taxEntries: state.taxEntries.map(e => 
          e.id === id ? { ...e, ...entry } : e
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update tax entry', isLoading: false });
    }
  },

  deleteTaxEntry: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        taxEntries: state.taxEntries.filter(e => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete tax entry', isLoading: false });
    }
  },

  // New methods for handling spreadsheet data
  clearTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      set(state => ({
        transactions: [],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to clear transactions', isLoading: false });
    }
  },

  bulkAddTransactions: async (transactions) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call with minimal delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newTransactions = transactions.map(transaction => ({
        ...transaction,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      }));
      
      set(state => ({
        transactions: newTransactions,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add transactions', isLoading: false });
    }
  },
}));
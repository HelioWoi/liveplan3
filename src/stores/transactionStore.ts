import { create } from 'zustand';
import { Transaction, TaxType } from '../types/transaction';
import { supabase } from '../lib/supabase/supabaseClient';

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
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      set({ transactions: data || [], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      set({ error: error.message || 'Failed to fetch transactions', isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        set(state => ({
          transactions: [data, ...state.transactions],
          isLoading: false
        }));
        
        // Disparar evento para notificar outras partes do app (Weekly Budget e Homepage)
        if (transaction.category === 'Income' || transaction.type === 'income') {
          // Adicionar a transação ao localStorage para garantir sincronização com Weekly Budget
          try {
            const storedTransactions = localStorage.getItem('local_transactions');
            const localTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
            
            // Adicionar a nova transação ao array local
            localTransactions.push({
              ...data,
              origin: 'Income Page'
            });
            
            // Salvar de volta no localStorage
            localStorage.setItem('local_transactions', JSON.stringify(localTransactions));
            
            // Disparar evento para notificar a homepage e o Weekly Budget
            window.dispatchEvent(new CustomEvent('local-transaction-added', { detail: data }));
            window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
          } catch (error) {
            console.error('Erro ao sincronizar transação com localStorage:', error);
          }
        }
      }
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      set({ error: error.message || 'Failed to add transaction', isLoading: false });
      throw error;
    }
  },

  updateTransaction: async (id, transaction) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', id);

      if (error) throw error;
      
      set(state => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...transaction } : t
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      set({ error: error.message || 'Failed to update transaction', isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      set({ error: error.message || 'Failed to delete transaction', isLoading: false });
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
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      set({
        transactions: [],
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error clearing transactions:', error);
      set({ error: error.message || 'Failed to clear transactions', isLoading: false });
    }
  },

  bulkAddTransactions: async (transactions) => {
    set({ isLoading: true, error: null });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Adicionar todas as transações ao Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert(
          transactions.map(transaction => ({
            ...transaction,
            user_id: user.id
          }))
        )
        .select();

      if (error) throw error;

      set({
        transactions: data || [],
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error adding transactions:', error);
      set({ error: error.message || 'Failed to add transactions', isLoading: false });
      throw error;
    }
  },
}));

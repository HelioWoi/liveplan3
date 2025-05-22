import { create } from 'zustand';
import { Transaction, TaxType } from '../types/transaction';
import { supabase } from '../lib/supabase/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';

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
      // Tentar buscar transações do banco de dados
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (user) {
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;

          // Combinar com transações locais
          const storedTransactions = localStorage.getItem('local_transactions');
          const localTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
          
          const allTransactions = [...(data || []), ...localTransactions];
          
          set({ transactions: allTransactions, isLoading: false });
          return;
        }
      } catch (dbError) {
        console.error('Error fetching transactions from database:', dbError);
        // Continue para buscar transações locais mesmo se houver erro no banco
      }
      
      // Se não conseguiu buscar do banco ou o usuário não está autenticado,
      // buscar apenas do localStorage
      const storedTransactions = localStorage.getItem('local_transactions');
      const localTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      
      set({ transactions: localTransactions, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      set({ error: error.message || 'Failed to fetch transactions', isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    
    try {
      let data;
      
      // Tentar obter a sessão do usuário
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (user) {
          // Se o usuário estiver autenticado, salvar no banco de dados
          // Remover o campo metadata para evitar erro, já que essa coluna não existe no banco
          const { metadata, ...transactionWithoutMetadata } = transaction;
          
          const { data: dbData, error } = await supabase
            .from('transactions')
            .insert([{ ...transactionWithoutMetadata, user_id: user.id }])
            .select()
            .single();

          if (error) {
            console.error('Error saving transaction to database:', error);
            // Continue mesmo com erro no banco, salvando localmente
          } else {
            data = dbData;
          }
        }
      } catch (authError) {
        console.error('Authentication error:', authError);
        // Continue para salvar localmente
      }
      
      // Se não conseguiu salvar no banco ou o usuário não está autenticado,
      // criar um objeto de transação local
      if (!data) {
        data = {
          id: Date.now().toString(),
          ...transaction,
          user_id: 'local-user'
        };
      }
      
      // Atualizar o estado com a nova transação
      set(state => ({
        transactions: [data, ...state.transactions],
        isLoading: false
      }));
      
      // Disparar evento para notificar outras partes do app (Weekly Budget e Homepage)
      if (transaction.category === 'Income' || transaction.type === 'income') {
        // Apenas disparar eventos para notificar a homepage e o Weekly Budget
        // Não precisa adicionar ao localStorage novamente, pois já está no estado
        try {
          // Disparar evento para notificar a homepage e o Weekly Budget
          window.dispatchEvent(new CustomEvent('local-transaction-added', { detail: data }));
          window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
          console.log('Eventos disparados para sincronização de income:', data);
        } catch (error) {
          console.error('Erro ao sincronizar transação com eventos:', error);
        }
      }
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      set({ error: error.message || 'Failed to add transaction', isLoading: false });
    }
  },

  updateTransaction: async (id, transaction) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        transactions: state.transactions.map(t => (t.id === id ? { ...t, ...data } : t)),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      set({ error: error.message || 'Failed to update transaction', isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
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
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        isLoading: false
      }));
      
      // Disparar evento para notificar outras partes do app
      window.dispatchEvent(new CustomEvent('transaction-deleted', { detail: { id } }));
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      set({ error: error.message || 'Failed to delete transaction', isLoading: false });
    }
  },

  fetchTaxEntries: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tax_entries')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      set({ taxEntries: data || [], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching tax entries:', error);
      set({ error: error.message || 'Failed to fetch tax entries', isLoading: false });
    }
  },

  addTaxEntry: async (entry) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tax_entries')
        .insert([{ ...entry, userId: user.id }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        taxEntries: [data, ...state.taxEntries],
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error adding tax entry:', error);
      set({ error: error.message || 'Failed to add tax entry', isLoading: false });
    }
  },

  updateTaxEntry: async (id, entry) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tax_entries')
        .update(entry)
        .eq('id', id)
        .eq('userId', user.id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        taxEntries: state.taxEntries.map(e => (e.id === id ? { ...e, ...data } : e)),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error updating tax entry:', error);
      set({ error: error.message || 'Failed to update tax entry', isLoading: false });
    }
  },

  deleteTaxEntry: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('tax_entries')
        .delete()
        .eq('id', id)
        .eq('userId', user.id);

      if (error) throw error;

      set(state => ({
        taxEntries: state.taxEntries.filter(e => e.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error deleting tax entry:', error);
      set({ error: error.message || 'Failed to delete tax entry', isLoading: false });
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

      set({ transactions: [], isLoading: false });
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

      const transactionsWithUserId = transactions.map(transaction => ({
        ...transaction,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionsWithUserId)
        .select();

      if (error) throw error;

      set(state => ({
        transactions: [...data, ...state.transactions],
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error bulk adding transactions:', error);
      set({ error: error.message || 'Failed to bulk add transactions', isLoading: false });
    }
  }
}));

import { create } from 'zustand';
import { Transaction, TaxType } from '../types/transaction';
import { supabase } from '../lib/supabase/supabaseClient';

// Define transaction with metadata for flexibility
type TransactionWithMetadata = Omit<Transaction, 'id'> & {
  id?: string;
  metadata?: Record<string, any>;
  is_local?: boolean;
};

interface TaxEntry {
  id: string;
  date: string;
  amount: number;
  type: TaxType;
  notes?: string;
  user_id: string;
}

interface TransactionState {
  transactions: Transaction[];
  taxEntries: TaxEntry[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: TransactionWithMetadata) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  updateLocalTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTaxEntries: () => Promise<void>;
  addTaxEntry: (entry: Omit<TaxEntry, 'id'>) => Promise<void>;
  updateTaxEntry: (id: string, entry: Partial<TaxEntry>) => Promise<void>;
  deleteTaxEntry: (id: string) => Promise<void>;
  clearTransactions: () => Promise<void>;
  bulkAddTransactions: (transactions: TransactionWithMetadata[]) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => {
  // Add listener for reset-all-stores event
  window.addEventListener('reset-all-stores', () => {
    console.log('Transaction Store: Resetting state due to reset-all-stores event');
    set({ transactions: [], taxEntries: [], isLoading: false, error: null });
    // Clear local transactions from localStorage
    localStorage.removeItem('local_transactions');
  });

  return {
    transactions: [],
    taxEntries: [],
    isLoading: false,
    error: null,

    fetchTransactions: async () => {
      set({ isLoading: true, error: null });

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (user) {
          // Buscar transações do banco de dados
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;

          // Buscar transações locais do localStorage
          const storedTransactions = localStorage.getItem('local_transactions');
          const localTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];

          // Combinar transações do banco e locais
          set({
            transactions: [...(data || []), ...localTransactions],
            isLoading: false,
          });

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
    },

    addTransaction: async (transaction: TransactionWithMetadata) => {
      set({ isLoading: true, error: null });

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (user) {
          // Se o usuário estiver autenticado, salvar no banco de dados
          // Remover o campo metadata para evitar erro, já que essa coluna não existe no banco
          const { metadata, ...transactionWithoutMetadata } = transaction;

          const { data, error } = await supabase
            .from('transactions')
            .insert([{ ...transactionWithoutMetadata, user_id: user.id }])
            .select()
            .single();

          if (error) {
            console.error('Error saving transaction to database:', error);
            // Continue mesmo com erro no banco, salvando localmente
          } else {
            set(state => ({
              transactions: [data, ...state.transactions],
              isLoading: false,
            }));

            // Dispatch event
            window.dispatchEvent(new Event('transactions-updated'));

            // Dispatch transaction-added event
            const transactionEvent = new CustomEvent('transaction-added', {
              detail: data,
            });
            window.dispatchEvent(transactionEvent);

            // Dispatch local transaction added event
            const localTransactionEvent = new CustomEvent('local-transaction-added', {
              detail: data,
            });
            window.dispatchEvent(localTransactionEvent);

            // Log for income transactions
            if (data.category === 'Income' || data.type === 'income') {
              console.log('Transaction Store: Added income transaction', data);
            }

            return;
          }
        }

        // Se não conseguiu salvar no banco ou o usuário não está autenticado,
        // criar um objeto de transação local
        const localTransaction = {
          id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          ...transaction,
          user_id: 'local-user',
          created_at: new Date().toISOString(),
          is_local: true,
        };

        // Atualizar o estado com a nova transação
        set(state => ({
          transactions: [localTransaction, ...state.transactions],
          isLoading: false,
        }));

        // Dispatch event
        window.dispatchEvent(new Event('transactions-updated'));

        // Dispatch transaction-added event
        const transactionEvent = new CustomEvent('transaction-added', {
          detail: localTransaction,
        });
        window.dispatchEvent(transactionEvent);

        // Dispatch local transaction added event
        const localTransactionEvent = new CustomEvent('local-transaction-added', {
          detail: localTransaction,
        });
        window.dispatchEvent(localTransactionEvent);

        // Log for income transactions
        if (localTransaction.category === 'Income' || localTransaction.type === 'income') {
          console.log('Transaction Store: Added income transaction (local)', localTransaction);
        }
        
        set({ transactions: localTransactions, isLoading: false });
      } catch (error) {
        console.error('Error fetching transactions:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to fetch transactions', isLoading: false });
      }
    },
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
        
        // No need for duplicate metadata check
        
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
      } catch (error) {
        console.error('Error adding transaction:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to add transaction', isLoading: false });
      }
    },

    updateTransaction: async (id: string, transaction: Partial<Transaction>) => {
      set({ isLoading: true, error: null });
      
      try {
        // Verificar se é uma transação local (ID começa com 'tx-')
        if (id.startsWith('tx-')) {
          // Atualizar transação local
          set(state => {
            const updatedTransactions = state.transactions.map(t => 
              t.id === id ? { ...t, ...transaction } : t
            );
            
            // Atualizar no localStorage se existir
            try {
              const storedTransactions = localStorage.getItem('local_transactions');
              if (storedTransactions) {
                const localTransactions = JSON.parse(storedTransactions);
                const updatedLocalTransactions = localTransactions.map((t: any) => 
                  t.id === id ? { ...t, ...transaction } : t
                );
                localStorage.setItem('local_transactions', JSON.stringify(updatedLocalTransactions));
              }
            } catch (e) {
              console.error('Erro ao atualizar transação local no localStorage:', e);
            }
            
            return { isLoading: false, transactions: updatedTransactions, error: null };
          });
          
          return;
        }
        
        // Para transações normais do banco de dados
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
      } catch (error) {
        console.error('Error updating transaction:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update transaction', isLoading: false });
      }
    },

    deleteTransaction: async (id: string) => {
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
      } catch (error) {
        console.error('Error deleting transaction:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to delete transaction', isLoading: false });
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
      } catch (error) {
        console.error('Error fetching tax entries:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to fetch tax entries', isLoading: false });
      }
    },

    addTaxEntry: async (entry: Omit<TaxEntry, 'id'>) => {
      set({ isLoading: true, error: null });

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
          .from('tax_entries')
          .insert({
            ...entry,
            user_id: user.id
          })
          .select();

        if (error) throw error;

        set(state => ({
          taxEntries: [...state.taxEntries, ...(data || [])],
          isLoading: false
        }));
      } catch (error) {
        console.error('Error adding tax entry:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to add tax entry', isLoading: false });
      }
    },

    updateTaxEntry: async (id: string, entry: Partial<TaxEntry>) => {
      set({ isLoading: true, error: null });

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
          .from('tax_entries')
          .update({
            ...entry,
            user_id: user.id
          })
          .eq('id', id)
          .select();

        if (error) throw error;

        set(state => ({
          taxEntries: state.taxEntries.map(t => (t.id === id ? (data && data[0]) || t : t)),
          isLoading: false
        }));
      } catch (error) {
        console.error('Error updating tax entry:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update tax entry', isLoading: false });
      }
    },

    deleteTaxEntry: async (id: string) => {
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
          .eq('user_id', user.id);

        if (error) throw error;

        set(state => ({
          taxEntries: state.taxEntries.filter(t => t.id !== id),
          isLoading: false
        }));
      } catch (error) {
        console.error('Error deleting tax entry:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to delete tax entry', isLoading: false });
      }
    },

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
      } catch (error) {
        console.error('Error clearing transactions:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to clear transactions', isLoading: false });
      }
    },

    bulkAddTransactions: async (transactions: TransactionWithMetadata[]) => {
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

        // Add new transactions to state
        set(state => ({
          transactions: [...(data || []), ...state.transactions],
          isLoading: false
        }));

        // Dispatch event for income transactions
        transactionsWithUserId.forEach(transaction => {
          if (transaction.category === 'Income' || transaction.type === 'income') {
            const event = new CustomEvent('transaction-added', {
              detail: transaction
            });
            window.dispatchEvent(event);
            console.log('Transaction Store: Dispatched transaction-added event for income transaction');
          }
        });

        // Dispatch general transactions-updated event
        window.dispatchEvent(new Event('transactions-updated'));
      } catch (error) {
        console.error('Error bulk adding transactions:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to bulk add transactions', isLoading: false });
      }
    },

    updateLocalTransaction: async (id: string, transaction: Partial<Transaction>) => {
      set({ isLoading: true, error: null });

      try {
        // Get local transactions from localStorage
        const localTransactions = JSON.parse(localStorage.getItem('local_transactions') || '[]');

        // Find and update the transaction
        const updatedLocalTransactions = localTransactions.map((t: any) => {
          if (t.id === id) {
            return { ...t, ...transaction };
          }
          return t;
        });

        // Update localStorage
        localStorage.setItem('local_transactions', JSON.stringify(updatedLocalTransactions));

        // Update state
        set(state => ({
          transactions: state.transactions.map(t => (t.id === id ? { ...t, ...transaction } : t)),
          isLoading: false
        }));

        // Dispatch event
        window.dispatchEvent(new Event('transactions-updated'));
      } catch (error) {
        console.error('Error updating local transaction:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update local transaction', isLoading: false });
      }
    }
  };
});

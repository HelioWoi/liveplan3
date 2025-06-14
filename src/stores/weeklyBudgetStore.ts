import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

import { weekToDate } from '../utils/dateUtils';
import { TransactionCategory, TransactionType } from '../types/transaction';
import { useTransactionStore } from './transactionStore';
import { supabase } from '../lib/supabase';

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
  createTransactionFromEntry: (entry: WeeklyBudgetEntry, uuid: any) => Promise<boolean>;
  updateEntry: (id: string, entry: Partial<WeeklyBudgetEntry>) => void;
  deleteEntry: (id: string) => void;
  moveEntryToWeek: (entryId: string, targetWeek: string) => void;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  syncWithTransactions: () => void;
  clearAllEntries: () => void;
  fetchEntries: (userId: string) => Promise<void>;
}

const currentYear = 2025;

// Função para inicializar os listeners de eventos
const initializeEventListeners = (store: WeeklyBudgetState) => {
  // Listener para quando um income é adicionado a uma semana específica
  window.addEventListener('income-added-to-week', ((event: CustomEvent) => {
    const { transaction, week, month, year } = event.detail;
    console.log('Weekly Budget: Detected income-added-to-week event', event.detail);
    
    // Verificar se já existe uma entrada com o mesmo ID de transação
    const entries = store.entries;
    const existingEntry = entries.find(entry => 
      (entry.description === (transaction.description || transaction.origin) && 
       entry.amount === transaction.amount && 
       entry.week === week && 
       entry.month === month && 
       entry.year === year)
    );
    
    if (!existingEntry) {
      // Criar uma nova entrada no Weekly Budget para a semana específica
      const newEntry: WeeklyBudgetEntry = {
        id: `wb-${Date.now()}`, // Usar timestamp para garantir ID único
        week: week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
        description: transaction.description || transaction.origin,
        amount: transaction.amount,
        category: 'Income',
        month: month,
        year: typeof year === 'string' ? parseInt(year) : year
      };
      
      // Adicionar a entrada ao Weekly Budget
      store.addEntry(newEntry);
      console.log('Weekly Budget: Added new entry from income transaction', newEntry);
    } else {
      console.log('Weekly Budget: Entry already exists, skipping', existingEntry);
    }
  }) as EventListener);
  
  // Listener para transações adicionadas localmente
  window.addEventListener('local-transaction-added', ((event: CustomEvent) => {
    const transaction = event.detail;
    console.log('Weekly Budget: Detected local-transaction-added event', transaction);
    
    // Verificar se é uma transação de income
    if (transaction.category === 'Income' || transaction.type === 'income') {
      // Determinar a semana atual (1-4) com base no dia do mês
      const transactionDate = new Date(transaction.date);
      const dayOfMonth = transactionDate.getDate();
      const month = transactionDate.toLocaleString('default', { month: 'long' });
      const year = transactionDate.getFullYear();
      
      let week = 'Week 1';
      if (dayOfMonth > 21) {
        week = 'Week 4';
      } else if (dayOfMonth > 14) {
        week = 'Week 3';
      } else if (dayOfMonth > 7) {
        week = 'Week 2';
      }
      
      // Verificar se já existe uma entrada com a mesma descrição e valor
      const entries = store.entries;
      const existingEntry = entries.find(entry => 
        (entry.description === (transaction.description || transaction.origin) && 
         entry.amount === transaction.amount && 
         entry.week === week && 
         entry.month === month && 
         entry.year === year)
      );
      
      if (!existingEntry) {
        // Criar uma nova entrada no Weekly Budget para a semana específica
        const newEntry: WeeklyBudgetEntry = {
          id: `wb-${Date.now()}`, // Usar timestamp para garantir ID único
          week: week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
          description: transaction.description || transaction.origin,
          amount: transaction.amount,
          category: 'Income',
          month: month,
          year: year
        };
        
        // Adicionar a entrada ao Weekly Budget
        store.addEntry(newEntry);
        console.log('Weekly Budget: Added new entry from local transaction', newEntry);
      }
    }
  }) as EventListener);
};

function saveEntriesToStorage(entries: WeeklyBudgetEntry[]) {
  try {
    localStorage.setItem('weekly_budget_entries', JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving weekly budget entries:', e);
  }
}

async function fetchWeeklyBudgetEntries(userId: string) {
  const { data, error } = await supabase
    .from('weekly_budget_entries')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function addWeeklyBudgetEntry(entry: any) {
  const uuid = uuidv4();
  const { data, error } = await supabase
    .from('weekly_budget_entries')
    .insert([
      { ...entry,
        id: uuid,
        user_id: entry.id,
        week: entry.week.replace(/[^\d.-]+/g, '')
      }
    ])
    .single();

  if (error) throw error;

  window.dispatchEvent(new Event('transactions-updated'));

  return {
    data,
    uuid // Retorna o ID gerado
  };
}

export async function updateWeeklyBudgetEntry(id: string, updates: any) {
  const { data, error } = await supabase
    .from('weekly_budget_entries')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) throw error;

  window.dispatchEvent(new Event('transactions-updated'));
  return data;
}

export async function deleteWeeklyBudgetEntry(id: string) {
  const { error } = await supabase
    .from('weekly_budget_entries')
    .delete()
    .eq('id', id);
  if (error) throw error;

  window.dispatchEvent(new Event('transactions-updated'));
}

export const useWeeklyBudgetStore = create<WeeklyBudgetState>((set, get) => {
  // Inicializar listeners após a criação do store
  setTimeout(() => {
    initializeEventListeners(get());
  }, 100);
  
  return {
    currentYear,
    setCurrentYear: (year: number) => set({ currentYear: year }),
    entries: [],
    
    addEntry: async (entry: WeeklyBudgetEntry) => {
      let uuid = null;
      // Verificar se já existe uma entrada com o mesmo valor e descrição na mesma semana
      const state = useWeeklyBudgetStore.getState();
      const existingEntry = state.entries.find(e => 
        e.description === entry.description && 
        e.amount === entry.amount && 
        e.week === entry.week && 
        e.month === entry.month && 
        e.year === entry.year
      );
      
      // Se já existir uma entrada idêntica, não adicionar novamente
      if (existingEntry) {
        console.log('Entrada já existe no Weekly Budget, ignorando duplicação:', existingEntry);
        return;
      }

      // Salva no supabase (ou ignora erro)
      try {
        entry.week = entry.week.replace(/[^\d.-]+/g, '') as any; // Remove caracteres não numéricos

        const result = await addWeeklyBudgetEntry(entry);

        uuid = result.uuid; // Obtém o ID gerado pelo Supabase
      } catch (e) {
        console.error('Erro ao adicionar entrada no Supabase:', e);
      }
      
      // Add to weekly budget entries only - no automatic sync to transactions
      // This avoids foreign key constraint errors when there's no valid user
      set((state) => {
        entry.week = `Week ${entry.week}` as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4';
        const newEntries = [...state.entries, entry];
        saveEntriesToStorage(newEntries); // <-- salva sempre que altera

        return { entries: newEntries };
      });
      
      // Após adicionar uma entrada, cria automaticamente uma transação correspondente
      // mas apenas se não for uma entrada de sincronização (para evitar loop)
      if (!entry.id.startsWith('wb-')) {
        const state = useWeeklyBudgetStore.getState();
        state.createTransactionFromEntry(entry, uuid)
          .then(success => {
            if (success) {
              console.log('Transação criada automaticamente a partir da nova entrada do orçamento');
              // Atualiza o transactionStore
            }
          })
          .catch(error => {
            console.error('Erro ao criar transação a partir da entrada do orçamento:', error);
          });
      }
    },
    
    // Cria uma transação a partir de uma entrada do Weekly Budget
    createTransactionFromEntry: async (entry: WeeklyBudgetEntry, uuid: any): Promise<boolean> => {
      try {
        // Obter o store de transações
        const transactionStore = useTransactionStore.getState();
        
        // Converter a semana para uma data aproximada
        const weekDate = weekToDate(entry.week, entry.month, entry.year);

        console.log('Criando transação a partir da entrada do Weekly Budget:', entry.week, entry.month, entry.year);
        
        // Criar uma nova transação
        const newTransaction = {
          origin: entry.description,
          description: entry.description,
          amount: entry.amount,
          category: entry.category,
          type: entry.category === 'Income' ? 'income' as TransactionType : 'expense' as TransactionType,
          date: weekDate.toISOString(),
          user_id: 'local-user',
          weekly_budget_entry_id: uuid,
          metadata: {
            sourceEntryId: entry.id,
            sourceWeek: entry.week,
            sourceMonth: entry.month,
            sourceYear: entry.year
          }
        };
        
        // Se for uma entrada da categoria Fixed, criar duas contas futuras adicionais
        if (entry.category === 'Fixed') {
          // Criar primeira conta futura (próximo mês)
          const nextMonthDate = new Date(weekDate);
          nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
          
          const nextMonthTransaction = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 10)}-next1`,
            origin: entry.description,
            description: entry.description,
            amount: entry.amount,
            category: 'Fixed' as TransactionCategory,
            type: 'expense' as TransactionType,
            date: nextMonthDate.toISOString(),
            user_id: 'local-user',
            metadata: {
              isFutureBill: true,
              sourceEntryId: entry.id
            }
          };
          
          // Criar segunda conta futura (dois meses depois)
          const nextTwoMonthDate = new Date(weekDate);
          nextTwoMonthDate.setMonth(nextTwoMonthDate.getMonth() + 2);
          
          const nextTwoMonthTransaction = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 10)}-next2`,
            origin: entry.description,
            description: entry.description,
            amount: entry.amount,
            category: 'Fixed' as TransactionCategory,
            type: 'expense' as TransactionType,
            date: nextTwoMonthDate.toISOString(),
            user_id: 'local-user',
            metadata: {
              isFutureBill: true,
              sourceEntryId: entry.id
            }
          };
          
          // Adicionar as contas futuras usando o transactionStore
          try {
            // Adicionar as transações futuras ao store
            await transactionStore.addTransaction({
              ...nextMonthTransaction,
              user_id: 'local-user'
            });
            
            await transactionStore.addTransaction({
              ...nextTwoMonthTransaction,
              user_id: 'local-user'
            });
            
            // Disparar evento para atualizar a UI
            window.dispatchEvent(new CustomEvent('transactions-updated'));
          } catch (error) {
            console.error('Erro ao salvar contas futuras:', error);
          }
        }
        
        // Adicionar a transação usando o transactionStore
        await transactionStore.addTransaction(newTransaction);
        
        // Disparar eventos para atualizar a UI
        window.dispatchEvent(new CustomEvent('transactions-updated'));
        window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
        
        // Definir flag de atualização para garantir que a Home seja atualizada
        localStorage.setItem('data_refresh_all', 'true');
        localStorage.setItem('data_refresh_transactions', 'true');
        
        return true;
      } catch (error) {
        console.error('Erro ao criar transação a partir da entrada:', error);
        return false;
      }
    },
    
    updateEntry: async (id: string, updatedEntry: Partial<WeeklyBudgetEntry>) => {
      try {
        // Atualizar a entrada no Supabase
        await updateWeeklyBudgetEntry(id, updatedEntry);
      } catch (error) {
        console.error('Erro ao atualizar entrada no Supabase:', error);
        return;
      }
      
      set((state) => {
        const newEntries = state.entries.map(entry =>
          entry.id === id ? { ...entry, ...updatedEntry } : entry
        );
        saveEntriesToStorage(newEntries); // Salva após atualizar
        return { entries: newEntries };
      });
      
      // Atualizar também a transação associada no localStorage
      try {
        const storedTransactions = localStorage.getItem('local_transactions');
        if (storedTransactions) {
          const transactions = JSON.parse(storedTransactions);
          const updatedTransactions = transactions.map((t: any) => {
            if (t.metadata && t.metadata.sourceEntryId === id) {
              return { 
                ...t, 
                description: updatedEntry.description || t.description,
                amount: updatedEntry.amount || t.amount,
                metadata: { 
                  ...t.metadata, 
                  sourceWeek: updatedEntry.week || t.metadata.sourceWeek
                }
              };
            }
            return t;
          });
          localStorage.setItem('local_transactions', JSON.stringify(updatedTransactions));
        }
      } catch (error) {
        console.error('Erro ao atualizar transação associada:', error);
      }
    },

    fetchEntries: async (userId: string) => {
      const data = await fetchWeeklyBudgetEntries(userId);

      const entry = data.map(entry => ({
        ...entry,
        week: `Week ${entry.week}`
      }));
      
      saveEntriesToStorage([...entry]);

      set({ entries: [...entry] });
    },
    
    deleteEntry: async (id: string) => {
      // Obter a entrada antes de excluí-la para poder excluir a transação associada
      // const entryToDelete = get().entries.find(entry => entry.id === id);

      try {
        await deleteWeeklyBudgetEntry(id);

        await supabase
          .from('transactions')
          .delete()
          .eq('weekly_budget_entry_id', id);
      } catch (error) {
        console.error('Erro ao excluir entrada no Supabase:', error);
        return;
      }
      
      // Excluir a entrada do Weekly Budget
      set((state) => {
        const newEntries = state.entries.filter(entry => entry.id !== id);
        saveEntriesToStorage(newEntries); // Salva após deletar
        return { entries: newEntries };
      });
      
      // Se a entrada foi encontrada, excluir também a transação associada
      /*
      if (entryToDelete) {
        try {
          const storedTransactions = localStorage.getItem('local_transactions');
          if (storedTransactions) {
            const transactions = JSON.parse(storedTransactions);
            
            // Filtrar as transações para remover a associada à entrada excluída
            const filteredTransactions = transactions.filter((t: any) => 
              !(t.metadata && t.metadata.sourceEntryId === id)
            );
            
            // Salva de volta no localStorage
            localStorage.setItem('local_transactions', JSON.stringify(filteredTransactions));
            
            // Dispara eventos para notificar outras partes do app
            window.dispatchEvent(new CustomEvent('weekly-budget-entry-deleted', { detail: { entryId: id } }));
            window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
          }
        } catch (error) {
          console.error('Erro ao excluir transação associada:', error);
        }
      }
      */
    },
    
    moveEntryToWeek: (entryId: string, targetWeek: string) => {
      set((state) => {
        const newEntries = state.entries.map((entry) =>
          entry.id === entryId
            ? { ...entry, week: targetWeek as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4' }
            : entry
        );
        saveEntriesToStorage(newEntries); // Salva após mover
        return { entries: newEntries };
      });
      
      // Atualiza também a transação associada no localStorage
      try {
        const storedTransactions = localStorage.getItem('local_transactions');
        if (storedTransactions) {
          const transactions = JSON.parse(storedTransactions);
          const updatedTransactions = transactions.map((t: any) => {
            if (t.metadata && t.metadata.sourceEntryId === entryId) {
              return { ...t, metadata: { ...t.metadata, sourceWeek: targetWeek } };
            }
            return t;
          });
          localStorage.setItem('local_transactions', JSON.stringify(updatedTransactions));
        }
      } catch (error) {
        console.error('Erro ao atualizar semana da transação:', error);
      }
    },
    
    clearAllEntries: () => {
      set({ entries: [] });
      saveEntriesToStorage([]); 
      
      // Limpa também as transações locais associadas ao Weekly Budget
      try {
        const storedTransactions = localStorage.getItem('local_transactions');
        if (storedTransactions) {
          const transactions = JSON.parse(storedTransactions);
          const filteredTransactions = transactions.filter((t: any) => t.origin !== 'Weekly Budget');
          localStorage.setItem('local_transactions', JSON.stringify(filteredTransactions));
        }
      } catch (error) {
        console.error('Erro ao limpar transações do Weekly Budget:', error);
      }
    },
    
    syncWithTransactions: () => {
      // Obter transações do localStorage
      try {
        const storedTransactions = localStorage.getItem('local_transactions');
        if (!storedTransactions) {
          console.log('Nenhuma transação local encontrada para sincronização');
          return;
        }
        
        const transactions = JSON.parse(storedTransactions);
        
        // Filtrar apenas transações de income
        const incomeTransactions = transactions.filter((t: any) => 
          (t.category === 'Income' || t.type === 'income')
        );
        
        if (incomeTransactions.length === 0) {
          console.log('Nenhuma transação de income encontrada para sincronização');
          return;
        }
        
        console.log(`Encontradas ${incomeTransactions.length} transações de income para sincronização`);
        
        // Obter entradas existentes
        const existingEntries = get().entries;
        
        // Para cada transação de income, verificar se já existe uma entrada correspondente
        incomeTransactions.forEach((transaction: any) => {
          // Determinar a semana com base na data da transação ou nos metadados
          let week = 'Week 1';
          let month = '';
          let year = 0;
          
          if (transaction.metadata && transaction.metadata.sourceWeek) {
            // Se a transação tem metadados de semana, usar esses valores
            week = transaction.metadata.sourceWeek;
            month = transaction.metadata.sourceMonth || '';
            year = transaction.metadata.sourceYear || 0;
          } else {
            // Caso contrário, determinar com base na data da transação
            const transactionDate = new Date(transaction.date);
            const dayOfMonth = transactionDate.getDate();
            month = transactionDate.toLocaleString('default', { month: 'long' });
            year = transactionDate.getFullYear();
            
            if (dayOfMonth > 21) {
              week = 'Week 4';
            } else if (dayOfMonth > 14) {
              week = 'Week 3';
            } else if (dayOfMonth > 7) {
              week = 'Week 2';
            }
          }
          
          // Verificar se já existe uma entrada com a mesma descrição, valor e semana
          const existingEntry = existingEntries.find(entry => 
            entry.description === (transaction.description || transaction.origin) && 
            entry.amount === transaction.amount && 
            entry.week === week && 
            entry.month === month && 
            entry.year === year
          );
          
          if (!existingEntry) {
            // Criar uma nova entrada no Weekly Budget
            const newEntry: WeeklyBudgetEntry = {
              id: `wb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              week: week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
              description: transaction.description || transaction.origin,
              amount: transaction.amount,
              category: 'Income',
              month: month,
              year: year
            };
            
            // Adicionar a entrada ao Weekly Budget (sem criar uma nova transação)
            set((state) => ({
              entries: [...state.entries, newEntry]
            }));
            
            console.log('Adicionada nova entrada ao Weekly Budget a partir de transação:', newEntry);
          }
        });
      } catch (error) {
        console.error('Erro ao sincronizar com transações:', error);
      }
    }
  };
});
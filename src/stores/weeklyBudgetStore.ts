import { create } from 'zustand';
import { weekToDate } from '../utils/dateUtils';
import { TransactionCategory, TransactionType } from '../types/transaction';
import { useTransactionStore } from './transactionStore';

export interface WeeklyBudgetEntry {
  id: string;
  week: 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4';
  description: string;
  amount: number;
  category: TransactionCategory;
  month: string;
  year: number;
  syncToTransactions?: boolean; // Flag para indicar se deve sincronizar com transações
}

interface WeeklyBudgetState {
  entries: WeeklyBudgetEntry[];
  addEntry: (entry: WeeklyBudgetEntry) => void;
  createTransactionFromEntry: (entry: WeeklyBudgetEntry) => Promise<boolean>;
  updateEntry: (id: string, entry: Partial<WeeklyBudgetEntry>) => void;
  deleteEntry: (id: string) => void;
  moveEntryToWeek: (entryId: string, targetWeek: string) => void;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  syncWithTransactions: () => void;
  clearAllEntries: () => void;
}

const currentYear = 2025;

const initializeEventListeners = (store: WeeklyBudgetState) => {
  window.addEventListener('income-added-to-week', ((event: CustomEvent) => {
    const { transaction, week, month, year } = event.detail;
    console.log('Weekly Budget: Detected income-added-to-week event', event.detail);

    const entries = store.entries;
    const existingEntry = entries.find(entry =>
      (entry.description === (transaction.description || transaction.origin) &&
        entry.amount === transaction.amount &&
        entry.week === week &&
        entry.month === month &&
        entry.year === year)
    );

    if (!existingEntry) {
      const newEntry: WeeklyBudgetEntry = {
        id: `wb-${Date.now()}`,
        week: week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
        description: transaction.description || transaction.origin,
        amount: transaction.amount,
        category: 'Income',
        month: month,
        year: typeof year === 'string' ? parseInt(year) : year
      };

      store.addEntry(newEntry);
      console.log('Weekly Budget: Added new entry from income transaction', newEntry);
    } else {
      console.log('Weekly Budget: Entry already exists, skipping', existingEntry);
    }
  }) as EventListener);

  window.addEventListener('local-transaction-added', ((event: CustomEvent) => {
    const transaction = event.detail;
    console.log('Weekly Budget: Detected local-transaction-added event', transaction);

    if (transaction.category === 'Income' || transaction.type === 'income') {
      const transactionDate = new Date(transaction.date);
      const dayOfMonth = transactionDate.getDate();
      const month = transactionDate.toLocaleString('default', { month: 'short' });
      const year = transactionDate.getFullYear();

      let week = 'Week 1';
      if (dayOfMonth > 21) {
        week = 'Week 4';
      } else if (dayOfMonth > 14) {
        week = 'Week 3';
      } else if (dayOfMonth > 7) {
        week = 'Week 2';
      }

      const entries = store.entries;
      const existingEntry = entries.find(entry =>
        (entry.description === (transaction.description || transaction.origin) &&
          entry.amount === transaction.amount &&
          entry.week === week &&
          entry.month === month &&
          entry.year === year)
      );

      if (!existingEntry) {
        const newEntry: WeeklyBudgetEntry = {
          id: `wb-${Date.now()}`,
          week: week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
          description: transaction.description || transaction.origin,
          amount: transaction.amount,
          category: 'Income',
          month: month,
          year: year
        };

        store.addEntry(newEntry);
        console.log('Weekly Budget: Added new entry from local transaction', newEntry);
      }
    }
  }) as EventListener);
};

export const useWeeklyBudgetStore = create<WeeklyBudgetState>((set, get) => {
  setTimeout(() => {
    initializeEventListeners(get());
  }, 100);

  return {
    currentYear,
    setCurrentYear: (year: number) => set({ currentYear: year }),
    entries: [],
    addEntry: (entry: WeeklyBudgetEntry) => {
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
      
      // Validar que a semana está corretamente definida
      if (!entry.week || !['Week 1', 'Week 2', 'Week 3', 'Week 4'].includes(entry.week)) {
        console.error('Erro ao adicionar entrada: semana inválida', entry.week);
        entry.week = 'Week 1'; // Definir uma semana padrão se inválida
      }
      
      console.log(`Adicionando nova entrada ao Weekly Budget: ${entry.description} - ${entry.amount} - ${entry.week} - ${entry.month} ${entry.year}`);
      
      // Adicionar a entrada ao estado
      set((state) => ({
        entries: [...state.entries, entry]
      }));
      
      // Disparar evento para atualizar a interface
      window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
      
      // Após adicionar uma entrada, cria automaticamente uma transação correspondente
      // mas apenas se não for uma entrada de sincronização (para evitar loop) e se syncToTransactions for true
      if (!entry.id.startsWith('wb-') && entry.syncToTransactions !== false) {
        const state = useWeeklyBudgetStore.getState();
        state.createTransactionFromEntry(entry)
          .then(success => {
            if (success) {
              console.log('Transação criada automaticamente a partir da nova entrada do orçamento');
              // Atualiza o transactionStore
              try {
                const transactionStore = useTransactionStore.getState();
                if (transactionStore && transactionStore.fetchTransactions) {
                  transactionStore.fetchTransactions();
                }
              } catch (error) {
                console.error('Erro ao atualizar o transactionStore:', error);
              }
            }
          })
          .catch(error => {
            console.error('Erro ao criar transação a partir da entrada do orçamento:', error);
          });
      }
    },

    createTransactionFromEntry: async (entry: WeeklyBudgetEntry): Promise<boolean> => {
      try {
        // Obter o store de transações
        const transactionStore = useTransactionStore.getState();
        
        // Converter a semana para uma data aproximada
        const weekDate = weekToDate(entry.week, entry.month, entry.year);
        
        // Criar uma nova transação
        const newTransaction = {
          origin: entry.description,
          description: entry.description,
          amount: entry.amount,
          category: entry.category,
          type: entry.category === 'Income' ? 'income' as TransactionType : 'expense' as TransactionType,
          date: weekDate.toISOString(),
          user_id: 'local-user',
          is_recent: true, // Marcar como transação recente para aparecer em Recent Transactions
          metadata: {
            sourceEntryId: entry.id,
            sourceWeek: entry.week,
            sourceMonth: entry.month,
            sourceYear: entry.year,
            week: entry.week,  // Adicionar metadados no formato padronizado
            month: entry.month,
            year: entry.year,
            fromWeeklyBudget: true // Indicador de que veio do Weekly Budget
          }
        };
        
        // Adicionar a transação usando o transactionStore
        await transactionStore.addTransaction(newTransaction);
        
        // Para transações de income, disparar evento específico
        if (entry.category === 'Income') {
          console.log('Weekly Budget: Criando transação de income a partir de entrada do orçamento');
          
          // Disparar evento específico para income
          window.dispatchEvent(new CustomEvent('income-added-from-weekly-budget', {
            detail: {
              transaction: newTransaction,
              week: entry.week,
              month: entry.month,
              year: entry.year
            }
          }));
        }
        
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
    updateEntry: (id: string, updatedEntry: Partial<WeeklyBudgetEntry>) => {
      set((state) => ({
        entries: state.entries.map(entry => 
          entry.id === id ? { ...entry, ...updatedEntry } : entry
        )
      }));
      
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
          
          // Disparar evento para atualizar a interface
          window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
          window.dispatchEvent(new CustomEvent('transactions-updated'));
        }
      } catch (error) {
        console.error('Erro ao atualizar transação associada:', error);
      }
    },
    
    deleteEntry: (id: string) => {
      // Obter a entrada antes de excluí-la para poder excluir a transação associada
      const entryToDelete = get().entries.find(entry => entry.id === id);
      
      // Excluir a entrada do Weekly Budget
      set((state) => ({
        entries: state.entries.filter(entry => entry.id !== id)
      }));
      
      // Se a entrada foi encontrada, excluir também a transação associada
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
            window.dispatchEvent(new CustomEvent('transactions-updated'));
          }
        } catch (error) {
          console.error('Erro ao excluir transação associada:', error);
        }
      }
    },
    
    moveEntryToWeek: (entryId: string, targetWeek: string) => {
      console.log(`Movendo entrada ${entryId} para ${targetWeek}`);
      
      // Verificar se a entrada existe
      const currentState = get();
      const entryToMove = currentState.entries.find(entry => entry.id === entryId);
      
      if (!entryToMove) {
        console.error(`Entrada com ID ${entryId} não encontrada`);
        return;
      }
      
      // Se a entrada já está na semana de destino, não faz nada
      if (entryToMove.week === targetWeek) {
        console.log(`Entrada já está na semana ${targetWeek}`);
        return;
      }
      
      // Verificar se já existe uma entrada idêntica na semana de destino
      const duplicateEntry = currentState.entries.find(entry => 
        entry.id !== entryId && // Não é a mesma entrada
        entry.week === targetWeek && // Está na semana de destino
        entry.description === entryToMove.description && // Mesma descrição
        entry.amount === entryToMove.amount && // Mesmo valor
        entry.category === entryToMove.category && // Mesma categoria
        entry.month === entryToMove.month && // Mesmo mês
        entry.year === entryToMove.year // Mesmo ano
      );
      
      if (duplicateEntry) {
        console.warn(`Entrada duplicada encontrada na semana ${targetWeek}, cancelando movimentação`);
        return;
      }
      
      // Atualizar a entrada no estado
      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === entryId
            ? { ...entry, week: targetWeek as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4' }
            : entry
        ),
      }));
      
      // Atualiza também a transação associada no localStorage
      try {
        const storedTransactions = localStorage.getItem('local_transactions');
        if (storedTransactions) {
          const transactions = JSON.parse(storedTransactions);
          
          const entry = get().entries.find(e => e.id === entryId);
          if (entry) {
            // Atualizar apenas a transação associada a esta entrada
            const updatedTransactions = transactions.map((t: any) => {
              if (t.metadata && t.metadata.sourceEntryId === entryId) {
                // Atualizar a semana nos metadados
                const updatedMetadata = { 
                  ...t.metadata, 
                  sourceWeek: targetWeek,
                  week: targetWeek 
                };
                
                // Atualizar a data da transação para refletir a nova semana
                const newDate = weekToDate(targetWeek as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4', entry.month, entry.year);
                return { 
                  ...t, 
                  date: newDate.toISOString(),
                  metadata: updatedMetadata 
                };
              }
              return t;
            });
            
            localStorage.setItem('local_transactions', JSON.stringify(updatedTransactions));
            console.log(`Transação atualizada para a semana ${targetWeek}`);
            
            // Disparar apenas um evento com detalhes da movimentação
            window.dispatchEvent(new CustomEvent('weekly-budget-updated', { 
              detail: { action: 'move', entryId, targetWeek } 
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao atualizar semana da transação:', error);
      }
    },
    clearAllEntries: () => {
      set({ entries: [] });
      
      // Limpa também as transações locais associadas ao Weekly Budget
      try {
        const storedTransactions = localStorage.getItem('local_transactions');
        if (storedTransactions) {
          const transactions = JSON.parse(storedTransactions);
          const filteredTransactions = transactions.filter((t: any) => 
            !(t.metadata && t.metadata.fromWeeklyBudget)
          );
          localStorage.setItem('local_transactions', JSON.stringify(filteredTransactions));
          
          // Disparar eventos para atualizar a interface
          window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
          window.dispatchEvent(new CustomEvent('transactions-updated'));
        }
      } catch (error) {
        console.error('Erro ao limpar transações do Weekly Budget:', error);
      }
    },

    syncWithTransactions: () => {
      try {
        const storedTransactions = localStorage.getItem('local_transactions') || '[]';
        const localTransactions = JSON.parse(storedTransactions);
        const dbTransactions = useTransactionStore.getState().transactions || [];
        const allTransactions = [...localTransactions, ...dbTransactions];

        const incomeTransactions = allTransactions.filter((t: any) =>
          (t.category === 'Income' || t.type === 'income')
        );

        const uniqueTransactions = Array.from(
          new Map(incomeTransactions.map(t => [t.id, t])).values()
        );

        const existingEntries = get().entries;
        let entriesAdded = false;

        uniqueTransactions.forEach((transaction: any) => {
          if (transaction.metadata && transaction.metadata.sourceEntryId &&
            transaction.metadata.sourceEntryId.startsWith('wb-')) {
            return;
          }

          let week = 'Week 1';
          let month = '';
          let year = 0;

          if (transaction.metadata && transaction.metadata.week) {
            week = transaction.metadata.week;
            month = transaction.metadata.month || '';
            year = parseInt(transaction.metadata.year) || 0;
          } else {
            const transactionDate = new Date(transaction.date);
            const dayOfMonth = transactionDate.getDate();
            month = transactionDate.toLocaleString('default', { month: 'short' });
            year = transactionDate.getFullYear();

            if (dayOfMonth > 21) {
              week = 'Week 4';
            } else if (dayOfMonth > 14) {
              week = 'Week 3';
            } else if (dayOfMonth > 7) {
              week = 'Week 2';
            }
          }

          if (!month) {
            month = new Date().toLocaleString('default', { month: 'short' });
          }

          if (!year) {
            year = new Date().getFullYear();
          }

          const existingEntry = existingEntries.find(entry =>
            entry.description === (transaction.description || transaction.origin) &&
            entry.amount === transaction.amount &&
            entry.week === week &&
            entry.month === month &&
            entry.year === year
          );

          if (!existingEntry) {
            const newEntry: WeeklyBudgetEntry = {
              id: `wb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              week: week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
              description: transaction.description || transaction.origin || 'Income',
              amount: transaction.amount,
              category: 'Income',
              month: month,
              year: year
            };

            set((state) => ({
              entries: [...state.entries, newEntry]
            }));

            entriesAdded = true;
          }
        });

        if (entriesAdded) {
          window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
        }
      } catch (error) {
        console.error('Weekly Budget: Erro ao sincronizar com transações:', error);
      }
    }
  };
});

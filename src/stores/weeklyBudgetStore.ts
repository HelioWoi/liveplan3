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

export const useWeeklyBudgetStore = create<WeeklyBudgetState>((set, get) => {
  // Inicializar listeners após a criação do store
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
      
      // Add to weekly budget entries only - no automatic sync to transactions
      // This avoids foreign key constraint errors when there's no valid user
      set((state) => ({
        entries: [...state.entries, entry]
      }));
      
      // Após adicionar uma entrada, cria automaticamente uma transação correspondente
      // mas apenas se não for uma entrada de sincronização (para evitar loop)
      if (!entry.id.startsWith('wb-')) {
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
    
    // Versão local que não depende do banco de dados
    createTransactionFromEntry: async (entry: WeeklyBudgetEntry): Promise<boolean> => {
      // Simula a criação de uma transação sem usar o banco de dados
      try {
        // Converter a semana para uma data aproximada
        const weekDate = weekToDate(entry.week, entry.month, entry.year);
        
        // Criar uma nova transação local
        const newTransaction = {
          id: `tx-${Date.now()}`,
          origin: entry.category === 'Fixed' ? entry.description : 'Weekly Budget',
          description: entry.description,
          amount: entry.amount,
          category: entry.category,
          type: entry.category === 'Income' ? 'income' : 'expense',
          date: weekDate.toISOString(),
          user_id: 'local-user',
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
          
          // Adicionar as contas futuras apenas localmente
          try {
            // Salvar no localStorage para persistir entre sessões
            const storedTransactions = localStorage.getItem('local_transactions');
            const existingTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
            
            const futureBill1 = {
              ...nextMonthTransaction,
              user_id: 'local-user'
            };
            
            const futureBill2 = {
              ...nextTwoMonthTransaction,
              user_id: 'local-user'
            };
            
            const updatedTransactions = [
              futureBill1,
              futureBill2,
              ...existingTransactions
            ];
            
            localStorage.setItem('local_transactions', JSON.stringify(updatedTransactions));
            
            // Atualizar o estado global manualmente
            const currentTransactions = useTransactionStore.getState().transactions;
            useTransactionStore.setState({
              transactions: [futureBill1, futureBill2, ...currentTransactions]
            });
            
            console.log('Contas futuras criadas com sucesso para', entry.description);
          } catch (error) {
            console.error('Erro ao salvar contas futuras no localStorage:', error);
          }
        }
        
        // Adicionar a transação ao localStorage
        try {
          const storedTransactions = localStorage.getItem('local_transactions');
          const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
          
          // Verificar se já existe uma transação idêntica
          const existingTransaction = transactions.find((t: any) => 
            t.description === newTransaction.description && 
            t.amount === newTransaction.amount && 
            t.origin === newTransaction.origin &&
            t.metadata?.sourceEntryId === newTransaction.metadata.sourceEntryId
          );
          
          if (!existingTransaction) {
            // Adicionar a nova transação ao array
            transactions.push(newTransaction);
            
            // Salvar de volta no localStorage
            localStorage.setItem('local_transactions', JSON.stringify(transactions));
            
            // Disparar evento para notificar outras partes do app
            window.dispatchEvent(new CustomEvent('transaction-added', { detail: newTransaction }));
            
            return true;
          } else {
            console.log('Transação já existe, ignorando duplicação:', existingTransaction);
            return false;
          }
        } catch (error) {
          console.error('Erro ao salvar transação no localStorage:', error);
          return false;
        }
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
          }
        } catch (error) {
          console.error('Erro ao excluir transação associada:', error);
        }
      }
    },
    
    moveEntryToWeek: (entryId: string, targetWeek: string) => {
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

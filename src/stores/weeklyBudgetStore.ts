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
    
    // Cria uma transação a partir de uma entrada do Weekly Budget
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
        
        // Se for uma entrada da categoria Fixed, criar duas contas futuras adicionais
        if (entry.category === 'Fixed') {
          // Criar primeira conta futura (próximo mês)
          const nextMonthDate = new Date(weekDate);
          nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
          
          const nextMonthTransaction = {
            // Não definimos o ID para permitir que o Supabase gere um UUID válido automaticamente
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
            // Não definimos o ID para permitir que o Supabase gere um UUID válido automaticamente
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
      // Obter transações do localStorage e do banco de dados
      try {
        console.log('Weekly Budget: Iniciando sincronização com transações');
        
        // Obter transações locais do localStorage
        const storedTransactions = localStorage.getItem('local_transactions') || '[]';
        const localTransactions = JSON.parse(storedTransactions);
        
        // Obter transações do banco de dados através do transactionStore
        const dbTransactions = useTransactionStore.getState().transactions || [];
        
        // Combinar todas as transações
        const allTransactions = [...localTransactions, ...dbTransactions];
        
        console.log(`Weekly Budget: Total de ${allTransactions.length} transações encontradas para sincronização`);
        
        // Filtrar apenas transações de income
        const incomeTransactions = allTransactions.filter((t: any) => 
          (t.category === 'Income' || t.type === 'income')
        );
        
        if (incomeTransactions.length === 0) {
          console.log('Weekly Budget: Nenhuma transação de income encontrada para sincronização');
          return;
        }
        
        console.log(`Weekly Budget: Encontradas ${incomeTransactions.length} transações de income para sincronização`);
        
        // Remover duplicatas baseado no ID
        const uniqueTransactions = Array.from(
          new Map(incomeTransactions.map(t => [t.id, t])).values()
        );
        
        console.log(`Weekly Budget: ${uniqueTransactions.length} transações únicas após remoção de duplicatas`);
        
        // Obter entradas existentes
        const existingEntries = get().entries;
        let entriesAdded = false;
        
        // Para cada transação de income, verificar se já existe uma entrada correspondente
        uniqueTransactions.forEach((transaction: any) => {
          // Pular transações que já foram criadas a partir do Weekly Budget
          // para evitar duplicação cíclica
          if (transaction.metadata && transaction.metadata.sourceEntryId && 
              transaction.metadata.sourceEntryId.startsWith('wb-')) {
            console.log('Weekly Budget: Pulando transação que já foi criada a partir do Weekly Budget:', transaction.id);
            return;
          }
          
          // Determinar a semana com base na data da transação ou nos metadados
          let week = 'Week 1';
          let month = '';
          let year = 0;
          
          if (transaction.metadata && transaction.metadata.week) {
            // Se a transação tem metadados de semana, usar esses valores
            week = transaction.metadata.week;
            month = transaction.metadata.month || '';
            year = parseInt(transaction.metadata.year) || 0;
          } else if (transaction.metadata && transaction.metadata.sourceWeek) {
            // Compatibilidade com formato anterior
            week = transaction.metadata.sourceWeek;
            month = transaction.metadata.sourceMonth || '';
            year = parseInt(transaction.metadata.sourceYear) || 0;
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
          
          // Se não temos mês ou ano válidos, usar o mês e ano atual
          if (!month || month === '') {
            month = new Date().toLocaleString('default', { month: 'long' });
          }
          
          if (!year || year === 0) {
            year = new Date().getFullYear();
          }
          
          console.log(`Weekly Budget: Processando transação ${transaction.id} para ${week}, ${month}, ${year}`);
          
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
              description: transaction.description || transaction.origin || 'Income',
              amount: transaction.amount,
              category: 'Income',
              month: month,
              year: year
            };
            
            // Adicionar a entrada ao Weekly Budget (sem criar uma nova transação)
            set((state) => ({
              entries: [...state.entries, newEntry]
            }));
            
            console.log('Weekly Budget: Adicionada nova entrada ao Weekly Budget a partir de transação:', newEntry);
            entriesAdded = true;
          } else {
            console.log(`Weekly Budget: Entrada já existe para transação ${transaction.id}`);
          }
        });
        
        // Se novas entradas foram adicionadas, disparar evento para atualizar a UI
        if (entriesAdded) {
          window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
          console.log('Weekly Budget: Entradas atualizadas a partir de transações');
        } else {
          console.log('Weekly Budget: Nenhuma nova entrada adicionada durante a sincronização');
        }
      } catch (error) {
        console.error('Weekly Budget: Erro ao sincronizar com transações:', error);
      }
    }
  };
});

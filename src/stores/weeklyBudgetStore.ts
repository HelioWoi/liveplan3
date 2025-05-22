import { create } from 'zustand';
import { weekToDate } from '../utils/dateUtils';
import { TransactionCategory } from '../types/transaction';
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
      
      // Disparar evento para atualizar a UI
      window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
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
        
        // Disparar evento para atualizar a UI
        window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
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
      // Add to weekly budget entries only - no automatic sync to transactions
      // This avoids foreign key constraint errors when there's no valid user
      set((state) => ({
        entries: [...state.entries, entry]
      }));
      
      // Após adicionar uma entrada, cria automaticamente uma transação correspondente
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
          amount: Math.abs(entry.amount), // Sempre armazena o valor absoluto
          category: entry.category,
          // Define o tipo baseado na categoria, não no valor
          // Income é sempre 'income', outras categorias são sempre 'expense'
          type: entry.category === 'Income' ? 'income' : 'expense',
          description: entry.description,
          origin: 'Weekly Budget',
          user_id: 'local-user',
          // Adicionar metadados para facilitar a sincronização
          metadata: {
            sourceEntryId: entry.id,
            sourceWeek: entry.week,
            sourceMonth: entry.month,
            sourceYear: entry.year
          }
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
      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === id ? { ...entry, ...updatedEntry } : entry
        ),
      }));
      
      // Dispara um evento para notificar outras partes do app
      window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
    },
    
    deleteEntry: (id: string) => {
      // Primeiro, encontra a entrada que será excluída
      const entryToDelete = get().entries.find(entry => entry.id === id);
      
      if (entryToDelete) {
        // Remove a entrada do estado
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
        
        // Agora, procura por transações associadas no localStorage
        try {
          const storedTransactions = localStorage.getItem('local_transactions');
          if (storedTransactions) {
            const transactions = JSON.parse(storedTransactions);
            
            // Filtra as transações, removendo aquelas que têm o sourceEntryId igual ao id da entrada
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
      // Recupera transações do localStorage
      const storedTransactions = localStorage.getItem('local_transactions');
      if (!storedTransactions) return;
      
      const transactions = JSON.parse(storedTransactions);
      
      // Agrupa transações por mês e semana
      const transactionsByMonthAndWeek: Record<string, Record<string, any[]>> = {};
      
      transactions.forEach((transaction: any) => {
        // Extrai o mês e ano da data da transação
        const date = new Date(transaction.date);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        
        // Determina a semana com base no dia do mês
        const day = date.getDate();
        let week = 'Week 1';
        
        if (day > 21) {
          week = 'Week 4';
        } else if (day > 14) {
          week = 'Week 3';
        } else if (day > 7) {
          week = 'Week 2';
        }
        
        // Inicializa o objeto para o mês se não existir
        if (!transactionsByMonthAndWeek[`${month}-${year}`]) {
          transactionsByMonthAndWeek[`${month}-${year}`] = {};
        }
        
        // Inicializa o array para a semana se não existir
        if (!transactionsByMonthAndWeek[`${month}-${year}`][week]) {
          transactionsByMonthAndWeek[`${month}-${year}`][week] = [];
        }
        
        // Adiciona a transação ao array da semana correspondente
        transactionsByMonthAndWeek[`${month}-${year}`][week].push(transaction);
      });
      
      // Recupera as entradas existentes do Weekly Budget
      const existingEntries = get().entries;
      
      // Para cada mês e semana, verifica se há transações que não estão no Weekly Budget
      Object.entries(transactionsByMonthAndWeek).forEach(([monthYear, weekData]) => {
        const [month, yearStr] = monthYear.split('-');
        const year = parseInt(yearStr);
        
        Object.entries(weekData).forEach(([week, transactions]) => {
          transactions.forEach((transaction: any) => {
            // Verifica se já existe uma entrada correspondente
            const existingEntry = existingEntries.find(entry => 
              (entry.description === transaction.description &&
               entry.amount === transaction.amount &&
               entry.week === week &&
               entry.month === month &&
               entry.year === year) ||
              (transaction.metadata && transaction.metadata.sourceEntryId === entry.id)
            );
            
            // Se não existir uma entrada correspondente, cria uma
            if (!existingEntry) {
              // Verifica se a categoria é válida para o Weekly Budget
              let category = transaction.category;
              if (!['Income', 'Fixed', 'Variable', 'Extra', 'Additional'].includes(category)) {
                // Se a transação for do tipo 'income', coloca na categoria 'Income'
                if (transaction.type === 'income' || transaction.amount > 0) {
                  category = 'Income';
                } else {
                  // Se for despesa, coloca em 'Variable' por padrão
                  category = 'Variable';
                }
              }
              
              const newEntry: WeeklyBudgetEntry = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                week: week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
                description: transaction.description,
                amount: transaction.amount,
                category: category,
                month,
                year
              };
              
              // Adiciona a nova entrada ao estado
              set((state) => ({
                entries: [...state.entries, newEntry]
              }));
              
              console.log(`Entrada de orçamento criada para a transação: ${transaction.description}`);
            }
          });
        });
      });
      
      // Atualiza o transactionStore para refletir as mudanças
      try {
        // Tenta acessar o método fetchTransactions do transactionStore
        const transactionStore = useTransactionStore.getState();
        if (transactionStore && transactionStore.fetchTransactions) {
          transactionStore.fetchTransactions();
          console.log('TransactionStore atualizado com sucesso após sincronização do Weekly Budget');
        }
      } catch (error) {
        console.error('Erro ao atualizar o transactionStore:', error);
      }
      
      // Dispara um evento para notificar outras partes do app
      window.dispatchEvent(new CustomEvent('local-transactions-updated'));
    }
  };
});

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

export const useWeeklyBudgetStore = create<WeeklyBudgetState>((set, get) => ({
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
            console.error('Erro ao atualizar o transactionStore após adicionar entrada:', error);
          }
        }
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
    set((state) => {
      const entryIndex = state.entries.findIndex(entry => entry.id === id);
      if (entryIndex === -1) return state;
      
      const updatedEntries = [...state.entries];
      updatedEntries[entryIndex] = { ...updatedEntries[entryIndex], ...updatedEntry };
      
      return { entries: updatedEntries };
    });
  },
  
  deleteEntry: (id: string) => {
    // Encontrar a entrada antes de excluí-la para saber se era um Income
    const entryToDelete = get().entries.find(entry => entry.id === id);
    
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    }));
    
    // Disparar evento para notificar outras partes do app sobre a exclusão
    window.dispatchEvent(new CustomEvent('weekly-budget-entry-deleted', { 
      detail: { id, entry: entryToDelete } 
    }));
    
    // Atualizar as transações locais para refletir a exclusão
    try {
      const storedTransactions = localStorage.getItem('local_transactions');
      if (storedTransactions) {
        const transactions = JSON.parse(storedTransactions);
        // Remover transações relacionadas a esta entrada
        const filteredTransactions = transactions.filter((t: any) => 
          !(t.origin === 'Weekly Budget' && t.metadata && t.metadata.sourceEntryId === id)
        );
        localStorage.setItem('local_transactions', JSON.stringify(filteredTransactions));
      }
    } catch (error) {
      console.error('Erro ao atualizar transações locais após exclusão:', error);
    }
  },
  
  moveEntryToWeek: (entryId: string, targetWeek: string) => {
    set((state) => {
      // Encontrar a entrada pelo ID
      const entryIndex = state.entries.findIndex(entry => entry.id === entryId);
      
      if (entryIndex === -1) return state; // Entrada não encontrada
      
      // Criar uma cópia das entradas
      const updatedEntries = [...state.entries];
      
      // Atualizar a semana da entrada
      updatedEntries[entryIndex] = {
        ...updatedEntries[entryIndex],
        week: targetWeek as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4'
      };
      
      return { entries: updatedEntries };
    });
  },
  
  clearAllEntries: () => {
    // Limpa todas as entradas do orçamento semanal
    set({ entries: [] });
    console.log('Todas as entradas do orçamento semanal foram removidas');
    
    // Opcional: também poderia limpar as transações relacionadas no localStorage
    // const storedTransactions = localStorage.getItem('local_transactions');
    // if (storedTransactions) {
    //   const transactions = JSON.parse(storedTransactions);
    //   const filteredTransactions = transactions.filter((t: any) => t.origin !== 'Weekly Budget');
    //   localStorage.setItem('local_transactions', JSON.stringify(filteredTransactions));
    // }
  },
  
  syncWithTransactions: () => {
    // Versão melhorada que integra com o transactionStore
    console.log('Sincronizando entradas do orçamento semanal com transações');
    
    const storeState = useWeeklyBudgetStore.getState();
    
    // Recupera transações existentes do localStorage
    const storedTransactions = localStorage.getItem('local_transactions');
    const localTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    
    // Encontra entradas do orçamento que não têm transações correspondentes
    storeState.entries.forEach(entry => {
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
            user_id: 'local_user'
          };
          
          localTransactions.push(newTransaction);
          localStorage.setItem('local_transactions', JSON.stringify(localTransactions));
          
          console.log(`Transação criada para a entrada de orçamento: ${entry.description}`);
        } catch (error) {
          console.error('Erro ao criar transação para entrada de orçamento:', error);
        }
      }
    });
    
    // Não limpar as entradas existentes para evitar perder dados
    // Apenas remover entradas duplicadas ou com valores extremamente grandes
    set((state) => ({
      entries: state.entries.filter(entry => 
        // Manter apenas entradas com valores razoáveis (menores que 1 milhão)
        Math.abs(entry.amount) < 1000000
      )
    }));
    
    // Adicionar o Total Income atual na semana atual
    const now = new Date();
    const currentMonth = now.toLocaleString('en-US', { month: 'long' });
    const currentYear = now.getFullYear();
    const dayOfMonth = now.getDate();
    const weekNumber = Math.ceil(dayOfMonth / 7);
    const currentWeek = `Week ${weekNumber}`;
    
    // Verificar se já existe uma entrada de Total Income
    // Se existir, não adicionar novamente para evitar duplicações
    const currentState = get();
    const existingTotalIncome = currentState.entries.find((entry: WeeklyBudgetEntry) => 
      entry.description === 'Total Income' && 
      entry.category === 'Income'
    );
    
    // Apenas adicionar Total Income se não existir já e se o usuário estiver adicionando explicitamente
    // Não adicionar automaticamente ao clicar na tabela
    if (!existingTotalIncome && localTransactions.some((t: any) => t.description === 'Total Income')) {
      // Calcular o Total Income a partir das transações (limitado a um valor razoável)
      let totalIncome = localTransactions
        .filter((t: any) => t.category === 'Income' && t.description === 'Total Income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      // Limitar o valor para evitar números extremamente grandes
      totalIncome = Math.min(totalIncome, 10000); // Limitar a 10.000
      
      // Criar uma entrada para o Total Income na semana atual apenas se for maior que zero
      if (totalIncome > 0) {
        const totalIncomeEntry: WeeklyBudgetEntry = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          week: currentWeek as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
          description: 'Total Income',
          amount: totalIncome,
          category: 'Income',
          month: currentMonth,
          year: currentYear
        };
        
        // Adicionar a entrada ao estado
        set((state) => ({
          entries: [...state.entries, totalIncomeEntry]
        }));
        
        console.log(`Entrada de Total Income criada para a semana atual: ${totalIncome}`);
      }
    }
    
    // Não adicionar dados de exemplo, deixar a tabela zerada
    
    // Agora, verificamos se há transações que não têm entradas correspondentes
    // e criamos entradas para elas (exceto para o Total Income que já foi tratado)
    localTransactions.forEach((transaction: any) => {
      // Pular transações que são do Total Income ou que têm valores muito grandes
      if (transaction.description === 'Total Income' || Math.abs(transaction.amount) > 10000) {
        return;
      }
      
      // Converte a data da transação para obter o mês e a semana
      const transactionDate = new Date(transaction.date);
      const month = transactionDate.toLocaleString('en-US', { month: 'long' });
      const dayOfMonth = transactionDate.getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);
      const week = `Week ${weekNumber}`;
      const year = transactionDate.getFullYear();
      
      // Verifica se já existe uma entrada correspondente
      const existingEntry = storeState.entries.find((entry: WeeklyBudgetEntry) => 
        entry.description === transaction.description && 
        entry.amount === transaction.amount && 
        entry.week === week && 
        entry.month === month && 
        entry.year === year
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
  },
}));
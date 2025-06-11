import { useTransactionStore } from '../stores/transactionStore';
import { TransactionCategory, TransactionType } from '../types/transaction';

export type EntryInputData = {
  description: string;
  amount: number;
  week?: string;
  month: string;
  year: string | number;
  category?: TransactionCategory;
  addAsTransaction?: boolean;
};

export type IncomeEntrySource = 'header' | 'weekly' | 'floating';

/**
 * Função centralizada para registrar uma entrada de receita em qualquer lugar do aplicativo
 * Garante consistência entre todos os pontos de entrada (Header, Weekly Budget, Floating Button)
 */
export async function registerIncomeEntry(source: IncomeEntrySource, data: EntryInputData): Promise<void> {
  const transactionStore = useTransactionStore.getState();
  
  // Criar objeto de transação com todos os campos necessários
  const transaction = {
    origin: data.description,
    description: data.description,
    amount: data.amount,
    category: 'Income' as TransactionCategory,
    type: 'income' as TransactionType,
    date: new Date().toISOString(),
    user_id: 'local-user',
    is_local: true,
    metadata: {
      source,
      week: data.week || '',
      month: data.month,
      year: data.year,
      fromWeeklyBudget: source === 'weekly'
    }
  };

  // Adicionar a transação ao store
  await transactionStore.addTransaction(transaction);
  console.log(`Income entry registered from ${source}:`, transaction);

  // Disparar eventos para atualizar outros componentes
  window.dispatchEvent(new CustomEvent('transactions-updated'));
  window.dispatchEvent(new CustomEvent('income-added-to-week', {
    detail: { 
      transaction, 
      week: data.week, 
      month: data.month, 
      year: data.year 
    }
  }));
  
  // Evento específico para indicar que uma receita foi adicionada do Weekly Budget
  if (source === 'weekly') {
    window.dispatchEvent(new CustomEvent('income-added-from-weekly-budget', {
      detail: { transaction }
    }));
  }
}

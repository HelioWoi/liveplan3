import { useTransactions } from '../../../hooks/useTransactionHooks';
import { useAuthStore } from '../../../stores/authStore';
import { totalIncomeFn, totalExpensesFn} from '../../helper';

export const useBudgetSummary = (selectedPeriodState: any) => {
  const { user } = useAuthStore();
  const month = selectedPeriodState.month.length === 3 ? selectedPeriodState.month : selectedPeriodState.month.slice(0, 3);
  const { data: transactions, isLoading } = useTransactions(user?.id ?? "", month, selectedPeriodState.year, selectedPeriodState.week, selectedPeriodState.period);

  // Cálculo do Total Income - APENAS entradas de receita (Income) do período selecionado
  const totalIncome = totalIncomeFn(transactions || []);

  // Cálculo do Total Expenses - APENAS despesas (todas as categorias exceto Income) do período selecionado
  const totalExpenses = totalExpensesFn(transactions || []);

  return {
    isLoading,
    totalExpenses,
    totalIncome,
  }
}
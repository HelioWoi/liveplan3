import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useTransactionStore } from '../../stores/transactionStore';

interface PeriodSummaryCardsProps {
  period: 'Weekly' | 'Monthly' | 'Annual';
  selectedMonth?: string;
  selectedYear?: string;
}

// Removida interface não utilizada

export default function PeriodSummaryCards({ period, selectedMonth, selectedYear }: PeriodSummaryCardsProps) {
  const { transactions } = useTransactionStore();
  const [iconColor, setIconColor] = useState('text-purple-600');
  const [bgColor, setBgColor] = useState('bg-purple-100');
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);

  useEffect(() => {
    // Definir cores com base no período
    switch (period) {
      case 'Weekly':
        setIconColor('text-purple-600');
        setBgColor('bg-purple-100');
        break;
      case 'Monthly':
        setIconColor('text-green-600');
        setBgColor('bg-green-100');
        break;
      case 'Annual':
        setIconColor('text-purple-600');
        setBgColor('bg-purple-100');
        break;
    }

    // Carregar e processar transações
    const loadTransactions = () => {
      // Processar diretamente as transações do store
      calculateTotal(transactions);
    };

    // Converter nome do mês para número (0-11)
    const getMonthNumber = (monthName: string): number => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      return months.indexOf(monthName);
    };
    
    // Calcular total com base no período
    const calculateTotal = (transactions: any[]) => {
      const now = new Date();
      // Usar seleções do usuário ou valores atuais
      const currentMonth = selectedMonth ? getMonthNumber(selectedMonth) : now.getMonth();
      const currentYear = selectedYear ? parseInt(selectedYear) : now.getFullYear();
      
      console.log(`PeriodSummaryCards (${period}) - Calculating total:`);
      console.log(`- Selected Month: ${selectedMonth} (index: ${currentMonth})`);
      console.log(`- Selected Year: ${selectedYear || now.getFullYear()}`);

      // Filtrar transações com base no período
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        
        switch (period) {
          case 'Weekly':
            // Considerar transações da última semana
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return transactionDate >= oneWeekAgo && transactionDate <= now;
          
          case 'Monthly':
            // Considerar transações do mês atual
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          
          case 'Annual':
            // Considerar transações do ano atual
            return transactionDate.getFullYear() === currentYear;
          
          default:
            return false;
        }
      });

      // Calcular o total para cada tipo de transação
      let income = 0;
      let expense = 0;
      
      console.log(`- Total transactions before filtering: ${transactions.length}`);
      console.log(`- Filtered transactions: ${filteredTransactions.length}`);
      
      filteredTransactions.forEach(t => {
        if (t.type === 'income') {
          income += Number(t.amount);
        } else if (t.type === 'expense') {
          expense += Number(t.amount);
        }
      });
      
      console.log(`- Income total: ${income}`);
      console.log(`- Expense total: ${expense}`);
      
      // Atualizar os estados com os totais calculados
      setIncomeTotal(income);
      setExpenseTotal(expense);
    };

    loadTransactions();

    // Configurar listener para atualizações
    const handleTransactionsUpdated = () => {
      loadTransactions();
    };
    
    window.addEventListener('local-transactions-updated', handleTransactionsUpdated);
    window.addEventListener('local-transaction-added', handleTransactionsUpdated);
    
    return () => {
      window.removeEventListener('local-transactions-updated', handleTransactionsUpdated);
      window.removeEventListener('local-transaction-added', handleTransactionsUpdated);
    };
  }, [period, transactions, selectedMonth, selectedYear]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Calendar className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{period}</h2>
          <div>
            {incomeTotal > 0 && (
              <p className="text-sm text-success-600">Income: {formatCurrency(incomeTotal)}</p>
            )}
            {expenseTotal > 0 && (
              <p className="text-sm text-error-600">Spent: {formatCurrency(expenseTotal)}</p>
            )}
            {incomeTotal === 0 && expenseTotal === 0 && (
              <p className="text-sm text-gray-500">No transactions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

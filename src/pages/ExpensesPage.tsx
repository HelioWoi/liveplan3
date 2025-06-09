import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkRefreshFlag, clearRefreshFlag, REFRESH_FLAGS } from '../utils/dataRefreshService';
import { useTransactionStore } from '../stores/transactionStore';
import { useNotificationStore } from '../stores/notificationStore';
import { Transaction, TransactionCategory, TransactionType } from '../types/transaction';
import NotificationModal from '../components/notifications/NotificationModal';
import { ArrowLeft, Bell, Calendar, ArrowDownCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import PeriodSelector from '../components/common/PeriodSelector';
import TransactionDetailModal from '../components/modals/TransactionDetailModal';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

// Interface para transações locais
interface LocalTransaction {
  id: string;
  date: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  description: string;
  origin: string;
  user_id: string;
}

export default function ExpensesPage() {
  const navigate = useNavigate();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [dataRefreshed, setDataRefreshed] = useState(false);
  const [localTransactions, setLocalTransactions] = useState<LocalTransaction[]>([]);
  type Period = 'Day' | 'Week' | 'Month' | 'Year';
  type WeekNumber = '1' | '2' | '3' | '4' | '5';
  
  // Get current week based on day of month
  const getCurrentWeek = (): WeekNumber => {
    const date = new Date();
    const dayOfMonth = date.getDate();
    // Calculate which week of the month we're in (1-5)
    const weekNumber = Math.ceil(dayOfMonth / 7);
    return weekNumber > 5 ? '5' : weekNumber.toString() as WeekNumber;
  };

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Month');
  const [selectedMonth, setSelectedMonth] = useState<typeof months[number]>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedWeek, setSelectedWeek] = useState<WeekNumber>(getCurrentWeek());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const { unreadCount } = useNotificationStore();

  const expenseCategories: TransactionCategory[] = ['Fixed', 'Variable', 'Extra', 'Investment', 'Tax', 'Additional', 'Contribution', 'Goal'];
  const COLORS = ['#A855F7', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6'];
  
  // Check for data refresh flags and reload data as needed
  useEffect(() => {
    const needsRefresh = checkRefreshFlag(REFRESH_FLAGS.ALL) || 
                         checkRefreshFlag(REFRESH_FLAGS.TRANSACTIONS);
    
    if (needsRefresh && !dataRefreshed) {
      console.log('Refreshing Expenses page data...');
      // Fetch fresh data
      fetchTransactions();
      
      // Clear the flags after refresh
      clearRefreshFlag(REFRESH_FLAGS.TRANSACTIONS);
      
      // Mark as refreshed to prevent multiple refreshes
      setDataRefreshed(true);
    }
  }, [fetchTransactions, dataRefreshed]);
  
  // Carregar transações locais do localStorage
  useEffect(() => {
    const loadLocalTransactions = () => {
      const storedTransactions = localStorage.getItem('local_transactions');
      if (storedTransactions) {
        try {
          const parsedTransactions = JSON.parse(storedTransactions);
          setLocalTransactions(parsedTransactions);
          console.log('Transações locais carregadas:', parsedTransactions.length);
        } catch (error) {
          console.error('Erro ao carregar transações locais:', error);
        }
      } else {
        console.log('Nenhuma transação local encontrada');
        setLocalTransactions([]);
      }
    };
    
    // Carregar inicialmente
    loadLocalTransactions();
    
    // Configurar listener para atualizações
    const handleLocalTransactionsUpdated = () => {
      console.log('Evento de atualização de transações locais detectado');
      loadLocalTransactions();
    };
    
    window.addEventListener('local-transactions-updated', handleLocalTransactionsUpdated);
    window.addEventListener('local-transaction-added', handleLocalTransactionsUpdated);
    
    return () => {
      window.removeEventListener('local-transactions-updated', handleLocalTransactionsUpdated);
      window.removeEventListener('local-transaction-added', handleLocalTransactionsUpdated);
    };
  }, []);
  
  // Forçar recarregamento quando o mês ou ano selecionado mudar
  useEffect(() => {
    console.log(`Seleção alterada: ${selectedMonth} ${selectedYear}`);
    // Recarregar transações locais quando o mês ou ano mudar
    const storedTransactions = localStorage.getItem('local_transactions');
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions);
        setLocalTransactions(parsedTransactions);
        console.log('Transações locais recarregadas após mudança de mês/ano');
      } catch (error) {
        console.error('Erro ao recarregar transações locais:', error);
      }
    }
  }, [selectedMonth, selectedYear, selectedPeriod]);

  // Versão simplificada e mais direta da função de filtragem
  const filterExpensesByPeriod = (transactions: Transaction[], period: string, selectedMonth: typeof months[number], selectedYear: string, selectedWeek: WeekNumber = '1') => {
    // Converter o mês selecionado para índice (0-11)
    const selectedMonthIndex = months.indexOf(selectedMonth);
    const selectedYearNumber = parseInt(selectedYear);
    
    console.log(`Filtrando transações para: ${selectedMonth} ${selectedYear} (Mês ${selectedMonthIndex})`);
    console.log(`Total de transações a filtrar: ${transactions.length}`);
    
    // Filtrar as transações
    const filtered = transactions.filter(t => {
      // Verificar se é uma despesa
      const isExpense = expenseCategories.includes(t.category);
      if (!isExpense) return false;
      
      // Converter a data da transação
      const date = new Date(t.date);
      const transactionMonth = date.getMonth();
      const transactionYear = date.getFullYear();
      
      // Verificar se a transação é do Weekly Budget
      const isWeeklyBudget = t.origin === 'Weekly Budget';
      
      // Lógica de filtragem baseada no período
      let shouldInclude = false;
      
      switch (period) {
        case 'Month':
          // Verificar se o mês e ano correspondem
          shouldInclude = (transactionMonth === selectedMonthIndex && 
                          transactionYear === selectedYearNumber);
          
          // Para transações do Weekly Budget, verificar também os metadados
          if (isWeeklyBudget && !shouldInclude && 'metadata' in t) {
            const metadata = (t as any).metadata;
            if (metadata && metadata.sourceMonth) {
              // Verificar se o mês de origem corresponde ao mês selecionado
              const sourceMonthIndex = months.indexOf(metadata.sourceMonth);
              const sourceYear = metadata.sourceYear;
              
              shouldInclude = (sourceMonthIndex === selectedMonthIndex && 
                              sourceYear === selectedYearNumber);
            }
          }
          break;
          
        case 'Year':
          shouldInclude = transactionYear === selectedYearNumber;
          break;
          
        // Outros casos (Day, Week) - atualizar a lógica para usar a semana selecionada
        default:
          const now = new Date();
          if (period === 'Day') {
            shouldInclude = date.toDateString() === now.toDateString();
          } else if (period === 'Week') {
            // Usar a semana selecionada no mês e ano selecionados
            const weekNum = parseInt(selectedWeek);
            const dayOfMonth = date.getDate();
            const weekOfMonth = Math.ceil(dayOfMonth / 7);
            shouldInclude = transactionMonth === selectedMonthIndex && 
                          transactionYear === selectedYearNumber &&
                          weekOfMonth === weekNum;
          }
          break;
      }
      
      // Log para transações do Weekly Budget
      if (isWeeklyBudget) {
        console.log(`Transação do Weekly Budget: ${t.description}`);
        console.log(`Data: ${date.toLocaleDateString()}, Mês: ${transactionMonth}, Ano: ${transactionYear}`);
        console.log(`Incluir? ${shouldInclude ? 'SIM' : 'NÃO'}`);
      }
      
      return shouldInclude;
    });
    
    console.log(`Transações filtradas: ${filtered.length}`);
    return filtered;
  };

  const calculateTotal = (transactions: Transaction[]) => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  // Calculate formula3 data based on filtered expenses
  const getFormula3Data = (transactions: Transaction[]) => {
    const fixedExpenses = transactions
      .filter(t => t.category === 'Fixed')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const variableExpenses = transactions
      .filter(t => t.category === 'Variable')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const investments = transactions
      .filter(t => t.category === 'Investment')
      .reduce((sum, t) => sum + t.amount, 0);
  
    // Usar o total de gastos como base para os targets
    const totalExpensesAndInvestments = fixedExpenses + variableExpenses + investments;
    const targetTotal = Math.max(totalExpensesAndInvestments, 0);
  
    // Garantir que todos os valores sejam positivos para cálculos percentuais
    const safeFixedExpenses = Math.max(0, fixedExpenses);
    const safeVariableExpenses = Math.max(0, variableExpenses);
    const safeInvestments = Math.max(0, investments);
    
    return {
      fixed: {
        current: fixedExpenses,
        target: targetTotal * 0.5,
        percentage: targetTotal ? (safeFixedExpenses / targetTotal) * 100 : 0
      },
      variable: {
        current: variableExpenses,
        target: targetTotal * 0.3,
        percentage: targetTotal ? (safeVariableExpenses / targetTotal) * 100 : 0
      },
      investments: {
        current: investments,
        target: targetTotal * 0.2,
        percentage: targetTotal ? (safeInvestments / targetTotal) * 100 : 0
      }
    };
  };

  // Combinar transações do banco de dados com transações locais
  const allTransactions = useMemo(() => {
    // Garantir que ambos são arrays antes de tentar combinar
    const dbTransactions = Array.isArray(transactions) ? transactions : [];
    const localTxs = Array.isArray(localTransactions) ? localTransactions : [];
    
    // Combinar as transações
    const combined = [...dbTransactions, ...localTxs];
    
    console.log(`Total de transações combinadas: ${combined.length}`);
    console.log(`- Transações do banco de dados: ${dbTransactions.length}`);
    console.log(`- Transações locais: ${localTxs.length}`);
    
    return combined;
  }, [transactions, localTransactions]);
  
  const filteredExpenses = useMemo(() => {
    return filterExpensesByPeriod(allTransactions, selectedPeriod, selectedMonth, selectedYear, selectedWeek);
  }, [allTransactions, selectedPeriod, selectedMonth, selectedYear, selectedWeek]);

  const expensesByCategory = useMemo(() => {
    const groupedExpenses = filteredExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupedExpenses).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredExpenses]);
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-[#120B39] text-white">
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#120B39] rounded-b-[40px]"></div>
          <div className="relative px-4 pt-12 pb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold">Expenses Overview</h1>
              <button 
                onClick={() => setIsNotificationModalOpen(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-6 mt-6">
        {/* Period Selection */}
        <div className="flex flex-col gap-4">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedWeek={selectedWeek}
            onPeriodChange={setSelectedPeriod}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onWeekChange={setSelectedWeek}
          />
        </div>

        {/* Period Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weekly Summary */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Weekly</h2>
                <p className="text-2xl font-bold text-primary-600 mt-1">
                  {formatCurrency(calculateTotal(filterExpensesByPeriod(transactions, 'Week', selectedMonth, selectedYear, selectedWeek)))}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Monthly</h2>
                <p className="text-2xl font-bold text-secondary-600 mt-1">
                  {formatCurrency(calculateTotal(filterExpensesByPeriod(transactions, 'Month', selectedMonth, selectedYear, selectedWeek)))}
                </p>
              </div>
            </div>
          </div>

          {/* Annual Summary */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Annual</h2>
                <p className="text-2xl font-bold text-accent-600 mt-1">
                  {formatCurrency(calculateTotal(filterExpensesByPeriod(transactions, 'Year', selectedMonth, selectedYear, selectedWeek)))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Distribution Chart */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-bold mb-6">Expense Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ background: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Formula 3 Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-bold mb-6">Formula 3 Distribution (50-30-20)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fixed Expenses */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900">Fixed Expenses (50%)</h3>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Current</span>
                  <span className="text-sm font-medium">{formatCurrency(getFormula3Data(filteredExpenses).fixed.current)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Target</span>
                  <span className="text-sm font-medium">{formatCurrency(getFormula3Data(filteredExpenses).fixed.target)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(getFormula3Data(filteredExpenses).fixed.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">{getFormula3Data(filteredExpenses).fixed.percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Variable Expenses */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900">Variable Expenses (30%)</h3>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Current</span>
                  <span className="text-sm font-medium">{formatCurrency(getFormula3Data(filteredExpenses).variable.current)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Target</span>
                  <span className="text-sm font-medium">{formatCurrency(getFormula3Data(filteredExpenses).variable.target)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-orange-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(getFormula3Data(filteredExpenses).variable.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">{getFormula3Data(filteredExpenses).variable.percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Investments */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900">Investments (20%)</h3>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Current</span>
                  <span className="text-sm font-medium">{formatCurrency(getFormula3Data(filteredExpenses).investments.current)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Target</span>
                  <span className="text-sm font-medium">{formatCurrency(getFormula3Data(filteredExpenses).investments.target)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(getFormula3Data(filteredExpenses).investments.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">{getFormula3Data(filteredExpenses).investments.percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No transactions found
              </div>
            ) : (
              filteredExpenses.map((transaction, index) => (
                <div 
                  key={`${transaction.id}-${index}`} 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
                        <ArrowDownCircle className="h-5 w-5 text-error-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-error-600">
                      -{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
      
      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {/* Notification Modal */}
      <NotificationModal 
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)} 
      />
    </div>
  );
}
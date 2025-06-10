import { useState, useEffect } from 'react';
import { checkRefreshFlag, clearRefreshFlag, REFRESH_FLAGS } from '../utils/dataRefreshService';
import { DollarSign, Wallet, PiggyBank } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Formula3 from '../components/home/Formula3';
import TopGoals from '../components/home/TopGoals';
import TransactionModal from '../components/modals/TransactionModal';
import PeriodSelector from '../components/common/PeriodSelector';
import PeriodSummaryCards from '../components/dashboard/PeriodSummaryCards';
import { useTransactionStore } from '../stores/transactionStore';
import { useIncomeStore } from '../stores/incomeStore';
import { startOfDay, endOfDay } from 'date-fns';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';







interface CategoryTotals {
  Income: number;
  Investment: number;
  Fixed: number;
  Variable: number;
  Extra: number;
  Additional: number;
  Tax: number;
  Invoices: number;
  Contribution: number;
  Goal: number;
}

interface FinancialSummary {
  totalIncome: number;
  totalSpent: number;
  categoryTotals: CategoryTotals;
}

type Period = 'Day' | 'Week' | 'Month' | 'Year';
type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
type WeekNumber = '1' | '2' | '3' | '4' | '5';

export default function Dashboard() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const { totalIncome, fetchTotalIncome } = useIncomeStore();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  
  // Get current date information
  const getCurrentMonth = (): Month => {
    const months: Month[] = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[new Date().getMonth()];
  };
  
  const getCurrentYear = (): string => {
    return new Date().getFullYear().toString();
  };
  
  const getCurrentWeek = (): WeekNumber => {
    const date = new Date();
    const dayOfMonth = date.getDate();
    // Calculate which week of the month we're in (1-5)
    const weekNumber = Math.ceil(dayOfMonth / 7);
    return weekNumber > 5 ? '5' : weekNumber.toString() as WeekNumber;
  };
  
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Week');
  const [selectedMonth, setSelectedMonth] = useState<Month>(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [selectedWeek, setSelectedWeek] = useState<WeekNumber>(getCurrentWeek());
  const [dataRefreshed, setDataRefreshed] = useState(false);

  // Check for data refresh flags and reload data as needed
  useEffect(() => {
    const needsRefresh = checkRefreshFlag(REFRESH_FLAGS.ALL) || 
                         checkRefreshFlag(REFRESH_FLAGS.TRANSACTIONS) || 
                         checkRefreshFlag(REFRESH_FLAGS.INCOME);
    
    if (needsRefresh && !dataRefreshed) {
      console.log('Refreshing Dashboard data...');
      // Fetch fresh data
      fetchTransactions();
      fetchTotalIncome();
      
      // Clear the flags after refresh
      clearRefreshFlag(REFRESH_FLAGS.TRANSACTIONS);
      clearRefreshFlag(REFRESH_FLAGS.INCOME);
      
      // Mark as refreshed to prevent multiple refreshes
      setDataRefreshed(true);
    }
  }, [fetchTransactions, fetchTotalIncome, dataRefreshed]);
  
  // Meses e anos são gerenciados pelo componente PeriodSelector

  useEffect(() => {
    fetchTransactions();
    fetchTotalIncome();
    
    // Listener para atualizações do Weekly Budget
    const handleWeeklyBudgetUpdate = () => {
      console.log('Dashboard detected weekly-budget-updated event');
      fetchTransactions();
      fetchTotalIncome();
      setDataRefreshed(true);
    };
    
    // Adicionar listener para o evento weekly-budget-updated
    window.addEventListener('weekly-budget-updated', handleWeeklyBudgetUpdate);
    
    // Remover listener quando o componente for desmontado
    return () => {
      window.removeEventListener('weekly-budget-updated', handleWeeklyBudgetUpdate);
    };
  }, [fetchTransactions, fetchTotalIncome]);
  
  // Recarregar dados quando o período, mês, semana ou ano mudar
  useEffect(() => {
    console.log(`Período mudou: ${selectedPeriod}, Mês: ${selectedMonth}, Ano: ${selectedYear}, Semana: ${selectedWeek}`);
    // Forçar recarga dos dados
    fetchTransactions();
    fetchTotalIncome();
    // Resetar o estado de dados atualizados
    setDataRefreshed(false);
  }, [selectedPeriod, selectedMonth, selectedYear, fetchTransactions, fetchTotalIncome]);

  // Converter nome do mês para número (0-11)
  const getMonthNumber = (monthName: string): number => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  };

  // Filter transactions by selected period
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const today = new Date();
    const selectedMonthIndex = getMonthNumber(selectedMonth);
    const selectedYearNumber = parseInt(selectedYear);
    const selectedWeekNumber = parseInt(selectedWeek);
    
    // Log para debug
    console.log(`Dashboard - Filtering transactions:`);
    console.log(`- Selected Period: ${selectedPeriod}`);
    console.log(`- Selected Month: ${selectedMonth} (index: ${selectedMonthIndex})`);
    console.log(`- Selected Year: ${selectedYear}`);
    console.log(`- Selected Week: ${selectedWeek}`);
    console.log(`- Transaction date: ${transactionDate.toISOString()}`);
    console.log(`- Transaction metadata:`, transaction.metadata);
    console.log(`- Is recent:`, transaction.is_recent);
    
    // Verificar se o ano é 2025 ou posterior
    if (transactionDate.getFullYear() < 2025) {
      return false; // Não mostrar dados anteriores a 2025
    }
    
    switch (selectedPeriod) {
      case 'Day':
        return transactionDate >= startOfDay(today) && transactionDate <= endOfDay(today);
      case 'Week':
        // Filtrar pela semana selecionada no mês e ano selecionados
        const dayOfMonth = transactionDate.getDate();
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        
        // Verificar metadata para transações do Weekly Budget
        if (transaction.metadata && transaction.metadata.week) {
          const weekMatch = transaction.metadata.week === `Week ${selectedWeekNumber}`;
          const monthMatch = transaction.metadata.month === selectedMonth;
          const yearMatch = transaction.metadata.year === selectedYearNumber;
          
          if (weekMatch && monthMatch && yearMatch) {
            return true;
          }
        }
        
        return transactionDate.getMonth() === selectedMonthIndex && 
               transactionDate.getFullYear() === selectedYearNumber &&
               weekOfMonth === selectedWeekNumber;
      case 'Month':
        // Usar o mês e ano selecionados
        // Verificar metadata para transações do Weekly Budget
        if (transaction.metadata && transaction.metadata.month) {
          const monthMatch = transaction.metadata.month === selectedMonth;
          const yearMatch = transaction.metadata.year === selectedYearNumber;
          
          if (monthMatch && yearMatch) {
            return true;
          }
        }
        
        return transactionDate.getMonth() === selectedMonthIndex && 
               transactionDate.getFullYear() === selectedYearNumber;
      case 'Year':
        // Usar o ano selecionado
        // Verificar metadata para transações do Weekly Budget
        if (transaction.metadata && transaction.metadata.year) {
          return transaction.metadata.year === selectedYearNumber;
        }
        
        return transactionDate.getFullYear() === selectedYearNumber;
      default:
        return true;
    }
  });

  // Check if there are any transactions for the selected period
  const hasTransactions = filteredTransactions.length > 0;
  
  // Calculate financial summary only if there are transactions
  const financialSummary = hasTransactions ? filteredTransactions.reduce<FinancialSummary>((summary, transaction) => {
    const category = transaction.category;
    if (category in summary.categoryTotals) {
      summary.categoryTotals[category] += transaction.amount;
      if (transaction.type === 'expense') {
        summary.totalSpent += transaction.amount;
      }
    }
    return summary;
  }, {
    totalIncome: totalIncome,
    totalSpent: 0,
    categoryTotals: {
      Income: 0,
      Investment: 0,
      Fixed: 0,
      Variable: 0,
      Extra: 0,
      Additional: 0,
      Tax: 0,
      Invoices: 0,
      Contribution: 0,
      Goal: 0
    }
  }) : {
    totalIncome: 0,
    totalSpent: 0,
    categoryTotals: {
      Income: 0,
      Investment: 0,
      Fixed: 0,
      Variable: 0,
      Extra: 0,
      Additional: 0,
      Tax: 0,
      Invoices: 0,
      Contribution: 0,
      Goal: 0
    }
  };

  const COLORS = ['#A855F7', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

  const chartData = Object.entries(financialSummary.categoryTotals)
    .filter(([category, amount]) => category !== 'Income' && amount > 0)
    .map(([category, amount], index) => ({
      name: category,
      value: amount,
      color: COLORS[index % COLORS.length]
    }));

  const fixedExpenses = transactions
    .filter(t => t.category === 'Fixed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const variableExpenses = transactions
    .filter(t => t.category === 'Variable')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const investments = transactions
    .filter(t => t.category === 'Investment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpensesAndInvestments = fixedExpenses + variableExpenses + investments;
  const targetTotal = Math.max(totalExpensesAndInvestments, totalIncome);

  // Garantir que todos os valores sejam positivos para cálculos percentuais
  const safeFixedExpenses = Math.max(0, fixedExpenses);
  const safeVariableExpenses = Math.max(0, variableExpenses);
  const safeInvestments = Math.max(0, investments);
  
  const formula3Data = {
    fixed: {
      current: fixedExpenses, // Manter o valor original para exibição
      target: targetTotal * 0.5,
      percentage: targetTotal ? (safeFixedExpenses / targetTotal) * 100 : 0
    },
    variable: {
      current: variableExpenses, // Manter o valor original para exibição
      target: targetTotal * 0.3,
      percentage: targetTotal ? (safeVariableExpenses / targetTotal) * 100 : 0
    },
    investments: {
      current: investments, // Manter o valor original para exibição
      target: targetTotal * 0.2,
      percentage: targetTotal ? (safeInvestments / targetTotal) * 100 : 0
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader 
        title="Dashboard" 
        showBackButton={false}
        showMoreOptions={true}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-4 mb-6 shadow-card">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedWeek={selectedWeek}
            onPeriodChange={setSelectedPeriod}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onWeekChange={setSelectedWeek}
            useShortMonthNames={true}
          />
        </div>
        
        {hasTransactions ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <PeriodSummaryCards period="Weekly" selectedMonth={selectedMonth} selectedYear={selectedYear} />
          <PeriodSummaryCards period="Monthly" selectedMonth={selectedMonth} selectedYear={selectedYear} />
          <PeriodSummaryCards period="Annual" selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="py-8">
            <p className="text-gray-500 text-center">
              No financial data available for {selectedPeriod === 'Week' ? `Week ${selectedWeek}` : ''} {selectedMonth} {selectedYear}.<br/>
              Try selecting a different period or add new transactions.
            </p>
          </div>
        </div>
      )}

        {/* Period Summary Cards - Weekly, Monthly, Annual */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-blue-900">Total Income</h3>
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-700">${financialSummary.totalIncome.toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-1">All income this period</p>
          </div>

          <div className="bg-green-50 rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-green-900">Total Spent</h3>
              <Wallet className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-700">${financialSummary.totalSpent.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">Total expenses this period</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-purple-900">Balance</h3>
              <PiggyBank className="h-6 w-6 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-700">${(financialSummary.totalIncome - financialSummary.totalSpent).toLocaleString()}</p>
            <p className="text-sm text-purple-600 mt-1">Available balance</p>
          </div>
        </div>

        <div className="mb-8">
          <Formula3 data={formula3Data} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Expense Distribution</h2>
          <div className="bg-white rounded-xl p-6 shadow-card">
            {chartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend
                      formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p>No expenses recorded yet</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <TopGoals />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          {hasTransactions ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.slice(0, 5).map((transaction, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8">
              <p className="text-gray-500 text-center">
                No transactions found for the selected period.<br/>
                Try selecting a different period or add new transactions.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
          {hasTransactions && chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500 text-center">
                No expense data available for the selected period.<br/>
                Try selecting a different period or add new transactions.
              </p>
            </div>
          )}
        </div>
        
        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
              <h2 className="text-xl font-bold mb-4">Add New Transaction</h2>
              <button
                className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setShowTransactionForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {showTransactionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
              <h2 className="text-xl font-bold mb-4">Add New Transaction</h2>
              <TransactionModal 
                isOpen={showTransactionForm}
                onClose={() => setShowTransactionForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
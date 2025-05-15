import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { checkRefreshFlag, clearRefreshFlag, REFRESH_FLAGS } from '../utils/dataRefreshService';
import { DollarSign, Wallet, PiggyBank, ChevronRight, PlusCircle } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Formula3 from '../components/home/Formula3';
import TopGoals from '../components/home/TopGoals';
import TransactionModal from '../components/modals/TransactionModal';
import PeriodSelector from '../components/common/PeriodSelector';
import PeriodSummary from '../components/dashboard/PeriodSummary';
import { useTransactionStore } from '../stores/transactionStore';
import { useIncomeStore } from '../stores/incomeStore';
import { startOfDay, endOfDay, subDays } from 'date-fns';
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

export default function Dashboard() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const { totalIncome, fetchTotalIncome } = useIncomeStore();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Day');
  const [selectedMonth, setSelectedMonth] = useState<Month>('May');
  const [selectedYear, setSelectedYear] = useState('2025');
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
  }, [fetchTransactions, fetchTotalIncome]);
  
  // Recarregar dados quando o período, mês ou ano mudar
  useEffect(() => {
    console.log(`Período mudou: ${selectedPeriod}, Mês: ${selectedMonth}, Ano: ${selectedYear}`);
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
    
    // Log para debug
    console.log(`Dashboard - Filtering transactions:`);
    console.log(`- Selected Period: ${selectedPeriod}`);
    console.log(`- Selected Month: ${selectedMonth} (index: ${selectedMonthIndex})`);
    console.log(`- Selected Year: ${selectedYear}`);
    console.log(`- Transaction date: ${transactionDate.toISOString()}`);
    
    switch (selectedPeriod) {
      case 'Day':
        return transactionDate >= startOfDay(today) && transactionDate <= endOfDay(today);
      case 'Week':
        return transactionDate >= subDays(today, 7);
      case 'Month':
        // Usar o mês e ano selecionados
        return transactionDate.getMonth() === selectedMonthIndex && 
               transactionDate.getFullYear() === selectedYearNumber;
      case 'Year':
        // Usar o ano selecionado
        return transactionDate.getFullYear() === selectedYearNumber;
      default:
        return true;
    }
  });

  // Calculate financial summary
  const financialSummary = filteredTransactions.reduce<FinancialSummary>((summary, transaction) => {
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
  });

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
            onPeriodChange={setSelectedPeriod}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button 
              className="btn btn-primary flex-1 sm:flex-none"
              onClick={() => setShowTransactionForm(true)}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add New
            </button>
          </div>
        </div>

        {/* Period Summary Cards - Weekly, Monthly, Annual */}
        <PeriodSummary selectedMonth={selectedMonth} selectedYear={selectedYear} />

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
                      {chartData.map((_entry, index) => (
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

        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Recent Statement</h2>
            <Link to="/statement" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-8 text-center text-gray-500">
              <p>No transactions recorded</p>
              <Link 
                to="/transactions" 
                className="mt-2 inline-block text-primary-600 hover:text-primary-700 font-medium"
              >
                Add your first transaction →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Recent Variables</h2>
            <Link to="/variables" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-8 text-center text-gray-500">
              <p>No variable expenses recorded</p>
              <Link 
                to="/variables" 
                className="mt-2 inline-block text-primary-600 hover:text-primary-700 font-medium"
              >
                Add your first variable expense →
              </Link>
            </div>
          </div>
        </div>

        {/* Spending Overview Chart */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-8">
          <h2 className="text-xl font-bold mb-6">Spending Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
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
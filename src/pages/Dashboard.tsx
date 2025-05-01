import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { useGoalsStore } from '../stores/goalsStore';
import { PlusCircle, Download, ChevronRight, DollarSign, Wallet, PiggyBank, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import TransactionForm from '../components/forms/TransactionForm';
import BottomNavigation from '../components/layout/BottomNavigation';
import PageHeader from '../components/layout/PageHeader';
import Formula3 from '../components/home/Formula3';
import TopGoals from '../components/home/TopGoals';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import classNames from 'classnames';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

const CHART_COLORS = {
  income: '#4F46E5',    // Primary blue
  fixed: '#10B981',     // Green
  variable: '#7C3AED',  // Purple
  extra: '#F59E0B',     // Orange
  additional: '#EC4899', // Pink
};

type Period = 'day' | 'week' | 'month' | 'year';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['2022', '2023', '2024', '2025'];

export default function Dashboard() {
  const { supabase } = useSupabase();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { goals, fetchGoals } = useGoalsStore();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  
  useEffect(() => {
    fetchTransactions(supabase);
    fetchGoals(supabase);
  }, [fetchTransactions, fetchGoals, supabase]);

  // Filter transactions by selected period
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const today = new Date();
    
    switch (selectedPeriod) {
      case 'day':
        return transactionDate >= startOfDay(today) && transactionDate <= endOfDay(today);
      case 'week':
        return transactionDate >= subDays(today, 7);
      case 'month':
        return transactionDate >= new Date(today.getFullYear(), today.getMonth(), 1);
      case 'year':
        return transactionDate >= new Date(today.getFullYear(), 0, 1);
      default:
        return true;
    }
  });

  // Calculate financial summary
  const financialSummary = filteredTransactions.reduce((summary, transaction) => {
    if (transaction.type === 'income') {
      summary.totalIncome += transaction.amount;
    } else {
      summary.totalSpent += transaction.amount;
      summary.categoryTotals[transaction.category] = (summary.categoryTotals[transaction.category] || 0) + transaction.amount;
    }
    return summary;
  }, {
    totalIncome: 0,
    totalSpent: 0,
    categoryTotals: {},
  });

  const balance = financialSummary.totalIncome - financialSummary.totalSpent;

  // Calculate Formula3 data
  const formula3Data = {
    fixed: {
      current: financialSummary.categoryTotals.fixed || 0,
      target: financialSummary.totalIncome * 0.5,
      percentage: ((financialSummary.categoryTotals.fixed || 0) / (financialSummary.totalIncome * 0.5)) * 100
    },
    variable: {
      current: financialSummary.categoryTotals.variable || 0,
      target: financialSummary.totalIncome * 0.3,
      percentage: ((financialSummary.categoryTotals.variable || 0) / (financialSummary.totalIncome * 0.3)) * 100
    },
    investments: {
      current: financialSummary.categoryTotals.investments || 0,
      target: financialSummary.totalIncome * 0.2,
      percentage: ((financialSummary.categoryTotals.investments || 0) / (financialSummary.totalIncome * 0.2)) * 100
    }
  };

  // Prepare data for pie chart
  const chartData = [
    { name: 'Income', value: financialSummary.totalIncome, color: CHART_COLORS.income },
    { name: 'Fixed', value: financialSummary.categoryTotals.fixed || 0, color: CHART_COLORS.fixed },
    { name: 'Variable', value: financialSummary.categoryTotals.variable || 0, color: CHART_COLORS.variable },
    { name: 'Extra', value: financialSummary.categoryTotals.extra || 0, color: CHART_COLORS.extra },
    { name: 'Additional', value: financialSummary.categoryTotals.additional || 0, color: CHART_COLORS.additional },
  ];

  // Get recent transactions
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Get recent variable expenses
  const recentVariables = transactions
    .filter(t => t.category === 'Variable')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'),
        `"${t.origin.replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        t.category
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `statement_${selectedPeriod}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader 
        title="Dashboard" 
        showBackButton={false}
        showMoreOptions={true}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Period Selection */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-3 items-center flex-wrap">
            {(['day', 'week', 'month', 'year'] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={classNames(
                  'px-4 py-1 rounded-full text-sm font-medium border',
                  selectedPeriod === period
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'text-gray-700 border-gray-300 hover:border-purple-300'
                )}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {selectedPeriod === 'month' && (
            <div className="flex flex-wrap gap-2">
              {months.map(month => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={classNames(
                    'px-3 py-1 rounded-md text-sm border',
                    selectedMonth === month ? 'bg-purple-500 text-white border-purple-600' : 'text-gray-700 border-gray-300'
                  )}
                >
                  {month}
                </button>
              ))}
            </div>
          )}

          {selectedPeriod === 'year' && (
            <div className="flex flex-wrap gap-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={classNames(
                    'px-3 py-1 rounded-md text-sm border',
                    selectedYear === year ? 'bg-purple-500 text-white border-purple-600' : 'text-gray-700 border-gray-300'
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
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
            <button 
              className="btn btn-outline flex-1 sm:flex-none"
              onClick={exportToCSV}
            >
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
        
        {/* Budget Summary Cards */}
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
            <p className="text-2xl font-bold text-purple-700">${balance.toLocaleString()}</p>
            <p className="text-sm text-purple-600 mt-1">Available balance</p>
          </div>
        </div>

        {/* Formula3 */}
        <div className="mb-8">
          <Formula3 data={formula3Data} />
        </div>

        {/* Top Goals */}
        <div className="mb-8">
          <TopGoals />
        </div>

        {/* Recent Statement */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Recent Statement</h2>
            <Link to="/statement" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-success-100 text-success-600' : 'bg-error-100 text-error-600'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="h-5 w-5" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.origin}</p>
                    <p className="text-sm text-gray-500">{format(new Date(transaction.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'income' ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{transaction.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Variables */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Recent Variables</h2>
            <Link to="/variables" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentVariables.length > 0 ? (
              recentVariables.map(variable => (
                <div key={variable.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <ArrowDownCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{variable.origin}</p>
                      <p className="text-sm text-gray-500">{format(new Date(variable.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-purple-600">
                      -${variable.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Variable</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No variable expenses recorded</p>
                <Link 
                  to="/variables" 
                  className="mt-2 inline-block text-primary-600 hover:text-primary-700 font-medium"
                >
                  Add your first variable expense →
                </Link>
              </div>
            )}
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
              <h2 className="text-xl font-bold mb-4">Add New Entry</h2>
              <TransactionForm 
                onSuccess={() => setShowTransactionForm(false)}
              />
              <button 
                className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setShowTransactionForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <BottomNavigation />
      </div>
    </div>
  );
}
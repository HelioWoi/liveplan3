import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { Transaction, TransactionCategory } from '../types/transaction';
import { ArrowLeft, Bell, Calendar, ArrowDownCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import PeriodSelector from '../components/common/PeriodSelector';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

export default function ExpensesPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [selectedMonth, setSelectedMonth] = useState<typeof months[number]>(months[new Date().getMonth()]);

  const expenseCategories: TransactionCategory[] = ['Fixed', 'Variable', 'Extra', 'Investimento'];
  const COLORS = ['#A855F7', '#F59E0B', '#10B981', '#3B82F6'];

  const filterExpensesByPeriod = (transactions: Transaction[], period: string, selectedMonth: typeof months[number]) => {
    const now = new Date();
    return transactions.filter(t => {
      const date = new Date(t.date);
      const isExpense = expenseCategories.includes(t.category);
      
      if (!isExpense) return false;

      switch (period) {
        case 'Day':
          return date.toDateString() === now.toDateString();
        case 'Week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          return date >= weekStart && date <= now;
        case 'Month':
          return date.getMonth() === months.indexOf(selectedMonth) && date.getFullYear() === now.getFullYear();
        case 'Year':
          return date.getFullYear() === now.getFullYear();
        default:
          return false;
      }
    });
  };

  const calculateTotal = (transactions: Transaction[]) => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const filteredExpenses = useMemo(() => {
    return filterExpensesByPeriod(transactions, selectedPeriod, selectedMonth);
  }, [transactions, selectedPeriod, selectedMonth]);

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
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
            onPeriodChange={setSelectedPeriod}
            onMonthChange={setSelectedMonth}
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
                  {formatCurrency(calculateTotal(filterExpensesByPeriod(transactions, 'Week', selectedMonth)))}
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
                  {formatCurrency(calculateTotal(filterExpensesByPeriod(transactions, 'Month', selectedMonth)))}
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
                  {formatCurrency(calculateTotal(filterExpensesByPeriod(transactions, 'Year', selectedMonth)))}
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
                  {expensesByCategory.map((entry, index) => (
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

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No transactions found
              </div>
            ) : (
              filteredExpenses.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
                        <ArrowDownCircle className="h-5 w-5 text-error-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.origin}</p>
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
    </div>
  );
}
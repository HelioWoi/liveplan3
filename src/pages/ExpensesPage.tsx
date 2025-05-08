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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const expenseCategories: TransactionCategory[] = ['Fixed', 'Variable', 'Extra', 'Investment', 'Tax', 'Additional', 'Contribution', 'Goal'];
  const COLORS = ['#A855F7', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6'];

  const filterExpensesByPeriod = (transactions: Transaction[], period: string, selectedMonth: typeof months[number], selectedYear: string) => {
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
          const weekEnd = new Date(now);
          return date >= weekStart && date <= weekEnd;
        case 'Month':
          return date.getMonth() === months.indexOf(selectedMonth) && date.getFullYear().toString() === selectedYear;
        case 'Year':
          return date.getFullYear().toString() === selectedYear;
        default:
          return false;
      }
    });
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
  
    return {
      fixed: {
        current: fixedExpenses,
        target: targetTotal * 0.5,
        percentage: targetTotal ? (fixedExpenses / targetTotal) * 100 : 0
      },
      variable: {
        current: variableExpenses,
        target: targetTotal * 0.3,
        percentage: targetTotal ? (variableExpenses / targetTotal) * 100 : 0
      },
      investments: {
        current: investments,
        target: targetTotal * 0.2,
        percentage: targetTotal ? (investments / targetTotal) * 100 : 0
      }
    };
  };

  const filteredExpenses = useMemo(() => {
    return filterExpensesByPeriod(transactions, selectedPeriod, selectedMonth, selectedYear);
  }, [transactions, selectedPeriod, selectedMonth, selectedYear]);

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
            selectedYear={selectedYear}
            onPeriodChange={setSelectedPeriod}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
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
                  {formatCurrency(calculateTotal(filterExpensesByPeriod(transactions, 'Week', selectedMonth, selectedYear)))}
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
                  {formatCurrency(calculateTotal(filterExpensesByPeriod(transactions, 'Month', selectedMonth, selectedYear)))}
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
                  {formatCurrency(calculateTotal(filterExpensesByPeriod(transactions, 'Year', selectedMonth, selectedYear)))}
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
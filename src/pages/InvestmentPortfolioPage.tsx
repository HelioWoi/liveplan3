import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { Transaction } from '../types/transaction';
import { ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import PeriodSelector from '../components/common/PeriodSelector';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

export default function InvestmentPortfolioPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [selectedMonth, setSelectedMonth] = useState<typeof months[number]>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState('2022');

  const COLORS = ['#A855F7', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6'];

  const filterInvestmentsByPeriod = (transactions: Transaction[], period: string, selectedMonth: typeof months[number], selectedYear: string) => {
    const now = new Date();
    return transactions.filter(t => {
      const date = new Date(t.date);
      const isInvestment = t.category === 'Investimento';
      
      if (!isInvestment) return false;

      switch (period) {
        case 'Day':
          return date.toDateString() === now.toDateString();
        case 'Week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          return date >= weekStart && date <= now;
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

  const filteredInvestments = useMemo(() => {
    return filterInvestmentsByPeriod(transactions, selectedPeriod, selectedMonth, selectedYear);
  }, [transactions, selectedPeriod, selectedMonth, selectedYear]);

  const investmentsByOrigin = useMemo(() => {
    const groupedInvestments = filteredInvestments.reduce((acc, t) => {
      const origin = t.origin || 'Other';
      if (!acc[origin]) {
        acc[origin] = 0;
      }
      acc[origin] += t.amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(groupedInvestments).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredInvestments]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Investment Portfolio</h1>
          </div>

          <PeriodSelector
            selectedPeriod={selectedPeriod}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onPeriodChange={setSelectedPeriod}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 p-4">
          {/* Weekly */}
          <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <ArrowLeft className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Weekly</h2>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {formatCurrency(calculateTotal(filterInvestmentsByPeriod(transactions, 'Week', selectedMonth, selectedYear)))}
              </p>
            </div>
          </div>

          {/* Monthly */}
          <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <ArrowLeft className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Monthly</h2>
              <p className="text-2xl font-bold text-secondary-600 mt-1">
                {formatCurrency(calculateTotal(filterInvestmentsByPeriod(transactions, 'Month', selectedMonth, selectedYear)))}
              </p>
            </div>
          </div>

          {/* Annual */}
          <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
            <div className="p-3 bg-accent-100 rounded-lg">
              <ArrowLeft className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Annual</h2>
              <p className="text-2xl font-bold text-accent-600 mt-1">
                {formatCurrency(calculateTotal(filterInvestmentsByPeriod(transactions, 'Year', selectedMonth, selectedYear)))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Chart */}
        <div className="bg-white rounded-xl border p-4 mb-4">
          <h2 className="text-xl font-bold mb-4">Investment Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={investmentsByOrigin}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {investmentsByOrigin.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Recent Investments</h2>
          </div>
          <div className="divide-y">
            {filteredInvestments.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No investments found
              </div>
            ) : (
              filteredInvestments.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{transaction.origin || 'Other'}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-primary-600">
                      {formatCurrency(transaction.amount)}
                    </p>
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

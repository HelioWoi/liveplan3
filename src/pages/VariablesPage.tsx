import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { ArrowLeft, Bell, Calendar, ChevronRight, ArrowUpCircle, ArrowDownCircle, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import classNames from 'classnames';

type Period = 'day' | 'week' | 'month' | 'year';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['2022', '2023', '2024', '2025'];

export default function VariablesPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showAddModal, setShowAddModal] = useState(false);

  // Sample data for the trend chart
  const trendData = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 1400 },
    { month: 'Mar', amount: 1100 },
    { month: 'Apr', amount: 1600 },
    { month: 'May', amount: 1300 },
    { month: 'Jun', amount: 1500 },
  ];

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
              <h1 className="text-2xl font-bold">Variables</h1>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Variables</h3>
            <p className="text-2xl font-bold text-primary-600">$0.00</p>
            <p className="text-sm text-gray-500 mt-1">Current period</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average</h3>
            <p className="text-2xl font-bold text-secondary-600">$0.00</p>
            <p className="text-sm text-gray-500 mt-1">Per month</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Projected</h3>
            <p className="text-2xl font-bold text-accent-600">$0.00</p>
            <p className="text-sm text-gray-500 mt-1">Next month</p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Variable Expenses Trend</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Variable
            </button>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#7C3AED" 
                  strokeWidth={2}
                  dot={{ fill: '#7C3AED' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Variables */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Recent Variables</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No variable expenses recorded</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary mt-4"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Your First Variable
                </button>
              </div>
            ) : (
              transactions
                .filter(t => t.category === 'Variable')
                .map(transaction => (
                  <div key={transaction.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <ArrowDownCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.origin}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-purple-600">
                        ${transaction.amount.toFixed(2)}
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
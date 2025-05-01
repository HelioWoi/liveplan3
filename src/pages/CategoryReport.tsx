import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';

const categoryConfig = {
  extras: {
    title: 'Extras',
    description: 'Discretionary spending and non-essential expenses',
    category: 'Extra',
  },
  additional: {
    title: 'Additional',
    description: 'Other miscellaneous expenses',
    category: 'Additional',
  },
  tax: {
    title: 'Tax',
    description: 'Tax-related expenses and payments',
    category: 'Tax',
  },
};

export default function CategoryReport() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();

  const config = categoryId ? categoryConfig[categoryId as keyof typeof categoryConfig] : null;

  const categoryTransactions = useMemo(() => {
    if (!config) return [];
    
    return transactions
      .filter(t => t.category === config.category && t.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, config]);

  const totalAmount = useMemo(() => {
    return categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [categoryTransactions]);

  // Prepare data for chart
  const chartData = useMemo(() => {
    const data: { date: string; amount: number }[] = [];
    const transactionsByDate = new Map<string, number>();

    categoryTransactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'MMM d');
      const currentAmount = transactionsByDate.get(date) || 0;
      transactionsByDate.set(date, currentAmount + transaction.amount);
    });

    transactionsByDate.forEach((amount, date) => {
      data.push({ date, amount });
    });

    return data.slice(-7); // Show last 7 days
  }, [categoryTransactions]);

  if (!config) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
              <h1 className="text-2xl font-bold">{config.title} Report</h1>
              <div className="w-10"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <p className="text-gray-600 mb-4">{config.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Total Spent</span>
            <span className="text-2xl font-bold text-error-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-card mb-6">
            <h2 className="text-xl font-bold mb-4">Spending Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Transaction History</h2>
          </div>

          {categoryTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {categoryTransactions.map(transaction => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
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
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No transactions found for this category
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
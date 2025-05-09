import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { ArrowLeft, Bell, Download, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import classNames from 'classnames';
import PeriodSelector from '../components/common/PeriodSelector';
import TransactionDetailModal from '../components/modals/TransactionDetailModal';
import { Transaction } from '../types/transaction';

type Period = 'Day' | 'Week' | 'Month' | 'Year';
type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

export default function StatementPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Day');
  const [selectedMonth, setSelectedMonth] = useState<Month>('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  // Calcular saldo inicial, movimentação total e saldo final
  const calculateBalances = () => {
    let openingBalance = 0;
    let totalMovement = 0;
    
    transactions.forEach(transaction => {
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === 'income') {
        totalMovement += amount;
      } else {
        totalMovement -= amount;
      }
    });

    const closingBalance = openingBalance + totalMovement;

    return {
      openingBalance,
      totalMovement,
      closingBalance
    };
  };

  const { openingBalance, totalMovement, closingBalance } = calculateBalances();

  // Calcular saldo acumulado para cada transação
  const calculateRunningBalance = (index: number): number => {
    let balance = openingBalance;
    for (let i = 0; i <= index; i++) {
      const transaction = transactions[i];
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === 'income') {
        balance += amount;
      } else {
        balance -= amount;
      }
    }
    return balance;
  };

  const exportStatement = () => {
    // Implementation for exporting statement
    console.log('Exporting statement...');
  };

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
              <h1 className="text-2xl font-bold">Statement</h1>
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

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
              <button
                onClick={exportStatement}
                className="btn btn-primary"
              >
                <Download className="h-5 w-5 mr-2" />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Add filter options here */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <select className="input">
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <select className="input">
                  <option value="">All Categories</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Variable">Variable</option>
                  <option value="Extra">Extra</option>
                </select>
                <input type="date" className="input" placeholder="Start Date" />
                <input type="date" className="input" placeholder="End Date" />
              </div>
            </div>
          )}
        </div>

        {/* Statement Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Opening Balance</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(openingBalance)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Movement</h3>
            <p className={`text-2xl font-bold ${totalMovement >= 0 ? 'text-success-600' : 'text-error-600'}`}>
              {totalMovement >= 0 ? '+' : ''}{formatCurrency(totalMovement)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Closing Balance</h3>
            <p className={`text-2xl font-bold ${closingBalance >= 0 ? 'text-success-600' : 'text-error-600'}`}>
              {formatCurrency(closingBalance)}
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                   transactions.map((transaction, index) => (
                    <tr 
                      key={transaction.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.origin}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.category}</td>
                      <td className={classNames(
                        "px-6 py-4 whitespace-nowrap text-sm font-medium text-right",
                        transaction.type === 'income' ? 'text-success-600' : 'text-error-600'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                        {formatCurrency(calculateRunningBalance(index))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BottomNavigation />
      
      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}
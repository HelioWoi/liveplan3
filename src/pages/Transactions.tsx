import { useEffect, useState } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import { format } from 'date-fns';
import { Download, FilterX, PlusCircle, Search, Trash2 } from 'lucide-react';
import TransactionModal from '../components/modals/TransactionModal';
import BottomNavigation from '../components/layout/BottomNavigation';
import PageHeader from '../components/layout/PageHeader';
import PeriodButton from '../components/common/PeriodButton';
import { TransactionCategory, isIncomeCategory } from '../types/transaction';
import { formatCurrency } from '../utils/formatters';

export default function Transactions() {
  const { transactions, fetchTransactions, deleteTransaction } = useTransactionStore();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'all'>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [selectedMonth, setSelectedMonth] = useState<string>('April');
  const [showMonths, setShowMonths] = useState(false);
  
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.origin || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handleDeleteTransaction = async (id: string) => {
    setIsDeleting(id);
    
    try {
      await deleteTransaction(id);
    } catch (error) {
      console.error('Failed to delete transaction', error);
    } finally {
      setIsDeleting(null);
    }
  };
  
  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Date', 'Origin', 'Amount', 'Category'];
    const csvContent = [
      headers.join(','),
      ...sortedTransactions.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'),
        `"${(t.origin || '').replace(/"/g, '""')}"`,
        t.amount,
        t.category
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
  };
  
  const getCategoryBadgeClass = (category: string) => {
    const baseClass = 'text-xs font-medium px-2 py-1 rounded';
    switch (category) {
      case 'Fixed':
        return `${baseClass} bg-secondary-100 text-secondary-800`;
      case 'Variable':
        return `${baseClass} bg-accent-100 text-accent-800`;
      case 'Income':
      case 'Investimento':
        return `${baseClass} bg-success-100 text-success-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader 
        title="Transactions" 
        showBackButton={false}
        showMoreOptions={true}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex gap-2">
            <button 
              className="btn btn-primary flex-1 sm:flex-none"
              onClick={() => setShowModal(true)}
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
        
        {/* Period Selection */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-card">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Day', 'Week', 'Month', 'Year'].map(period => (
              <PeriodButton
                key={period}
                onClick={() => {
                  setSelectedPeriod(period as 'Day' | 'Week' | 'Month' | 'Year');
                  if (period === 'Month') {
                    setShowMonths(true);
                  } else {
                    setShowMonths(false);
                  }
                }}
                isActive={selectedPeriod === period}
              >
                {period}
              </PeriodButton>
            ))}
          </div>

          {showMonths && (
            <div className="flex flex-wrap gap-2 mb-4">
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <PeriodButton
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  isActive={selectedMonth === month}
                >
                  {month}
                </PeriodButton>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <select
                className="input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as TransactionCategory | 'all')}
              >
                <option value="all">All Categories</option>
                <option value="Income">Income</option>
                <option value="Investimento">Investment</option>
                <option value="Fixed">Fixed</option>
                <option value="Variable">Variable</option>
                <option value="Extra">Extra</option>
                <option value="Additional">Additional</option>
                <option value="Tax">Tax</option>
              </select>
            </div>
          </div>
          
          {(searchTerm || categoryFilter !== 'all') && (
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {sortedTransactions.length} of {transactions.length} transactions
              </p>
              <button
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                onClick={clearFilters}
              >
                <FilterX className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Transactions List */}
        <div className="bg-white rounded-xl overflow-hidden shadow-card">
          {sortedTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedTransactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.origin || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getCategoryBadgeClass(transaction.category)}>
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <span className={isIncomeCategory(transaction.category) ? 'text-success-600' : 'text-error-600'}>
                          {isIncomeCategory(transaction.category) ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          disabled={isDeleting === transaction.id}
                          className="text-error-600 hover:text-error-800"
                        >
                          {isDeleting === transaction.id ? (
                            'Deleting...'
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 mb-4">No transactions found</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Transaction
              </button>
            </div>
          )}
        </div>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />

        <BottomNavigation onAddClick={() => setShowModal(true)} />
      </div>
    </div>
  );
}
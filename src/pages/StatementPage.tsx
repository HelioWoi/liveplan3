import { useState, useEffect } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import { Download, Filter, Search } from 'lucide-react';
import OpeningBalanceModal from '../components/statement/OpeningBalanceModal';
import PageHeader from '../components/layout/PageHeader';
import { showToast } from '../utils/toastService';
import { format } from 'date-fns';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import classNames from 'classnames';
import PeriodSelector from '../components/common/PeriodSelector';
import TransactionDetailModal from '../components/modals/TransactionDetailModal';
import { Transaction } from '../types/transaction';

type Period = 'Day' | 'Week' | 'Month' | 'Year';
type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
type WeekNumber = '1' | '2' | '3' | '4' | '5';

export default function StatementPage() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] = useState(false);
  const [openingBalanceValue, setOpeningBalanceValue] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  
  // Carrega as transações locais do localStorage
  useEffect(() => {
    const loadLocalTransactions = () => {
      try {
        const storedTransactions = localStorage.getItem('local_transactions');
        if (storedTransactions) {
          const parsedTransactions = JSON.parse(storedTransactions);
          setLocalTransactions(parsedTransactions);
        }
      } catch (error) {
        console.error('Erro ao carregar transações locais:', error);
      }
    };
    
    loadLocalTransactions();
    
    // Adiciona um listener para atualizar as transações locais quando houver mudanças
    const handleLocalTransactionAdded = () => {
      loadLocalTransactions();
    };
    
    window.addEventListener('local-transaction-added', handleLocalTransactionAdded);
    window.addEventListener('weekly-budget-updated', handleLocalTransactionAdded);
    
    return () => {
      window.removeEventListener('local-transaction-added', handleLocalTransactionAdded);
      window.removeEventListener('weekly-budget-updated', handleLocalTransactionAdded);
    };
  }, []);
  
  // Combina as transações do banco de dados com as transações locais
  useEffect(() => {
    // Criar um Map para eliminar duplicatas baseado no ID
    const transactionMap = new Map();
    
    // Adicionar transações do banco de dados
    transactions.forEach(transaction => {
      transactionMap.set(transaction.id, transaction);
    });
    
    // Adicionar transações locais (apenas se não existirem no banco)
    localTransactions.forEach(transaction => {
      // Só adiciona se não existir no map ou se não tiver ID (transações locais antigas)
      if (!transaction.id || !transactionMap.has(transaction.id)) {
        transactionMap.set(transaction.id || `local-${Date.now()}-${Math.random()}`, transaction);
      }
    });
    
    // Converter o Map para array
    const combined = Array.from(transactionMap.values());
    
    // Ordena por data, mais recente primeiro
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    console.log(`Statement: Combinadas ${transactions.length} transações do banco e ${localTransactions.length} locais, resultando em ${combined.length} transações únicas`);
    
    setAllTransactions(combined);
  }, [transactions, localTransactions]);
  
  // Filter transactions based on selected period
  const filteredTransactions = allTransactions.filter(transaction => {
    // Filter by search term
    if (searchTerm && !transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by period
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.toLocaleString('default', { month: 'long' }) as Month;
    const transactionYear = transactionDate.getFullYear().toString();
    
    // Filter by year - only show transactions from 2025 onwards
    if (parseInt(transactionYear) < 2025) {
      return false;
    }
    
    // Calculate week number for the transaction date
    const getWeekNumber = (date: Date): string => {
      const dayOfMonth = date.getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);
      return weekNumber > 5 ? '5' : weekNumber.toString();
    };
    
    const transactionWeek = getWeekNumber(transactionDate);
    
    // Filter by selected period
    if (selectedPeriod === 'Week') {
      return transactionMonth === selectedMonth && 
             transactionYear === selectedYear && 
             transactionWeek === selectedWeek;
    }
    
    if (selectedPeriod === 'Month') {
      return transactionMonth === selectedMonth && transactionYear === selectedYear;
    }
    
    if (selectedPeriod === 'Year') {
      return transactionYear === selectedYear;
    }
    
    return true;
  });
  
  // Check if there are any transactions for the selected period
  const hasTransactions = filteredTransactions.length > 0;
  
  // Carrega as transações do banco de dados
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  // Calculate initial balance, total movement and final balance
  const calculateBalances = () => {
    // Use state value if available, otherwise get from localStorage
    let openingBalance = openingBalanceValue;
    
    // If there's no value in state, try to get from localStorage
    if (openingBalance === 0) {
      const savedOpeningBalance = localStorage.getItem('openingBalance');
      openingBalance = savedOpeningBalance ? parseFloat(savedOpeningBalance) : 0;
    }
    
    let totalMovement = 0;
    
    // Calcular o movimento total apenas para as transações filtradas pelo período selecionado
    filteredTransactions.forEach(transaction => {
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === 'income') {
        totalMovement += amount;
      } else {
        totalMovement -= amount;
      }
    });
    
    console.log(`Statement: Calculando balanço para ${filteredTransactions.length} transações filtradas, total: ${totalMovement}`);

    const closingBalance = openingBalance + totalMovement;

    return {
      openingBalance,
      totalMovement,
      closingBalance
    };
  };

  const { openingBalance, totalMovement, closingBalance } = calculateBalances();
  
  // Update local state when initial balance is calculated
  useEffect(() => {
    setOpeningBalanceValue(openingBalance);
  }, [openingBalance]);
  
  // Function to update the initial balance
  const handleSaveOpeningBalance = (newBalance: number) => {
    setOpeningBalanceValue(newBalance);
    localStorage.setItem('openingBalance', newBalance.toString());
    showToast('success', 'Initial balance successfully updated');
  };

  // Calculate running balance for each transaction
  const calculateRunningBalance = (index: number): number => {
    let balance = openingBalance;
    for (let i = 0; i <= index; i++) {
      const transaction = filteredTransactions[i];
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

  // Debug function removed

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <PageHeader 
        title="Statement" 
        showBackButton={true}
      />
      
      {/* Removed Initial Balance link */}

      <div className="max-w-7xl mx-auto px-4 space-y-6 mt-6">
        {/* Period Selection */}
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
        {hasTransactions ? (
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

        {/* Transaction List */}
        {hasTransactions ? (
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Get current transactions for pagination */}
                  {filteredTransactions
                    .slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage)
                    .map((transaction, index) => (
                      <tr 
                        key={`${transaction.id}-${index}`} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleTransactionClick(transaction)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(transaction.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                          {transaction.origin === 'Weekly Budget' && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                              Weekly Budget
                            </span>
                          )}
                        </td>
                        <td className={classNames(
                          "px-6 py-4 whitespace-nowrap text-sm font-medium",
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(Math.abs(Number(transaction.amount) || 0))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(calculateRunningBalance(index))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {filteredTransactions.length > transactionsPerPage && (
                <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min((currentPage - 1) * transactionsPerPage + 1, filteredTransactions.length)} to {Math.min(currentPage * transactionsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(filteredTransactions.length / transactionsPerPage) }, (_, i) => i + 1)
                      .filter(pageNum => {
                        // Show first page, last page, current page, and pages around current page
                        const maxPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
                        return pageNum === 1 || 
                               pageNum === maxPages || 
                               Math.abs(pageNum - currentPage) <= 1;
                      })
                      .map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded ${currentPage === pageNum ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredTransactions.length / transactionsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredTransactions.length / transactionsPerPage)}
                      className={`px-3 py-1 rounded ${currentPage === Math.ceil(filteredTransactions.length / transactionsPerPage) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-center text-gray-500 py-8">
              No transactions found for {selectedPeriod === 'Week' ? `Week ${selectedWeek}` : ''} {selectedMonth} {selectedYear}.
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
      
      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
      {/* Modal de configuração do saldo inicial */}
      <OpeningBalanceModal
        isOpen={isOpeningBalanceModalOpen}
        onClose={() => setIsOpeningBalanceModalOpen(false)}
        onSave={handleSaveOpeningBalance}
      />
    </div>
  );
}

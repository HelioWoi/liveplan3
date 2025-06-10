import { useMemo, useEffect, useState } from 'react';
import { useTransactionStore } from '../../stores/transactionStore';
import { formatCurrency } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '../../types/transaction';

export default function RecentTransactions() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>([]);
  
  // Load local transactions from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem('local_transactions');
    if (storedTransactions) {
      try {
        setLocalTransactions(JSON.parse(storedTransactions));
      } catch (error) {
        console.error('Error parsing local transactions:', error);
        setLocalTransactions([]);
      }
    }
    
    // Add event listeners for transaction updates
    const handleTransactionUpdate = () => {
      console.log('RecentTransactions: Detected transaction update');
      fetchTransactions();
      
      // Update local transactions
      const updatedTransactions = localStorage.getItem('local_transactions');
      if (updatedTransactions) {
        try {
          setLocalTransactions(JSON.parse(updatedTransactions));
        } catch (error) {
          console.error('Error parsing local transactions:', error);
        }
      }
    };
    
    // Listen for all relevant transaction events
    window.addEventListener('transactions-updated', handleTransactionUpdate);
    window.addEventListener('transaction-added', handleTransactionUpdate);
    window.addEventListener('local-transaction-added', handleTransactionUpdate);
    window.addEventListener('weekly-budget-updated', handleTransactionUpdate);
    window.addEventListener('income-added-to-week', handleTransactionUpdate);
    window.addEventListener('income-added-from-weekly-budget', handleTransactionUpdate);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('transactions-updated', handleTransactionUpdate);
      window.removeEventListener('transaction-added', handleTransactionUpdate);
      window.removeEventListener('local-transaction-added', handleTransactionUpdate);
      window.removeEventListener('weekly-budget-updated', handleTransactionUpdate);
      window.removeEventListener('income-added-to-week', handleTransactionUpdate);
      window.removeEventListener('income-added-from-weekly-budget', handleTransactionUpdate);
    };
  }, [fetchTransactions]);
  
  // Combine and filter recent transactions
  const recentTransactions = useMemo(() => {
    // Combine database and local transactions
    const allTransactions = [...transactions, ...localTransactions];
    
    // Filter recent transactions
    const recent = allTransactions.filter(t => 
      // Show transactions marked as recent or with recent date
      t.is_recent === true || 
      // Or show transactions from the last 7 days
      (new Date(t.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    );
    
    // Remove duplicates (prefer local transactions over database ones)
    const uniqueTransactions = Array.from(
      new Map(recent.map(t => [t.id, t])).values()
    );
    
    // Sort by date (most recent first)
    return uniqueTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Show only the 5 most recent transactions
  }, [transactions, localTransactions]);
  
  // If no recent transactions, don't render the component
  if (recentTransactions.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
      </div>
      
      <div className="space-y-3">
        {recentTransactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'income' ? (
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">{transaction.description || transaction.origin}</p>
                <p className="text-xs text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                </p>
              </div>
            </div>
            <div className={`font-semibold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

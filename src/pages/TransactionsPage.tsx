import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import TransactionModal from '../components/modals/TransactionModal';
import { useTransactionStore } from '../stores/transactionStore';

export default function TransactionsPage() {
  const [showTransactionForm, setShowTransactionForm] = useState(true);
  const { transactions } = useTransactionStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader title="Transactions" />

      {/* Lista de transações */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium text-gray-900">{transaction.description}</h3>
              <p className="text-sm text-gray-500">{transaction.category}</p>
            </div>
            <div className={`text-lg font-semibold ${
              transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
            }`}>
              {transaction.type === 'expense' ? '-' : '+'}
              R$ {transaction.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de transação */}
      {showTransactionForm && (
        <TransactionModal
          isOpen={showTransactionForm}
          onClose={() => setShowTransactionForm(false)}
        />
      )}
    </div>
  );
}

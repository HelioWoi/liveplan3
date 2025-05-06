import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import TransactionModal from '../components/modals/TransactionModal';
import { useTransactionStore } from '../stores/transactionStore';
import { Download } from 'lucide-react';

export default function TransactionsPage() {
  const [showTransactionForm, setShowTransactionForm] = useState(true);
  const { transactions } = useTransactionStore();

  const exportToCSV = () => {
    // Preparar os dados
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const data = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.category,
      t.type,
      t.amount.toFixed(2)
    ]);

    // Criar o conteúdo CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    // Criar o blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader title="Transactions" />

      {/* Botão de exportar */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A1A40] text-white rounded-lg hover:bg-[#2A2A50] transition-colors"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </button>
      </div>

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

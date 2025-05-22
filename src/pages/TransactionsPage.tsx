import { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import TransactionModal from '../components/modals/TransactionModal';
import { useTransactionStore } from '../stores/transactionStore';
import { Download } from 'lucide-react';
import PeriodSelector from '../components/common/PeriodSelector';
import { subDays } from 'date-fns';

type Period = 'Day' | 'Week' | 'Month' | 'Year';
type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

export default function TransactionsPage() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const { transactions, fetchTransactions } = useTransactionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Week');
  const [selectedMonth, setSelectedMonth] = useState<Month>('May');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Recarregar dados quando o período, mês ou ano mudar
  useEffect(() => {
    console.log(`Período mudou: ${selectedPeriod}, Mês: ${selectedMonth}, Ano: ${selectedYear}`);
    // Forçar recarga dos dados
    fetchTransactions();
  }, [selectedPeriod, selectedMonth, selectedYear, fetchTransactions]);

  // Converter nome do mês para número (0-11)
  const getMonthNumber = (monthName: string): number => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  };

  // Filter transactions by selected period
  useEffect(() => {
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const today = new Date();
      const selectedMonthIndex = getMonthNumber(selectedMonth);
      const selectedYearNumber = parseInt(selectedYear);
      
      // Log para debug
      console.log(`Transactions - Filtering transactions:`);
      console.log(`- Selected Period: ${selectedPeriod}`);
      console.log(`- Selected Month: ${selectedMonth} (index: ${selectedMonthIndex})`);
      console.log(`- Selected Year: ${selectedYear}`);
      console.log(`- Transaction date: ${transactionDate.toISOString()}`);
      
      switch (selectedPeriod) {
        case 'Day':
          // Filtrar apenas as transações do dia atual
          return (
            transactionDate.getDate() === today.getDate() &&
            transactionDate.getMonth() === today.getMonth() &&
            transactionDate.getFullYear() === today.getFullYear()
          );
        case 'Week':
          return transactionDate >= subDays(today, 7);
        case 'Month':
          // Usar o mês e ano selecionados
          return transactionDate.getMonth() === selectedMonthIndex && 
                 transactionDate.getFullYear() === selectedYearNumber;
        case 'Year':
          // Usar o ano selecionado
          return transactionDate.getFullYear() === selectedYearNumber;
        default:
          return true;
      }
    });
    
    setFilteredTransactions(filtered);
  }, [transactions, selectedPeriod, selectedMonth, selectedYear]);

  const exportToCSV = () => {
    // Preparar os dados
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const data = filteredTransactions.map(t => [
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

      {/* Period Selector */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onPeriodChange={(period) => setSelectedPeriod(period)}
            onMonthChange={(month) => setSelectedMonth(month)}
            onYearChange={(year) => setSelectedYear(year)}
          />
        </div>
      </div>

      {/* Botão de exportar */}
      <div className="max-w-3xl mx-auto px-4 pt-2">
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
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
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
        ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No transactions found for the selected period.</p>
          </div>
        )}
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

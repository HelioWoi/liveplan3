import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface PeriodSummaryCardsProps {
  period: 'Weekly' | 'Monthly' | 'Annual';
}

interface LocalTransaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: string;
  description: string;
  origin: string;
  user_id: string;
}

export default function PeriodSummaryCards({ period }: PeriodSummaryCardsProps) {
  const [localTransactions, setLocalTransactions] = useState<LocalTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [iconColor, setIconColor] = useState('text-purple-600');
  const [bgColor, setBgColor] = useState('bg-purple-100');

  useEffect(() => {
    // Definir cores com base no período
    switch (period) {
      case 'Weekly':
        setIconColor('text-purple-600');
        setBgColor('bg-purple-100');
        break;
      case 'Monthly':
        setIconColor('text-green-600');
        setBgColor('bg-green-100');
        break;
      case 'Annual':
        setIconColor('text-purple-600');
        setBgColor('bg-purple-100');
        break;
    }

    // Carregar transações locais
    const loadLocalTransactions = () => {
      const storedTransactions = localStorage.getItem('local_transactions');
      if (storedTransactions) {
        try {
          const parsedTransactions = JSON.parse(storedTransactions);
          setLocalTransactions(parsedTransactions);
          calculateTotal(parsedTransactions);
        } catch (error) {
          console.error(`Erro ao carregar transações locais para ${period}:`, error);
        }
      }
    };

    // Calcular total com base no período
    const calculateTotal = (transactions: LocalTransaction[]) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Filtrar transações com base no período
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        
        switch (period) {
          case 'Weekly':
            // Considerar transações da última semana
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return transactionDate >= oneWeekAgo && transactionDate <= now;
          
          case 'Monthly':
            // Considerar transações do mês atual
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          
          case 'Annual':
            // Considerar transações do ano atual
            return transactionDate.getFullYear() === currentYear;
          
          default:
            return false;
        }
      });

      // Calcular o total
      const sum = filteredTransactions.reduce((acc, t) => {
        // Considerar apenas transações de despesa (valores negativos)
        if (t.type === 'expense') {
          return acc + t.amount;
        }
        return acc;
      }, 0);

      setTotal(sum);
    };

    loadLocalTransactions();

    // Configurar listener para atualizações
    const handleLocalTransactionsUpdated = () => {
      loadLocalTransactions();
    };
    
    window.addEventListener('local-transactions-updated', handleLocalTransactionsUpdated);
    window.addEventListener('local-transaction-added', handleLocalTransactionsUpdated);
    
    return () => {
      window.removeEventListener('local-transactions-updated', handleLocalTransactionsUpdated);
      window.removeEventListener('local-transaction-added', handleLocalTransactionsUpdated);
    };
  }, [period]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Calendar className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{period}</h2>
          <p className="text-sm text-gray-500">{formatCurrency(total)}</p>
        </div>
      </div>
    </div>
  );
}

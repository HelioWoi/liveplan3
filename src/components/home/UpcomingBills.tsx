import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Home, Wifi, CreditCard, ShoppingBag, Smartphone, Tv, Car, Zap, DollarSign } from 'lucide-react';

import { formatCurrency } from '../../utils/formatters';
import { useTransactionStore } from '../../stores/transactionStore';
import BillQuickView from '../bills/BillQuickView';
import BillDetailsModal from '../bills/BillDetailsModal';
import type { Transaction } from '../../types/transaction';

export default function UpcomingBills() {
  const { transactions } = useTransactionStore();
  const today = new Date();
  const [hoveredBill, setHoveredBill] = useState<Transaction | null>(null);
  const [selectedBill, setSelectedBill] = useState<Transaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const upcomingBills = useMemo(() => {
    // Primeiro, remover transações duplicadas com o mesmo ID
    const uniqueTransactions = Array.from(
      new Map(transactions.map(t => [t.id, t])).values()
    );
    
    // Filtrar apenas contas futuras não pagas
    const filteredBills = uniqueTransactions.filter(t => {
      // Verificar se é uma conta fixa
      const isFixedBill = t.category === 'Fixed';
      
      // Verificar se não está marcada como paga
      const isNotPaid = !t.origin.includes('PAID:');
      
      // Verificar se a data é futura
      const isFutureDate = new Date(t.date) > today;
      
      return isFixedBill && isNotPaid && isFutureDate;
    });
    
    // Ordenar por data e pegar apenas as 3 primeiras
    return filteredBills
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3); // Limitar a 3 contas
  }, [transactions, today]);

  const getDueDateStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue > 15) return 'green';
    if (daysUntilDue > 10) return 'green';
    if (daysUntilDue > 5) return 'orange';
    return 'red';
  };
  
  // Função para determinar o ícone com base no nome da conta
  const getBillIcon = (billName: string) => {
    const name = billName.toLowerCase();
    
    if (name.includes('rent') || name.includes('aluguel') || name.includes('mortgage') || name.includes('hipoteca')) {
      return <Home className="h-5 w-5 text-blue-500" />;
    }
    if (name.includes('internet') || name.includes('wifi') || name.includes('broadband')) {
      return <Wifi className="h-5 w-5 text-purple-500" />;
    }
    if (name.includes('credit') || name.includes('card') || name.includes('cartão')) {
      return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
    if (name.includes('grocery') || name.includes('market') || name.includes('mercado') || name.includes('shopping')) {
      return <ShoppingBag className="h-5 w-5 text-green-500" />;
    }
    if (name.includes('phone') || name.includes('celular') || name.includes('mobile')) {
      return <Smartphone className="h-5 w-5 text-indigo-500" />;
    }
    if (name.includes('tv') || name.includes('netflix') || name.includes('hulu') || name.includes('disney') || name.includes('streaming')) {
      return <Tv className="h-5 w-5 text-red-500" />;
    }
    if (name.includes('car') || name.includes('carro') || name.includes('auto') || name.includes('vehicle')) {
      return <Car className="h-5 w-5 text-yellow-500" />;
    }
    if (name.includes('electric') || name.includes('energy') || name.includes('luz') || name.includes('power')) {
      return <Zap className="h-5 w-5 text-yellow-400" />;
    }
    
    // Ícone padrão para outras contas
    return <DollarSign className="h-5 w-5 text-green-600" />;
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'orange':
        return 'bg-orange-50 border-orange-200';
      case 'red':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (upcomingBills.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Bills</h2>
          <Link 
            to="/bills"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View All
          </Link>
        </div>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No upcoming bills</p>
          <Link 
            to="/bills" 
            className="mt-2 inline-block text-[#5B3FFB] hover:text-[#4931E4] font-medium"
          >
            Add your first bill →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Bills</h2>
        <Link 
          to="/bills"
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {upcomingBills.map((bill) => {
          const status = getDueDateStatus(bill.date);
          const statusStyles = getStatusStyles(status);
          const daysUntilDue = Math.ceil(
            (new Date(bill.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div 
              key={`bill-${bill.id}-${bill.date}`} 
              className={`relative flex items-center justify-between p-3 rounded-lg border ${statusStyles} cursor-pointer hover:bg-white/60 transition-colors`}
              onClick={() => {
                setSelectedBill(bill);
                setIsDetailsModalOpen(true);
              }}
              onMouseEnter={() => setHoveredBill(bill)}
              onMouseLeave={() => setHoveredBill(null)}
            >
              {hoveredBill?.id === bill.id && <BillQuickView bill={bill} />}
              <div className="flex items-center">
                <div className="mr-3 flex-shrink-0 p-2 rounded-full bg-gray-50">
                  {getBillIcon(bill.origin)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{bill.origin}</p>
                  <p className="text-sm text-gray-500">
                    Due in {daysUntilDue} days
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold">{formatCurrency(bill.amount)}</p>
            </div>
          );
        })}
      </div>

      <BillDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        bill={selectedBill}
      />
    </div>
  );
}
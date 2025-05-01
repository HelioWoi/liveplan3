import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';
import { useTransactionStore } from '../../stores/transactionStore';

export default function UpcomingBills() {
  const { transactions } = useTransactionStore();
  const today = new Date();

  const upcomingBills = useMemo(() => {
    return transactions
      .filter(t => t.category === 'Fixed' && new Date(t.date) > today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [transactions, today]);

  const getDueDateStatus = (dueDate: string) => {
    const days = differenceInDays(new Date(dueDate), today);
    if (days > 7) return 'success';
    if (days > 3) return 'warning';
    return 'error';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-[#E6F4EA] border-l-[#34D399]';
      case 'warning':
        return 'bg-[#FFF8E1] border-l-[#F59E0B]';
      case 'error':
        return 'bg-[#FFEAEA] border-l-[#EF4444]';
      default:
        return 'bg-gray-50 border-l-gray-500';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[18px] font-bold text-[#1F2533]">Upcoming Bills</h2>
        <Link to="/bills" className="text-[14px] font-medium text-[#5B3FFB]">
          See All Bills ›
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {upcomingBills.length > 0 ? (
          upcomingBills.map((bill) => {
            const status = getDueDateStatus(bill.date);
            return (
              <div 
                key={bill.id}
                className={`relative rounded-xl p-4 bg-white shadow-md overflow-hidden border-l-4 ${getStatusColor(status)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#EAE6FE] flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-[#5B3FFB]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1F2533]">{bill.origin}</h3>
                    <p className="text-[#7A7A7A] text-sm">
                      Due {format(new Date(bill.date), 'MMM d')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1F2533]">{formatCurrency(bill.amount)}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-8 bg-gray-50 rounded-xl">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No upcoming bills</p>
            <Link 
              to="/bills" 
              className="mt-2 inline-block text-[#5B3FFB] hover:text-[#4931E4] font-medium"
            >
              Add your first bill →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
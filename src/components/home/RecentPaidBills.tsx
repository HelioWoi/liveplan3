import { useTransactionStore } from '../../stores/transactionStore';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2 } from 'lucide-react';

export default function RecentPaidBills() {
  const { transactions } = useTransactionStore();

  // Get last 3 paid bills
  const recentPaidBills = transactions
    .filter(t => t.category === 'Fixed' && t.origin.startsWith('PAID:'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (recentPaidBills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Paid Bills</h2>
      </div>

      <div className="space-y-3">
        {recentPaidBills.map((bill) => {
          const originalName = bill.origin.replace('PAID: ', '').split(' (')[0];
          const paidDate = bill.origin.split('(')[1]?.replace(')', '') || '';

          return (
            <div key={bill.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">{originalName}</p>
                  <p className="text-sm text-gray-500">Paid on {paidDate}</p>
                </div>
              </div>
              <p className="font-medium text-gray-900">{formatCurrency(bill.amount)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

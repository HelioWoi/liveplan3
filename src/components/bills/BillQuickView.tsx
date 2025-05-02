import { format } from 'date-fns';
import { Calendar, DollarSign } from 'lucide-react';
import type { Transaction } from '../../types/transaction';
import { formatCurrency } from '../../utils/formatters';

interface BillQuickViewProps {
  bill: Transaction;
}

export default function BillQuickView({ bill }: BillQuickViewProps) {
  return (
    <div className="absolute z-10 bg-white rounded-xl shadow-xl p-4 w-72 transform translate-y-2 animate-fade-in transition-all duration-200 ease-in-out">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary-50">
            <DollarSign className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-lg font-semibold">{formatCurrency(bill.amount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary-50">
            <Calendar className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="text-lg font-semibold">{format(new Date(bill.date), 'PPP')}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-500">Description</p>
          <p className="text-gray-900">{bill.origin}</p>
        </div>
      </div>
    </div>
  );
}

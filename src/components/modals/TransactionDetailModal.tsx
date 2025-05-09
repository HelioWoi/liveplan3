import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Transaction } from '../../types/transaction';
import { formatCurrency } from '../../utils/formatters';
import { format } from 'date-fns';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export default function TransactionDetailModal({ transaction, open, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop overlay */}
        <div className="fixed inset-0 bg-black opacity-30" />
        
        <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6 relative z-10">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Transaction Details
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
              <p className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-success-600' : 'text-error-600'}`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
                <p className="text-gray-900">{format(new Date(transaction.date), 'MMM d, yyyy')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                <p className="text-gray-900">{transaction.category}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-900">{transaction.description || transaction.origin || 'No description'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Transaction ID</h3>
              <p className="text-gray-500 text-sm">{transaction.id}</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

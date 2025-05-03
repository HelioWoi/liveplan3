import { useState } from 'react';
import { X, TrendingUp, Trash2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { Transaction } from '../../types/transaction';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

interface InvestmentDetailsModalProps {
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  investment: Transaction;
}

export default function InvestmentDetailsModal({ isOpen, onClose, investment, onDelete }: InvestmentDetailsModalProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  if (!isOpen || !investment) return null;

  // Parse investment details from description
  const details = investment.description?.split('\n').reduce((acc, line) => {
    const match = line.match(/- (.*?): (.*)/);
    if (match) {
      acc[match[1].toLowerCase()] = match[2];
    }
    return acc;
  }, {} as Record<string, string>) || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg animate-slideUp shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            {/* Investment Title */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{investment.origin}</h2>
                <p className="text-gray-500">Investment Details</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Investment"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

          </div>

          <div className="space-y-6">
            {/* Amount */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <p className="text-purple-100 mb-1">Amount Invested</p>
              <p className="text-3xl font-bold">{formatCurrency(investment.amount)}</p>
            </div>

            {/* Investment Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Investment Information</h3>
              <div className="grid gap-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900">{details.type || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium text-gray-900">{details.quantity || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(investment.date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {details.notes && details.notes !== '-' && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Notes</h3>
                <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                  {details.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={() => {
          onDelete(investment.id);
          onClose();
        }}
        title="Delete Investment"
        message={`Are you sure you want to delete the investment in ${investment.origin}? This action cannot be undone.`}
        confirmText="Delete Investment"
        type="danger"
      />
    </div>
  );
}

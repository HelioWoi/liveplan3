import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useTransactionStore } from '../../stores/transactionStore';
import { useAuthStore } from '../../stores/authStore';
import classNames from 'classnames';

interface InvestmentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type InvestmentType = 'stock' | 'fund' | 'crypto' | 'other';

const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: 'stock', label: 'Stock' },
  { value: 'fund', label: 'Fund' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'other', label: 'Other' }
];

export default function InvestmentRegistrationModal({ isOpen, onClose }: InvestmentRegistrationModalProps) {
  const { addTransaction } = useTransactionStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'stock' as InvestmentType,
    assetName: '',
    amount: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Format amount with thousands separator
  const formatAmount = (value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) return formData.amount;
    if (parts[1]?.length > 2) return formData.amount;
    
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length === 2 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setFormData(prev => ({ ...prev, amount: formatAmount(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.amount || !formData.assetName) return;
    
    setIsSubmitting(true);
    
    try {
      await addTransaction({
        origin: formData.assetName,
        amount: parseFloat(formData.amount.replace(/,/g, '')),
        category: 'Investimento',
        type: 'expense',
        date: formData.date,
        user_id: user.id,
        description: `Investment Details:
- Type: ${formData.type}
- Quantity: ${formData.quantity}
- Notes: ${formData.notes}`,
      });
      
      setFormData({
        type: 'stock',
        assetName: '',
        amount: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      onClose();
    } catch (error) {
      console.error('Error adding investment:', error);
      setError('Unable to register investment. Please try again later.');
      // Keep the modal open when there's an error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📝 Register Your Investment</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <p className="text-gray-600 mt-2">
            Use this form to log investments you've made in any broker or exchange. This is a manual record – LivePlan³ does not connect to brokers yet.
          </p>
        </div>

        {/* Warning Banner */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-y border-red-100 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="px-6 py-3 bg-purple-50 border-y border-purple-100 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <p className="text-sm text-purple-700">
            LivePlan³ is your personal tracker. Integration with brokers is not available yet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Investment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as InvestmentType }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              {INVESTMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Asset Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Name *
            </label>
            <input
              type="text"
              value={formData.assetName}
              onChange={e => setFormData(prev => ({ ...prev, assetName: e.target.value }))}
              placeholder="e.g., AAPL, Bitcoin, VANGUARD ETF"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Invested *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">AU$</span>
              <input
                type="text"
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 pl-12 pr-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="e.g., 10"
              step="any"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional details about this investment..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={classNames(
                "flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg",
                "hover:from-purple-600 hover:to-purple-700 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Registering..." : "Register Investment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

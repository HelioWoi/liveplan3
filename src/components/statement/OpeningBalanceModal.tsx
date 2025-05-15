import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { showToast } from '../../utils/toastService';

interface OpeningBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (balance: number) => void;
}

export default function OpeningBalanceModal({ isOpen, onClose, onSave }: OpeningBalanceModalProps) {
  const [balance, setBalance] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const savedBalance = localStorage.getItem('openingBalance');
      setBalance(savedBalance || '0');
    }
  }, [isOpen]);

  const handleSave = () => {
    const numericBalance = parseFloat(balance);
    if (isNaN(numericBalance)) {
      showToast('error', 'Please enter a valid value');
      return;
    }
    
    localStorage.setItem('openingBalance', numericBalance.toString());
    onSave(numericBalance);
    showToast('success', 'Initial balance successfully updated');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Configure Initial Balance</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-4">
          <label htmlFor="openingBalance" className="block text-sm font-medium text-gray-700 mb-1">
            Initial Balance (AUD)
          </label>
          <input
            type="number"
            id="openingBalance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="0.00"
            step="0.01"
          />
          <p className="text-sm text-gray-500 mt-1">
            This value will be used as the initial balance for your statement.
          </p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

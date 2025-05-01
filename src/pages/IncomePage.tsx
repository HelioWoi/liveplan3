import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { ArrowLeft, MoreVertical, Minus, Plus, Check } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import classNames from 'classnames';

const AMOUNT_PRESETS = [1000, 5000, 10000, 25000, 50000, 75000, 100000];

export default function IncomePage() {
  const navigate = useNavigate();
  const { addTransaction } = useTransactionStore();
  const [amount, setAmount] = useState<string>('150.00');
  const [manualAmount, setManualAmount] = useState<string>('');
  const [origin, setOrigin] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleAmountChange = (value: number) => {
    const currentAmount = parseFloat(amount);
    const newAmount = Math.max(0, Math.min(currentAmount + value, 100000.00));
    setAmount(newAmount.toFixed(2));
    setManualAmount(newAmount.toFixed(2));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(value.toFixed(2));
    setManualAmount(value.toFixed(2));
  };

  const handleManualAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setManualAmount(value);
      if (value) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setAmount(Math.min(numValue, 100000).toFixed(2));
        }
      }
    }
  };

  const handleProceed = async () => {
    if (!origin.trim()) {
      setShowError(true);
      return;
    }

    try {
      await addTransaction({
        origin: origin.trim(),
        amount: parseFloat(amount),
        category: 'Income',
        type: 'income',
        date: new Date().toISOString(),
        userId: 'current-user',
      });

      setShowError(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to add income:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#120B39] text-white">
      {/* Header */}
      <div className="px-4 pt-12 pb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold">Add Income</h1>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreVertical className="h-6 w-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4">
        <div className="bg-white rounded-3xl p-8 text-gray-900">
          {/* Origin Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Origin / Description <span className="text-error-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Salary, Freelance work, Dividends..."
              value={origin}
              onChange={(e) => {
                setOrigin(e.target.value);
                if (showError) setShowError(false);
              }}
              className={classNames(
                "w-full px-4 py-3 bg-gray-50 rounded-xl text-lg border transition-colors",
                showError 
                  ? "border-error-300 focus:border-error-500 focus:ring-error-500" 
                  : "border-gray-200 focus:border-[#120B39] focus:ring-[#120B39]"
              )}
            />
            {showError && (
              <p className="mt-1 text-sm text-error-600">Origin is required</p>
            )}
          </div>

          {/* Manual Amount Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Enter Amount Manually
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="text"
                className="w-full px-4 py-3 pl-8 bg-gray-50 rounded-xl text-lg border border-gray-200 focus:border-[#120B39] focus:ring-[#120B39] transition-colors"
                placeholder="0.00"
                value={manualAmount}
                onChange={handleManualAmountChange}
              />
            </div>
          </div>

          {/* Amount Picker */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-8 mb-8">
              <button
                onClick={() => handleAmountChange(-0.01)}
                className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Minus className="h-6 w-6" />
              </button>
              <span className="text-5xl font-bold tracking-tight font-mono">
                ${amount}
              </span>
              <button
                onClick={() => handleAmountChange(0.01)}
                className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            {/* Slider */}
            <div className="px-4 mb-8">
              <input
                type="range"
                min="0"
                max="100000"
                step="0.01"
                value={amount}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Quick Amount Grid */}
            <div className="grid grid-cols-3 gap-4 mt-8 px-2">
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setAmount(preset.toFixed(2));
                    setManualAmount(preset.toFixed(2));
                  }}
                  className={classNames(
                    'py-4 rounded-xl font-medium text-lg transition-colors',
                    parseFloat(amount) === preset
                      ? 'bg-[#120B39] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  ${preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#120B39]">
        <button
          onClick={handleProceed}
          className="w-full bg-white text-[#120B39] rounded-full py-4 font-bold text-lg mb-3"
        >
          Proceed
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full text-white/80 font-medium"
        >
          Cancel
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center animate-slide-up">
            <div className="w-20 h-20 bg-[#120B39] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Income Added Successfully
            </h2>
            <p className="text-gray-600 mb-8">
              Your income has been recorded and will be reflected in your Formula³ calculations
            </p>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-[#120B39] text-white rounded-full py-4 font-bold text-lg"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
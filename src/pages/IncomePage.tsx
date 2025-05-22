import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { ArrowLeft, MoreVertical, Minus, Plus, Check, DollarSign } from 'lucide-react';
import classNames from 'classnames';
import { format } from 'date-fns';
import { TransactionCategory, TransactionType } from '../types/transaction';

const AMOUNT_PRESETS = [1000, 5000, 10000, 25000, 50000, 75000, 100000];

export default function IncomePage() {
  const navigate = useNavigate();
  const { transactions, addTransaction, fetchTransactions } = useTransactionStore();
  const [amount, setAmount] = useState<string>('150.00');
  const [manualAmount, setManualAmount] = useState<string>('');
  const [origin, setOrigin] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        await fetchTransactions();
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [fetchTransactions]);

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
      // Obter a data atual para determinar a semana
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
      const currentYear = currentDate.getFullYear();
      
      // Determinar a semana atual (1-4) com base no dia do mês
      const dayOfMonth = currentDate.getDate();
      let currentWeek = 'Week 1';
      
      if (dayOfMonth > 21) {
        currentWeek = 'Week 4';
      } else if (dayOfMonth > 14) {
        currentWeek = 'Week 3';
      } else if (dayOfMonth > 7) {
        currentWeek = 'Week 2';
      }
      
      // Adicionar a transação
      const newTransaction = {
        origin: origin.trim(),
        amount: parseFloat(amount),
        category: 'Income' as TransactionCategory,
        type: 'income' as TransactionType,
        date: currentDate.toISOString(),
        user_id: 'current-user',
        description: origin.trim() // Adicionar descrição para sincronização
      };
      
      // Adicionar a transação ao store
      await addTransaction(newTransaction);
      
      // Disparar um único evento para sincronizar com o Weekly Budget
      window.dispatchEvent(new CustomEvent('income-added-to-week', { 
        detail: { 
          transaction: {
            ...newTransaction,
            id: Date.now().toString() // Gerar um ID temporário para a transação
          }, 
          week: currentWeek,
          month: currentMonth, 
          year: currentYear 
        }
      }));

      setShowError(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to add income:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#120B39] text-white pb-32">
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
      <div className="px-4 space-y-6 mb-24">
        {/* Lista de Transações */}
        <div className="bg-white rounded-3xl p-6 text-gray-900">
          <h2 className="text-xl font-bold mb-4">Income History</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.filter(t => t.category === 'Income').length > 0 ? (
            <div className="space-y-4">
              {transactions
                .filter(t => t.category === 'Income')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 2)
                .map(transaction => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#EAE6FE] flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-[#5B3FFB]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{transaction.origin}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-green-600">
                      +${transaction.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No income transactions found</p>
            </div>
          )}
        </div>

        {/* Formulário de Nova Transação */}
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#120B39] space-y-3 z-10">
        <button
          onClick={handleProceed}
          className="w-full bg-white text-[#120B39] rounded-full py-4 font-bold text-lg hover:bg-gray-100 transition-colors"
        >
          Proceed
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full border border-white/20 text-white rounded-full py-4 font-medium hover:bg-white/10 transition-colors"
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
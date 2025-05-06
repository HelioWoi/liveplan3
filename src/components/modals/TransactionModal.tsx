import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, X } from 'lucide-react';
import classNames from 'classnames';
import { useTransactionStore } from '../../stores/transactionStore';
import { useAuthStore } from '../../stores/authStore';
import { useIncomeStore } from '../../stores/incomeStore';
import { toast } from 'react-hot-toast';
import { Transaction, TransactionType, TransactionCategory, TRANSACTION_CATEGORIES, isIncomeCategory } from '../../types/transaction';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const navigate = useNavigate();
  const { addTransaction, transactions } = useTransactionStore();
  const { totalIncome } = useIncomeStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    origin: '',
    category: 'Fixed' as TransactionCategory,
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Format amount with thousands separator
  const formatAmount = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Handle decimal places
    const parts = cleanValue.split('.');
    if (parts.length > 2) return formData.amount;
    if (parts[1]?.length > 2) return formData.amount;
    
    // Add thousands separator
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length === 2 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setFormData(prev => ({ ...prev, amount: formatAmount(value) }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as TransactionCategory;
    if (newCategory === 'Tax') {
      onClose();
      navigate('/tax');
      return;
    }
    setFormData(prev => ({ ...prev, category: newCategory }));
    
    // Handle special category redirects
    switch (newCategory) {
      case 'Income':
        onClose();
        navigate('/income');
        break;
      case 'Investment':
        onClose();
        navigate('/investments');
        break;
      case 'Invoices':
        onClose();
        navigate('/invoices');
        break;
      case 'Goal':
      case 'Contribution':
        onClose();
        navigate('/goals');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.amount) return;
    
    setIsSubmitting(true);
    
    try {
      // Handle special categories
      switch (formData.category) {
        case 'Income':
          navigate('/income');
          return;
        case 'Investment':
          navigate('/investments');
          return;
        case 'Invoices':
          navigate('/invoices');
          return;
        case 'Tax':
          navigate('/tax');
          return;
      }

      // Preparar a nova transação
      const newTransaction: Omit<Transaction, 'id'> = {
        origin: formData.origin.trim(),
        amount: parseFloat(formData.amount.replace(/,/g, '')),
        category: formData.category as TransactionCategory,
        type: (isIncomeCategory(formData.category) ? 'income' : 'expense') as TransactionType,
        date: formData.date,
        user_id: user.id
      };

      // Calcular o impacto na Fórmula 3 para categorias relevantes
      if (newTransaction.type === 'expense' && 
          ['Fixed', 'Variable', 'Investimento'].includes(newTransaction.category)) {
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const newAmount = newTransaction.amount;
        const targetTotal = Math.max(totalExpenses + newAmount, totalIncome);
        let impact = '';

        if (newTransaction.category === 'Fixed') {
          const currentFixed = transactions
            .filter(t => t.category === 'Fixed')
            .reduce((sum, t) => sum + t.amount, 0);
          const newPercentage = ((currentFixed + newAmount) / targetTotal) * 100;
          impact = `This fixed expense represents ${newPercentage.toFixed(1)}% of your fixed budget (target: 50%)`;
        } else if (newTransaction.category === 'Variable') {
          const currentVariable = transactions
            .filter(t => t.category === 'Variable')
            .reduce((sum, t) => sum + t.amount, 0);
          const newPercentage = ((currentVariable + newAmount) / targetTotal) * 100;
          impact = `This variable expense represents ${newPercentage.toFixed(1)}% of your flexible budget (target: 30%)`;
        } else if (newTransaction.category === 'Investment') {
          const currentInvestments = transactions
            .filter(t => t.category === 'Investment')
            .reduce((sum, t) => sum + t.amount, 0);
          const newPercentage = ((currentInvestments + newAmount) / targetTotal) * 100;
          impact = `This investment represents ${newPercentage.toFixed(1)}% of your investment budget (target: 20%)`;
        }

        if (impact) {
          toast.success(impact, {
            duration: 5000,
            position: 'bottom-center',
          });
        }
      }

      // Redirecionar para Goals se for uma meta ou contribuição
      if (formData.category === 'Goal' || formData.category === 'Contribution') {
        navigate('/goals');
      }

      // Adicionar a transação
      await addTransaction(newTransaction);
      
      // Resetar o formulário e fechar
      setFormData({
        origin: '',
        category: 'Fixed',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
      onClose();
    } catch (error) {
      console.error('Failed to add transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg animate-slide-up overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Add New Transaction</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-lg font-medium text-gray-900 mb-2 block">
                Category <span className="text-error-600">*</span>
              </label>
              <select 
                className={classNames(
                  "w-full px-4 py-3 text-lg bg-gray-50 rounded-xl border transition-colors appearance-none",
                  "border-gray-200 focus:border-[#120B39] focus:ring-[#120B39]"
                )}
                value={formData.category}
                onChange={handleCategoryChange}
                required
              >
                {TRANSACTION_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-lg font-medium text-gray-900 mb-2 block">
                Origin / Description <span className="text-error-600">*</span>
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-3 text-lg bg-gray-50 rounded-xl border border-gray-200 focus:border-[#120B39] focus:ring-[#120B39] transition-colors"
                placeholder="Salary, Rent payment, etc."
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-lg font-medium text-gray-900 mb-2 block">
                Amount <span className="text-error-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">AU$</span>
                <input 
                  type="text"
                  inputMode="decimal"
                  className="w-full pl-12 pr-4 py-3 text-lg bg-gray-50 rounded-xl border border-gray-200 focus:border-[#120B39] focus:ring-[#120B39] transition-colors"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-lg font-medium text-gray-900 mb-2 block">
                Date <span className="text-error-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full px-4 py-3 text-lg bg-gray-50 rounded-xl border border-gray-200 focus:border-[#120B39] focus:ring-[#120B39] transition-colors"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={classNames(
                  'flex-1 py-4 rounded-xl text-lg font-semibold transition-colors',
                  isSubmitting
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-[#120B39] text-white hover:bg-[#1A1A50]'
                )}
              >
                {isSubmitting ? 'Adding...' : `Add ${isIncomeCategory(formData.category) ? 'Income' : 'Expense'}`}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-xl text-lg font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
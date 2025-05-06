import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTransactionStore } from '../../stores/transactionStore';
import { useAuthStore } from '../../stores/authStore';
import { useFeedback } from '../feedback/FeedbackProvider';
import { Calendar } from 'lucide-react';
import classNames from 'classnames';
import { TransactionCategory, TRANSACTION_CATEGORIES, isIncomeCategory } from '../../types/transaction';
import { useNavigate } from 'react-router-dom';

interface TransactionFormProps {
  onSuccess?: () => void;
  defaultCategory?: TransactionCategory;
  disableCategory?: boolean;
  onClose?: () => void;
}

interface FormValues {
  category: TransactionCategory;
  origin: string;
  amount: string;
  date: string;
}

export default function TransactionForm({ 
  onSuccess, 
  defaultCategory,
  disableCategory = false,
  onClose
}: TransactionFormProps) {
  const { addTransaction } = useTransactionStore();
  const { showToast, showLoading, hideLoading } = useFeedback();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountValue, setAmountValue] = useState('');
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      category: defaultCategory || 'Fixed',
      origin: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    }
  });

  const selectedCategory = watch('category');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmountValue(value);
    }
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as TransactionCategory;
    
    // Redirect to appropriate page based on category
    if (newCategory === 'Invoices') {
      navigate('/invoices');
      return;
    }
    
    if (newCategory === 'Goal') {
      navigate('/goals');
      return;
    }
  };

  const onSubmit = async (data: FormValues) => {
    showLoading('Salvando transação...');
    
    try {
      if (!user || !amountValue) return;
      
      setIsSubmitting(true);
      
      try {
        // Handle special categories
        if (data.category === 'Invoices') {
          navigate('/invoices');
          return;
        }

        if (data.category === 'Goal') {
          navigate('/goals');
          return;
        }

        // If category is Contribution, redirect to simulator
        if (data.category === 'Contribution') {
          navigate('/goals', { 
            state: { 
              contributionAmount: amountValue,
              description: data.origin
            }
          });
          return;
        }

        await addTransaction({
          origin: data.origin.trim(),
          amount: parseFloat(amountValue),
          category: data.category,
          type: isIncomeCategory(data.category) ? 'income' : 'expense',
          date: data.date,
          user_id: user?.id,
        });
        
        reset();
        setAmountValue('');
        showToast('Transação salva com sucesso!', 'success');
        onSuccess?.();
        onClose?.();
      } catch (error) {
        console.error('Error saving transaction:', error);
        showToast('Erro ao salvar transação', 'error');
      } finally {
        hideLoading();
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Failed to add entry', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="text-lg font-medium text-gray-900 mb-2 block">
          Category <span className="text-error-600">*</span>
        </label>
        <select 
          className={classNames(
            "w-full px-4 py-3 text-lg bg-gray-50 rounded-xl border transition-colors appearance-none",
            errors.category
              ? "border-error-300 focus:border-error-500 focus:ring-error-500"
              : "border-gray-200 focus:border-[#120B39] focus:ring-[#120B39]"
          )}
          {...register('category', { required: 'Category is required' })}
          onChange={handleCategoryChange}
          disabled={disableCategory}
        >
          {TRANSACTION_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-error-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label className="text-lg font-medium text-gray-900 mb-2 block">
          Origin / Description <span className="text-error-600">*</span>
        </label>
        <input 
          type="text" 
          className={classNames(
            "w-full px-4 py-3 text-lg bg-gray-50 rounded-xl border transition-colors",
            errors.origin 
              ? "border-error-300 focus:border-error-500 focus:ring-error-500"
              : "border-gray-200 focus:border-[#120B39] focus:ring-[#120B39]"
          )}
          placeholder="Salary, Rent payment, etc."
          {...register('origin', { required: 'Origin is required' })}
        />
        {errors.origin && (
          <p className="mt-1 text-sm text-error-600">{errors.origin.message}</p>
        )}
      </div>

      <div>
        <label className="text-lg font-medium text-gray-900 mb-2 block">
          Amount <span className="text-error-600">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input 
            type="text"
            inputMode="decimal"
            className={classNames(
              "w-full pl-8 pr-4 py-3 text-lg bg-gray-50 rounded-xl border transition-colors",
              !amountValue
                ? "border-error-300 focus:border-error-500 focus:ring-error-500" 
                : "border-gray-200 focus:border-[#120B39] focus:ring-[#120B39]"
            )}
            placeholder="0.00"
            value={amountValue}
            onChange={handleAmountChange}
          />
        </div>
        {!amountValue && (
          <p className="mt-1 text-sm text-error-600">Amount is required</p>
        )}
      </div>

      <div>
        <label className="text-lg font-medium text-gray-900 mb-2 block">
          Date <span className="text-error-600">*</span>
        </label>
        <div className="relative">
          <input 
            type="date" 
            className={classNames(
              "w-full px-4 py-3 text-lg bg-gray-50 rounded-xl border transition-colors",
              errors.date
                ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                : "border-gray-200 focus:border-[#120B39] focus:ring-[#120B39]"
            )}
            {...register('date', { required: 'Date is required' })}
          />
          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        {errors.date && (
          <p className="mt-1 text-sm text-error-600">{errors.date.message}</p>
        )}
      </div>

      <button 
        type="submit"
        className={classNames(
          'w-full py-4 rounded-xl text-lg font-semibold transition-colors',
          isSubmitting || !amountValue
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-[#120B39] text-white hover:bg-[#1A1A50]'
        )}
        disabled={isSubmitting || !amountValue}
      >
        {isSubmitting ? 'Adding...' : selectedCategory === 'Invoices' ? 'Create Invoice' : `Add ${isIncomeCategory(selectedCategory) ? 'Income' : 'Expense'}`}
      </button>
    </form>
  );
}
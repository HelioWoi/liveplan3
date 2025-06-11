import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransactionStore } from '../../stores/transactionStore';
import { useAuthStore } from '../../stores/authStore';
import { useFeedback } from '../feedback/FeedbackProvider';
import { Calendar } from 'lucide-react';
import classNames from 'classnames';
import { TransactionCategory, TRANSACTION_CATEGORIES, isIncomeCategory } from '../../types/transaction';
import { useNavigate } from 'react-router-dom';
import { transactionFormSchema } from '../../lib/validations/schemas';
import FormInput from '../common/FormInput';
import { registerIncomeEntry } from '../../utils/incomeEntryUtils';

interface TransactionFormProps {
  onSuccess?: () => void;
  defaultCategory?: TransactionCategory;
  disableCategory?: boolean;
  onClose?: () => void;
}

type FormValues = z.infer<typeof transactionFormSchema>;

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
  
  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(transactionFormSchema),
    mode: 'onChange', // Validação em tempo real
    defaultValues: {
      category: defaultCategory || 'Fixed',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense' as const
    }
  });

  const selectedCategory = watch('category');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite apenas números e até 2 casas decimais
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmountValue(value);
      // Atualiza o valor no formulário
      setValue('amount', value, {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as TransactionCategory;
    setValue('category', category, {
      shouldValidate: true,
      shouldDirty: true
    });
    if (category === 'Invoices') {
      navigate('/invoices');
      return;
    }
    
    if (category === 'Goal') {
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
              description: data.description
            }
          });
          return;
        }

        const category = TRANSACTION_CATEGORIES.find(c => c === data.category);
        if (!category) {
          throw new Error('Invalid category');
        }

        // Se for uma categoria de receita, usar a função centralizada registerIncomeEntry
        if (isIncomeCategory(category)) {
          const amount = parseFloat(data.amount);
          const date = new Date(data.date);
          const currentMonth = date.toLocaleString('default', { month: 'long' });
          const currentYear = date.getFullYear();
          const currentWeek = `${Math.ceil((date.getDate()) / 7)}`;
          
          await registerIncomeEntry('floating', {
            description: data.description,
            amount,
            month: currentMonth,
            year: currentYear,
            week: currentWeek,
            category: category,
            addAsTransaction: true
          });
        } else {
          // Para despesas, manter o fluxo original
          await addTransaction({
            origin: data.description, // Mantendo compatibilidade com a interface existente
            amount: parseFloat(data.amount),
            date: data.date,
            category: category,
            type: data.type,
            user_id: user?.id || ''
          });
        }
        
        reset();
        setAmountValue('');
        
        // Mostrar toast com o sistema atual
        showToast('Transação salva com sucesso!', 'success');
        
        // Importar e usar o novo serviço de toast para notificação mais profissional
        const { showSuccessToast, ToastEvent } = await import('../../utils/toastService');
        showSuccessToast(ToastEvent.TRANSACTION_SAVED);
        
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
        <FormInput
          {...register('description')}
          placeholder="Description"
          error={errors.description?.message}
        />
      </div>

      <div>
        <label className="text-lg font-medium text-gray-900 mb-2 block">
          Amount <span className="text-error-600">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <FormInput
            type="text"
            value={amountValue}
            onChange={handleAmountChange}
            placeholder="Amount"
            error={errors.amount?.message}
          />
        </div>
      </div>

      <div>
        <label className="text-lg font-medium text-gray-900 mb-2 block">
          Date <span className="text-error-600">*</span>
        </label>
        <div className="relative">
          <FormInput
            type="date"
            {...register('date')}
            error={errors.date?.message}
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
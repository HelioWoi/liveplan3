import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useGoalsStore } from '../../stores/goalsStore';
import { useFeedback } from '../feedback/FeedbackProvider';
import { formatISO } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';

interface GoalFormProps {
  onSuccess?: () => void;
}

interface FormValues {
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
}

export default function GoalForm({ onSuccess }: GoalFormProps) {
  const { addGoal } = useGoalsStore();
  const { showToast, showLoading, hideLoading } = useFeedback();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate a date 1 year from now for the default target date
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      target_amount: 0,
      current_amount: 0,
      target_date: oneYearFromNow.toISOString().split('T')[0],
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    if (!data.title || !data.target_amount || !data.target_date) {
      showToast('Preencha todos os campos obrigatórios', 'warning');
      return;
    }

    showLoading('Criando meta...');

    setIsSubmitting(true);
    
    try {
      await addGoal({
        ...data,
        target_amount: Number(data.target_amount),
        current_amount: Number(data.current_amount),
        target_date: formatISO(new Date(data.target_date)),
        user_id: user.id,
      });
      
      reset();
      showToast('Meta criada com sucesso!', 'success');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add goal', error);
      showToast('Erro ao criar meta', 'error');
    } finally {
      hideLoading();
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group">
        <label htmlFor="title" className="label">
          Goal Title
        </label>
        <input 
          id="title" 
          type="text" 
          className="input" 
          placeholder="Emergency Fund, House Down Payment, etc."
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea 
          id="description" 
          className="input" 
          rows={3}
          placeholder="What's this goal for?"
          {...register('description')}
        ></textarea>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="target_amount" className="label">
            Target Amount
          </label>
          <input 
            id="target_amount" 
            type="number" 
            step="0.01" 
            min="0" 
            className="input" 
            placeholder="0.00"
            {...register('target_amount', { 
              required: 'Target amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' },
              valueAsNumber: true,
            })}
          />
          {errors.target_amount && (
            <p className="mt-1 text-sm text-error-600">{errors.target_amount.message}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="current_amount" className="label">
            Current Amount
          </label>
          <input 
            id="current_amount" 
            type="number" 
            step="0.01" 
            min="0" 
            className="input" 
            placeholder="0.00"
            {...register('current_amount', { 
              min: { value: 0, message: 'Amount cannot be negative' },
              valueAsNumber: true,
            })}
          />
          {errors.current_amount && (
            <p className="mt-1 text-sm text-error-600">{errors.current_amount.message}</p>
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="target_date" className="label">
          Target Date
        </label>
        <input 
          id="target_date" 
          type="date" 
          className="input" 
          {...register('target_date', { required: 'Target date is required' })}
        />
        {errors.target_date && (
          <p className="mt-1 text-sm text-error-600">{errors.target_date.message}</p>
        )}
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Goal'}
      </button>
    </form>
  );
}
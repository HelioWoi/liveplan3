import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useGoalsStore } from '../../stores/goalsStore';
import { formatISO } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';

interface GoalFormProps {
  onSuccess?: () => void;
}

interface FormValues {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export default function GoalForm({ onSuccess }: GoalFormProps) {
  const { addGoal } = useGoalsStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate a date 1 year from now for the default target date
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: oneYearFromNow.toISOString().split('T')[0],
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await addGoal({
        ...data,
        targetAmount: Number(data.targetAmount),
        currentAmount: Number(data.currentAmount),
        targetDate: formatISO(new Date(data.targetDate)),
        userId: user.id,
      });
      
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add goal', error);
    } finally {
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
          <label htmlFor="targetAmount" className="label">
            Target Amount
          </label>
          <input 
            id="targetAmount" 
            type="number" 
            step="0.01" 
            min="0" 
            className="input" 
            placeholder="0.00"
            {...register('targetAmount', { 
              required: 'Target amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' },
              valueAsNumber: true,
            })}
          />
          {errors.targetAmount && (
            <p className="mt-1 text-sm text-error-600">{errors.targetAmount.message}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="currentAmount" className="label">
            Current Amount
          </label>
          <input 
            id="currentAmount" 
            type="number" 
            step="0.01" 
            min="0" 
            className="input" 
            placeholder="0.00"
            {...register('currentAmount', { 
              min: { value: 0, message: 'Amount cannot be negative' },
              valueAsNumber: true,
            })}
          />
          {errors.currentAmount && (
            <p className="mt-1 text-sm text-error-600">{errors.currentAmount.message}</p>
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="targetDate" className="label">
          Target Date
        </label>
        <input 
          id="targetDate" 
          type="date" 
          className="input" 
          {...register('targetDate', { required: 'Target date is required' })}
        />
        {errors.targetDate && (
          <p className="mt-1 text-sm text-error-600">{errors.targetDate.message}</p>
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
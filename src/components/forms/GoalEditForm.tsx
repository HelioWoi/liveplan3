import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Goal, useGoalsStore } from '../../stores/goalsStore';
import { useFeedback } from '../feedback/FeedbackProvider';
import { format, parseISO } from 'date-fns';

interface GoalEditFormProps {
  goal: Goal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormValues {
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
}

export default function GoalEditForm({ goal, onSuccess, onCancel }: GoalEditFormProps) {
  const { updateGoal } = useGoalsStore();
  const { showToast, showLoading, hideLoading } = useFeedback();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format the date for the input field (YYYY-MM-DD)
  const formattedDate = format(parseISO(goal.target_date), 'yyyy-MM-dd');
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: goal.title,
      description: goal.description,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: formattedDate,
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    showLoading('Updating goal...');
    setIsSubmitting(true);
    
    try {
      await updateGoal(goal.id, {
        ...data,
        target_amount: Number(data.target_amount),
        current_amount: Number(data.current_amount),
        target_date: new Date(data.target_date).toISOString(),
      });
      
      showToast('Goal updated successfully!', 'success');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update goal', error);
      showToast('Error updating goal', 'error');
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
      
      <div className="flex gap-2 mt-6">
        <button 
          type="submit" 
          className="btn btn-primary flex-1" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Save Changes'}
        </button>
        
        <button 
          type="button" 
          className="btn btn-outline flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

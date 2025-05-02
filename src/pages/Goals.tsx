import { useEffect, useState } from 'react';
import { useGoalsStore, Goal } from '../stores/goalsStore';
import { formatDistance } from 'date-fns';
import { Edit, PlusCircle, Target, Trash2 } from 'lucide-react';
import GoalForm from '../components/forms/GoalForm';
import BottomNavigation from '../components/layout/BottomNavigation';
import { supabase } from '@/supabaseClient';

export default function Goals() {
  const { deleteGoal, contributeToGoal } = useGoalsStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [contributingTo, setContributingTo] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState<number>(0);

  useEffect(() => {
    const fetchGoals = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch goals:', error);
      } else {
        setGoals(data);
      }

      setLoading(false);
    };

    fetchGoals();
  }, []);

  const sortedGoals = [...goals]
    .sort((a, b) => {
      const progressA = a.currentAmount / a.targetAmount;
      const progressB = b.currentAmount / b.targetAmount;
      return progressB - progressA;
    });

  const handleDeleteGoal = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteGoal(id);
      setGoals(prev => prev.filter(goal => goal.id !== id));
    } catch (error) {
      console.error('Failed to delete goal', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleContribute = async () => {
    if (!contributingTo || contributionAmount <= 0) return;
    try {
      await contributeToGoal(contributingTo.id, contributionAmount);
      setGoals(prev =>
        prev.map(goal =>
          goal.id === contributingTo.id
            ? { ...goal, currentAmount: goal.currentAmount + contributionAmount }
            : goal
        )
      );
      setContributingTo(null);
      setContributionAmount(0);
    } catch (error) {
      console.error('Failed to contribute to goal', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Financial Goals</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : goals.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-xl shadow-card">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-500 mb-4">Create financial goals to track your progress and stay motivated.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Your First Goal
            </button>
          </div>
        ) : (
          sortedGoals.map(goal => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const timeRemaining = formatDistance(new Date(goal.targetDate), new Date(), { addSuffix: true });
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div key={goal.id} className={`card hover:shadow-xl transition-shadow ${isCompleted ? 'bg-success-50 border border-success-100' : ''}`}>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <Target className={`h-5 w-5 mr-2 ${isCompleted ? 'text-success-600' : 'text-primary-600'}`} />
                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                  </div>
                  {isCompleted && (
                    <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                      Completed!
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4 text-sm">{goal.description}</p>
                <div className="flex justify-between text-sm mb-1">
                  <span>${goal.currentAmount.toFixed(2)}</span>
                  <span>${goal.targetAmount.toFixed(2)}</span>
                </div>
                <div className="progress-bar mb-2">
                  <div 
                    className={`progress-fill ${isCompleted ? 'bg-success-500' : 'bg-primary-500'}`}
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      '--progress-width': `${Math.min(percentage, 100)}%`
                    } as React.CSSProperties}
                  ></div>
                </div>
                <div className="flex justify-between mb-4">
                  <span className={`text-sm font-medium ${isCompleted ? 'text-success-700' : 'text-primary-700'}`}>{percentage.toFixed(0)}% Complete</span>
                  <span className="text-sm text-gray-500">Due {timeRemaining}</span>
                </div>
                <div className="flex space-x-2">
                  {!isCompleted && (
                    <button className="btn btn-primary flex-1" onClick={() => setContributingTo(goal)}>
                      Contribute
                    </button>
                  )}
                  <button className="btn btn-outline flex-1" disabled={isDeleting === goal.id} onClick={() => handleDeleteGoal(goal.id)}>
                    {isDeleting === goal.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
            <h2 className="text-xl font-bold mb-4">Create New Goal</h2>
            <GoalForm onSuccess={() => setShowForm(false)} />
            <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {contributingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
            <h2 className="text-xl font-bold mb-4">Contribute to {contributingTo.title}</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Current progress: ${contributingTo.currentAmount.toFixed(2)} of ${contributingTo.targetAmount.toFixed(2)}
              </p>
              <label htmlFor="amount" className="label">
                Contribution Amount
              </label>
              <input 
                id="amount" 
                type="number" 
                step="0.01" 
                min="0" 
                className="input" 
                placeholder="0.00"
                value={contributionAmount || ''}
                onChange={(e) => setContributionAmount(Number(e.target.value))}
              />
            </div>
            <button className="btn btn-primary w-full" onClick={handleContribute} disabled={contributionAmount <= 0}>
              Contribute ${contributionAmount.toFixed(2)}
            </button>
            <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => {
              setContributingTo(null);
              setContributionAmount(0);
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

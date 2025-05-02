import { useEffect, useState } from 'react';
import { useGoalsStore, Goal } from '../stores/goalsStore';
import { formatDistance } from 'date-fns';
import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import GoalDetailsModal from './goals/GoalDetailsModal';

export default function TopGoals() {
  const { goals, fetchGoals } = useGoalsStore();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Sort goals by progress percentage and get top 2
  const topGoals = [...goals]
    .sort((a, b) => {
      const progressA = a.current_amount / a.target_amount;
      const progressB = b.current_amount / b.target_amount;
      return progressB - progressA;
    })
    .slice(0, 2);

  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center gap-4">
          <Target className="h-12 w-12 text-gray-400" />
          <p className="text-gray-600">No goals created yet</p>
          <Link to="/goals" className="text-primary-600 hover:text-primary-700">
            Create your first goal →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Top Goals</h2>
        <Link to="/goals" className="text-primary-600 hover:text-primary-700 text-sm">
          View All →
        </Link>
      </div>
      <div className="grid gap-4">
        {topGoals.map(goal => {
          const percentage = (goal.current_amount / goal.target_amount) * 100;
          const timeRemaining = formatDistance(new Date(goal.target_date), new Date(), { addSuffix: true });
          const isCompleted = goal.current_amount >= goal.target_amount;

          return (
            <div
              key={goal.id}
              className={`card hover:shadow-xl transition-shadow cursor-pointer ${isCompleted ? 'bg-success-50 border border-success-100' : ''}`}
              onClick={() => {
                setSelectedGoal(goal);
                setIsModalOpen(true);
              }}>
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
                <span>${goal.current_amount.toFixed(2)}</span>
                <span>${goal.target_amount.toFixed(2)}</span>
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
              <div className="flex justify-between">
                <span className={`text-sm font-medium ${isCompleted ? 'text-success-700' : 'text-primary-700'}`}>{percentage.toFixed(0)}% Complete</span>
                <span className="text-sm text-gray-500">Due {timeRemaining}</span>
              </div>
            </div>
          );
        })}
      </div>
      <GoalDetailsModal
        goal={selectedGoal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGoal(null);
        }}
      />
    </div>
  );
}

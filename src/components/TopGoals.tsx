import { useState, useEffect } from 'react';
import { useGoalsStore, Goal } from '../stores/goalsStore';
import { formatCurrency } from '../utils/formatters';
import GoalDetailsModal from './goals/GoalDetailsModal';
import AnimatedList from './common/AnimatedList';
import AnimatedCard from './common/AnimatedCard';
import { Target } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Link } from 'react-router-dom';

export default function TopGoals() {
  const { goals, fetchGoals } = useGoalsStore();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const fetchGoalsEffect = () => {
    fetchGoals();
  };

  useEffect(fetchGoalsEffect, [fetchGoals]);

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
          <p className="text-gray-600">Nenhuma meta criada ainda</p>
          <Link to="/goals" className="text-[#1A1A40] hover:text-[#2A2A50]">
            Criar sua primeira meta →
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
      <AnimatedList
        items={topGoals}
        keyExtractor={(goal: Goal) => goal.id}
        className="grid gap-4"
        animation="slide"
        direction="right"
        renderItem={(goal: Goal) => (
          <AnimatedCard
            onClick={() => handleGoalClick(goal)}
            className="p-4"
          >
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <Target className={`h-5 w-5 mr-2 ${goal.current_amount >= goal.target_amount ? 'text-success-600' : 'text-primary-600'}`} />
                <h3 className="font-semibold text-lg">{goal.title}</h3>
              </div>
              {goal.current_amount >= goal.target_amount && (
                <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                  Completed!
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4 text-sm">{goal.description}</p>
            <div className="flex justify-between text-sm mb-1">
              <span>${formatCurrency(goal.current_amount)}</span>
              <span>${formatCurrency(goal.target_amount)}</span>
            </div>
            <div className="progress-bar mb-2">
              <div 
                className={`progress-fill ${goal.current_amount >= goal.target_amount ? 'bg-success-500' : 'bg-primary-500'}`}
                style={{ 
                  width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%`,
                  '--progress-width': `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%`
                } as React.CSSProperties}
              />
            </div>
            <div className="flex justify-between">
              <span className={`text-sm font-medium ${goal.current_amount >= goal.target_amount ? 'text-success-700' : 'text-primary-700'}`}>{Math.min((goal.current_amount / goal.target_amount) * 100, 100).toFixed(0)}% Complete</span>
              <span className="text-sm text-gray-500">Due {formatDistance(new Date(goal.target_date), new Date(), { addSuffix: true })}</span>
            </div>
          </AnimatedCard>
        )}
      />
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

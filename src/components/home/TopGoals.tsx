import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Target } from 'lucide-react';
import { useGoalsStore } from '../../stores/goalsStore';

export default function TopGoals() {
  const { goals } = useGoalsStore();

  const topGoals = useMemo(() => {
    // Sort by progress percentage and take top 2
    return [...goals]
      .sort((a, b) => {
        const progressA = (a.current_amount / a.target_amount) * 100;
        const progressB = (b.current_amount / b.target_amount) * 100;
        return progressB - progressA;
      })
      .slice(0, 2);
  }, [goals]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#1F2533]">Top Goals</h2>
        <Link 
          to="/goals" 
          className="text-[14px] font-medium text-[#5B3FFB] hover:text-[#4931E4] transition-colors flex items-center"
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topGoals.length > 0 ? (
          topGoals.map((goal) => (
            <div 
              key={goal.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EAE6FE] flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 text-[#5B3FFB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[#1F2533] truncate">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {goal.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        ${goal.current_amount.toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        ${goal.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300 bg-[#5B3FFB]"
                        style={{ width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-[#5B3FFB]">
                        {((goal.current_amount / goal.target_amount) * 100).toFixed(0)}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 bg-gray-50 rounded-xl">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No goals created yet</p>
            <Link 
              to="/goals" 
              className="mt-2 inline-block text-[#5B3FFB] hover:text-[#4931E4] font-medium"
            >
              Create your first goal →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
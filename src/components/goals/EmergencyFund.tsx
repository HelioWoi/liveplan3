import { useState, useEffect } from 'react';
import { useIncomeStore } from '../../stores/incomeStore';
import { useGoalsStore, Goal } from '../../stores/goalsStore';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/authStore';
import { formatISO } from 'date-fns';
import { AlertCircle, PlusCircle } from 'lucide-react';

interface EmergencyFundContribution {
  month: string;
  suggestedAmount: number;
  contributedAmount: number;
  accumulated: number;
  progress: number;
}

export default function EmergencyFund({ setShowForm }: { setShowForm: (show: boolean) => void }) {
  const { totalIncome, fetchTotalIncome } = useIncomeStore();
  const { goals, addGoal, updateGoal, contributeToGoal } = useGoalsStore();
  const { user } = useAuthStore();
  
  const [multiplier, setMultiplier] = useState<number>(6);
  const [contributionAmount, setContributionAmount] = useState<number>(0);
  const [showContributionForm, setShowContributionForm] = useState<boolean>(false);
  const [showMotivationalMessage, setShowMotivationalMessage] = useState<boolean>(true);
  const [contributions, setContributions] = useState<EmergencyFundContribution[]>([]);
  const [emergencyFundGoal, setEmergencyFundGoal] = useState<Goal | null>(null);
  const [isCreatingGoal, setIsCreatingGoal] = useState<boolean>(false);
  const [customIncome, setCustomIncome] = useState<number | null>(null);
  const [isEditingIncome, setIsEditingIncome] = useState<boolean>(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);

  // Fetch income data when component mounts
  useEffect(() => {
    fetchTotalIncome();
  }, [fetchTotalIncome]);

  // Find or create emergency fund goal
  useEffect(() => {
    const findEmergencyFundGoal = () => {
      const foundGoal = goals.find(g => g.title === "Emergency Fund");
      if (foundGoal) {
        setEmergencyFundGoal(foundGoal);
        generateContributionsTable(foundGoal.target_amount, foundGoal.current_amount);
      } else {
        setEmergencyFundGoal(null);
      }
    };

    findEmergencyFundGoal();
  }, [goals]);

  // Calculate target amount based on income and multiplier
  const effectiveIncome = customIncome !== null ? customIncome : totalIncome;
  const targetAmount = effectiveIncome * multiplier;

  // Generate contributions table
  const generateContributionsTable = (target: number, current: number) => {
    const monthlyContribution = totalIncome * 0.1; // Suggest saving 10% of monthly income
    const months = [];
    let accumulated = current;
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const suggestedAmount = monthlyContribution;
      const contributedAmount = i === 0 ? 0 : 0; // Only the first month might have contributions
      
      accumulated = i === 0 ? accumulated : accumulated + suggestedAmount;
      const progress = Math.min(100, (accumulated / target) * 100);
      
      months.push({
        month: monthNames[monthIndex],
        suggestedAmount,
        contributedAmount,
        accumulated,
        progress
      });
      
      // Stop if we've reached the target
      if (accumulated >= target) break;
    }
    
    setContributions(months);
  };

  // Create emergency fund goal
  const createEmergencyFundGoal = async () => {
    if (!user || isCreatingGoal) return;
    
    // Check if emergency fund already exists
    if (emergencyFundGoal) {
      setShowConfirmationDialog(true);
      return;
    }
    
    setIsCreatingGoal(true);
    
    try {
      // Calculate target date (1 year from now)
      const targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + 1);
      
      await addGoal({
        title: "Emergency Fund",
        description: "Your safety net for unexpected expenses. Recommended to be " + multiplier + "x your monthly income.",
        target_amount: targetAmount,
        current_amount: 0,
        target_date: formatISO(targetDate),
        user_id: user.id,
      });
      
      // Goal will be set in the useEffect that watches goals
    } catch (error) {
      console.error('Failed to create emergency fund goal', error);
    } finally {
      setIsCreatingGoal(false);
    }
  };
  
  // Delete existing emergency fund
  const deleteEmergencyFund = async () => {
    if (!emergencyFundGoal) return;
    
    try {
      console.log('Deleting emergency fund with ID:', emergencyFundGoal.id);
      await deleteGoal(emergencyFundGoal.id);
      setShowConfirmationDialog(false);
      setShowUpdateDialog(false);
      // Reset contributions after deletion
      setContributions([]);
    } catch (error) {
      console.error('Failed to delete emergency fund', error);
    }
  };
  
  // Create a regular goal instead
  const createRegularGoal = () => {
    setShowConfirmationDialog(false);
    setShowForm(true); // This will trigger the GoalForm in the parent component
  };

  // Update emergency fund goal multiplier
  const updateMultiplier = async () => {
    if (!emergencyFundGoal) return;
    
    // Show update dialog instead of updating directly
    setShowUpdateDialog(true);
  };
  
  // Actually update the emergency fund goal
  const performUpdate = async () => {
    if (!emergencyFundGoal) return;
    
    try {
      const newTargetAmount = effectiveIncome * multiplier;
      
      await updateGoal(emergencyFundGoal.id, {
        description: "Your safety net for unexpected expenses. Recommended to be " + multiplier + "x your monthly income.",
        target_amount: newTargetAmount
      });
      
      // Regenerate the contributions table with the new target amount
      generateContributionsTable(newTargetAmount, emergencyFundGoal.current_amount);
      
      setShowUpdateDialog(false);
      // Goal will be updated in the useEffect that watches goals
    } catch (error) {
      console.error('Failed to update emergency fund goal', error);
    }
  };

  // Add contribution to emergency fund
  const handleContribute = async () => {
    if (!emergencyFundGoal || contributionAmount <= 0) return;
    
    try {
      await contributeToGoal(emergencyFundGoal.id, contributionAmount);
      setContributionAmount(0);
      setShowContributionForm(false);
    } catch (error) {
      console.error('Failed to contribute to emergency fund', error);
    }
  };

  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    if (!emergencyFundGoal) return "";
    
    const progress = (emergencyFundGoal.current_amount / emergencyFundGoal.target_amount) * 100;
    
    if (progress >= 100) {
      return "Congratulations! You've fully funded your emergency fund!";
    } else if (progress >= 75) {
      return "Almost there! Just a little more to reach your emergency fund goal.";
    } else if (progress >= 50) {
      return "You're halfway to your emergency fund goal. Keep up the great work!";
    } else if (progress >= 25) {
      return "You've already saved 25% of your emergency fund. Excellent progress!";
    } else if (progress > 0) {
      return "You've started building your emergency fund. Every contribution counts!";
    } else {
      return "Start building your emergency fund today for financial security!";
    }
  };

  // Calculate months remaining
  const getMonthsRemaining = () => {
    if (!emergencyFundGoal || emergencyFundGoal.current_amount >= emergencyFundGoal.target_amount) {
      return 0;
    }
    
    const remaining = emergencyFundGoal.target_amount - emergencyFundGoal.current_amount;
    const monthlyContribution = totalIncome * 0.1; // Assuming 10% of income
    
    if (monthlyContribution <= 0) return 0;
    
    return Math.ceil(remaining / monthlyContribution);
  };

  const monthsRemaining = getMonthsRemaining();

  return (
    <>
    <div className="bg-[#1A1A40]/5 rounded-xl shadow-card p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Fund</h2>
      <p className="text-gray-600 mb-6">Start by building an emergency reserve that covers 6 months of your earnings.</p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <p className="text-gray-600 mb-1">Monthly Income:</p>
            {isEditingIncome ? (
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customIncome !== null ? customIncome : totalIncome}
                  onChange={handleIncomeChange}
                  className="p-1 border border-gray-300 rounded-md mr-2 w-32"
                  autoFocus
                />
                <button 
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  onClick={() => {
                    if (customIncomeInput) {
                      const incomeValue = parseFloat(customIncomeInput);
                      if (!isNaN(incomeValue)) {
                        setCustomIncome(incomeValue);
                        // Update contributions table with new income if there's an existing goal
                        if (emergencyFundGoal) {
                          const newTargetAmount = incomeValue * multiplier;
                          generateContributionsTable(newTargetAmount, emergencyFundGoal.current_amount);
                        }
                      }
                    }
                    setIsEditingIncome(false);
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <p className="text-xl font-semibold mr-2">{formatCurrency(customIncome !== null ? customIncome : totalIncome)}</p>
                <button 
                  className="text-primary-600 hover:text-primary-800 text-sm"
                  onClick={() => setIsEditingIncome(true)}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-gray-600 mb-1">Total Target:</p>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                max="24"
                value={multiplier}
                onChange={(e) => {
                  const newMultiplier = Number(e.target.value);
                  setMultiplier(newMultiplier);
                  // Regenerate contributions table with new multiplier
                  if (emergencyFundGoal) {
                    generateContributionsTable(effectiveIncome * newMultiplier, emergencyFundGoal.current_amount);
                  }
                }}
                className="w-16 p-1 border border-gray-300 rounded-md text-center mr-2"
              />
              <span>x Income = {formatCurrency(effectiveIncome * multiplier)}</span>
            </div>
          </div>
        </div>
        
        {emergencyFundGoal ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={updateMultiplier}
          >
            Update Goal Multiplier
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={createEmergencyFundGoal}
            disabled={isCreatingGoal}
          >
            {isCreatingGoal ? 'Creating...' : 'Create Emergency Fund Goal'}
          </button>
        )}
      </div>
      
      {emergencyFundGoal && (
        <>
          <div className="mb-6">
            <p className="text-center font-medium mb-2">You've reached {((emergencyFundGoal.current_amount / emergencyFundGoal.target_amount) * 100).toFixed(1)}% of your emergency fund</p>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{((emergencyFundGoal.current_amount / emergencyFundGoal.target_amount) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${Math.min(100, (emergencyFundGoal.current_amount / emergencyFundGoal.target_amount) * 100)}%` }}
              />
            </div>
          </div>
          
          {showMotivationalMessage && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex justify-between">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {getMotivationalMessage()}
                      {monthsRemaining > 0 && (
                        <span className="block mt-1">
                          Only {monthsRemaining} {monthsRemaining === 1 ? 'month' : 'months'} left to complete your safety goal!
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMotivationalMessage(false)} 
                  className="text-yellow-500 hover:text-yellow-700"
                  aria-label="Close notification"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="mb-6 overflow-x-auto">
            {(() => {
              const progressPercent = (emergencyFundGoal.current_amount / emergencyFundGoal.target_amount) * 100;
              let statusMessage = '';
              let statusEmoji = '';
              let stageNumber = 1;
              let totalStages = 4;
              
              if (progressPercent >= 91) {
                statusEmoji = '🟣';
                stageNumber = 4;
                statusMessage = 'Stage 4 of 4: Completed (91–100%) - Congratulations! You\'ve fully funded your emergency reserve. 👏';
              } else if (progressPercent >= 61) {
                statusEmoji = '🔵';
                stageNumber = 3;
                statusMessage = 'Stage 3 of 4: Final stretch (61–90%) - You\'re almost there! Just a little more to go.';
              } else if (progressPercent >= 21) {
                statusEmoji = '🟡';
                stageNumber = 2;
                statusMessage = 'Stage 2 of 4: Halfway there (21–60%) - Nice progress! You\'re halfway to a fully funded emergency reserve.';
              } else {
                statusEmoji = '🟢';
                stageNumber = 1;
                statusMessage = 'Stage 1 of 4: Starting out (0–20%) - You\'ve just started building your safety net — great decision!';
              }
              
              return (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-600" style={{ width: `${Math.min(100, (stageNumber / totalStages) * 100)}%` }}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium">{stageNumber}/{totalStages}</span>
                  </div>
                  <p className="text-sm font-medium">{statusEmoji} {statusMessage}</p>
                  
                  {stageNumber < totalStages && (
                    <div className="mt-2 text-xs text-gray-500">
                      Estimated time to complete all stages: {Math.ceil(emergencyFundGoal.target_amount / (effectiveIncome * 0.1))} months
                      <span className="block mt-1">
                        (Based on contributing 10% of your monthly income)
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested Monthly Target
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contributed Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accumulated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contributions.map((contribution, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contribution.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(contribution.suggestedAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index === 0 ? formatCurrency(emergencyFundGoal.current_amount) : formatCurrency(contribution.contributedAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(contribution.accumulated)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contribution.progress.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {showContributionForm ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-3">Add Contribution</h3>
              <div className="flex items-center">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={contributionAmount || ''}
                  onChange={(e) => setContributionAmount(Number(e.target.value))}
                  className="input mr-2 flex-1"
                  placeholder="0.00"
                />
                <button
                  className="btn btn-primary"
                  onClick={handleContribute}
                  disabled={contributionAmount <= 0}
                >
                  Add
                </button>
                <button
                  className="btn btn-outline ml-2"
                  onClick={() => {
                    setShowContributionForm(false);
                    setContributionAmount(0);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary w-full flex items-center justify-center"
              onClick={() => setShowContributionForm(true)}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Contribution
            </button>
          )}
        </>
      )}
    </div>
    
    {/* Update Dialog */}
    {showUpdateDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Update Emergency Fund</h2>
          <p className="text-gray-600 mb-6">
            What would you like to do with your emergency fund goal?
          </p>
          <div className="space-y-3">
            <button 
              className="btn btn-primary w-full"
              onClick={performUpdate}
            >
              Edit Current Emergency Fund
            </button>
            <button 
              className="btn btn-warning w-full"
              onClick={deleteEmergencyFund}
            >
              Delete Emergency Fund
            </button>
            <button 
              className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={() => setShowUpdateDialog(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* Confirmation Dialog */}
    {showConfirmationDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Emergency Fund Already Exists</h2>
          <p className="text-gray-600 mb-6">
            You already have an emergency fund goal. What would you like to do?
          </p>
          <div className="space-y-3">
            <button 
              className="btn btn-primary w-full"
              onClick={() => {
                setShowConfirmationDialog(false);
                updateMultiplier();
              }}
            >
              Modify Existing Fund
            </button>
            <button 
              className="btn btn-warning w-full"
              onClick={deleteEmergencyFund}
            >
              Delete and Create New
            </button>
            <button 
              className="btn btn-outline w-full"
              onClick={createRegularGoal}
            >
              Create a Regular Goal Instead
            </button>
            <button 
              className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={() => setShowConfirmationDialog(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

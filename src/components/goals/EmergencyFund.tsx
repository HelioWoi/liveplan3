import { useState, useEffect } from 'react';
import { useIncomeStore } from '../../stores/incomeStore';
import { useGoalsStore, Goal } from '../../stores/goalsStore';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/authStore';
import { formatISO } from 'date-fns';
import { AlertCircle } from 'lucide-react';

interface EmergencyFundContribution {
  month: string;
  suggestedAmount: number;
  contributedAmount: number;
  accumulated: number;
  progress: number;
}

export default function EmergencyFund() {
  const { totalIncome, fetchTotalIncome } = useIncomeStore();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoalsStore();
  const { user } = useAuthStore();
  
  const [multiplier, setMultiplier] = useState<number>(6);
  const [showMotivationalMessage, setShowMotivationalMessage] = useState<boolean>(true);
  const [contributions, setContributions] = useState<EmergencyFundContribution[]>([]);
  const [emergencyFundGoal, setEmergencyFundGoal] = useState<Goal | null>(null);
  const [isCreatingGoal, setIsCreatingGoal] = useState<boolean>(false);
  const [customIncome, setCustomIncome] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState<number | ''>('');

  // Fetch income data when component mounts
  useEffect(() => {
    fetchTotalIncome();
  }, [fetchTotalIncome]);

  // Calculate effective income based on custom or total income
  const effectiveIncome = customIncome !== null ? customIncome : totalIncome;
  const targetAmount = effectiveIncome * multiplier;

  // Find or create emergency fund goal
  useEffect(() => {
    const findEmergencyFundGoal = () => {
      const foundGoal = goals.find(g => g.title === "Emergency Fund");
      if (foundGoal) {
        setEmergencyFundGoal(foundGoal);
        generateContributionsTable(effectiveIncome * multiplier, foundGoal.current_amount);
      } else {
        setEmergencyFundGoal(null);
        // Gerar tabela de contribuições mesmo sem um goal existente
        generateContributionsTable(effectiveIncome * multiplier, 0);
      }
    };

    findEmergencyFundGoal();
  }, [goals, effectiveIncome, multiplier]);
  
  // Gerar tabela de contribuições quando o componente montar ou quando income/multiplier mudar
  useEffect(() => {
    if (emergencyFundGoal) {
      generateContributionsTable(effectiveIncome * multiplier, emergencyFundGoal.current_amount);
    } else {
      generateContributionsTable(effectiveIncome * multiplier, 0);
    }
  }, [effectiveIncome, multiplier, emergencyFundGoal]);

  // Generate contributions table
  const generateContributionsTable = (target: number, current: number) => {
    const monthlyContribution = effectiveIncome * 0.1; // Suggest saving 10% of monthly income
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
      // Se já existe um goal, atualiza-o com os valores atuais
      updateExistingGoal();
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
      
      // Mostrar modal de sucesso
      setShowSuccessModal(true);
      
      // Goal will be set in the useEffect that watches goals
    } catch (error) {
      console.error('Failed to create emergency fund goal', error);
    } finally {
      setIsCreatingGoal(false);
    }
  };
  
  // Função para deletar o fundo de emergência e criar um novo
  const deleteAndCreateNew = async () => {
    if (!emergencyFundGoal) return;
    
    try {
      await deleteGoal(emergencyFundGoal.id);
      // Após deletar, cria um novo goal
      createEmergencyFundGoal();
    } catch (error) {
      console.error('Failed to delete emergency fund', error);
    }
  };
  
  // Update existing emergency fund goal
  const updateExistingGoal = async () => {
    if (!emergencyFundGoal) return;
    
    try {
      const newTargetAmount = effectiveIncome * multiplier;
      
      await updateGoal(emergencyFundGoal.id, {
        description: "Your safety net for unexpected expenses. Recommended to be " + multiplier + "x your monthly income.",
        target_amount: newTargetAmount
      });
      
      // Regenerate the contributions table with the new target amount
      generateContributionsTable(newTargetAmount, emergencyFundGoal.current_amount);
      
    } catch (error) {
      console.error('Failed to update emergency fund goal', error);
    }
  };
  
  // Contribute to emergency fund goal
  const contributeToGoal = async (amount: number) => {
    if (!emergencyFundGoal || amount <= 0) return;
    
    try {
      const newCurrentAmount = emergencyFundGoal.current_amount + amount;
      
      await updateGoal(emergencyFundGoal.id, {
        current_amount: newCurrentAmount
      });
      
      // Regenerate the contributions table with the new current amount
      generateContributionsTable(emergencyFundGoal.target_amount, newCurrentAmount);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Failed to contribute to emergency fund goal', error);
    }
  };

  // Função handleContribute removida pois não é mais necessária
  // O goal é criado diretamente sem solicitar contribuição

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
    const monthlyContribution = effectiveIncome * 0.1; // Assuming 10% of income
    
    if (monthlyContribution <= 0) return 0;
    
    return Math.ceil(remaining / monthlyContribution);
  };

  const monthsRemaining = getMonthsRemaining();

  return (
    <>
      <div className="bg-[#1A1A40]/5 rounded-xl shadow-card p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Fund Calculator</h2>
        <p className="text-gray-600 mb-6">Start by building an emergency reserve that covers 6 months of your earnings.</p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <p className="text-gray-600 mb-1">Monthly Income:</p>
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                step="0.01"
                value={customIncome !== null ? customIncome || '' : totalIncome || ''}
                onChange={(e) => {
                  const newIncome = e.target.value === '' ? 0 : Number(e.target.value);
                  setCustomIncome(newIncome);
                  // Gera a tabela de contribuições com o novo valor
                  if (emergencyFundGoal) {
                    generateContributionsTable(newIncome * multiplier, emergencyFundGoal.current_amount);
                    updateExistingGoal();
                  } else {
                    generateContributionsTable(newIncome * multiplier, 0);
                  }
                }}
                className="input mr-2"
                placeholder="Enter your monthly income"
              />
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-600 mb-1">Total Target:</p>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                max="24"
                value={multiplier || ''}
                onChange={(e) => {
                  const newMultiplier = e.target.value === '' ? 0 : Number(e.target.value);
                  setMultiplier(newMultiplier);
                  // Regenerate contributions table with new multiplier
                  if (emergencyFundGoal) {
                    generateContributionsTable(effectiveIncome * newMultiplier, emergencyFundGoal.current_amount);
                    // Atualiza o goal automaticamente quando o multiplicador muda
                    updateExistingGoal();
                  } else {
                    generateContributionsTable(effectiveIncome * newMultiplier, 0);
                  }
                }}
                className="w-16 p-1 border border-gray-300 rounded-md text-center mr-2"
              />
              <span>x Income = {formatCurrency(effectiveIncome * multiplier)}</span>
            </div>
          </div>
        </div>
        
        {/* Tabela de contribuições é gerada automaticamente quando os valores mudam */}
      </div>
      
      {/* Goal Created Display */}
      {emergencyFundGoal && (
        <div className="mt-4 mb-6 bg-white border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">Your Emergency Fund Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Target Amount:</p>
              <p className="text-xl font-bold text-primary-600">{formatCurrency(emergencyFundGoal.target_amount)}</p>
            </div>
            <div>
              <p className="text-gray-600">Current Amount:</p>
              <p className="text-xl font-bold">{formatCurrency(emergencyFundGoal.current_amount)}</p>
            </div>
            <div>
              <p className="text-gray-600">Target Date:</p>
              <p className="font-medium">{new Date(emergencyFundGoal.target_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
      
      {emergencyFundGoal && (
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
      )}
          
      {emergencyFundGoal && showMotivationalMessage && (
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
          
      {emergencyFundGoal && (
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
            <tbody>
              {contributions.map((contribution, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4">{contribution.month}</td>
                  <td className="py-2 px-4">{formatCurrency(contribution.suggestedAmount)}</td>
                  <td className="py-2 px-4">{formatCurrency(contribution.contributedAmount)}</td>
                  <td className="py-2 px-4">{formatCurrency(contribution.accumulated)}</td>
                  <td className="py-2 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, contribution.progress)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{contribution.progress.toFixed(0)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
            
      {/* Create Goal Button abaixo da planilha */}
      {!emergencyFundGoal && (
        <div className="mt-6">
          <button
            className="btn btn-primary w-full"
            onClick={createEmergencyFundGoal}
            disabled={isCreatingGoal}
          >
            {isCreatingGoal ? 'Processing...' : 'Create Goal'}
          </button>
        </div>
      )}
            
      {/* Update/Delete Buttons - Only shown if goal exists */}
      {emergencyFundGoal && (
        <div className="mt-6 space-y-2">
          <button
            className="btn btn-secondary w-full"
            onClick={() => setShowContributeModal(true)}
          >
            Contribute
          </button>
          <button
            className="btn btn-warning w-full"
            onClick={() => setShowDeleteConfirmModal(true)}
          >
            Delete and Create New
          </button>
        </div>
      )}
    </div>
    {showSuccessModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Success!</h2>
          <p className="text-gray-600 mb-6">
            {emergencyFundGoal && emergencyFundGoal.current_amount >= emergencyFundGoal.target_amount
              ? "Congratulations! You've reached your Emergency Fund goal!"
              : emergencyFundGoal
                ? "Your contribution has been successfully added to your Emergency Fund!"
                : "Your Emergency Fund goal has been created successfully!"}
          </p>
          <button 
            className="btn btn-primary w-full"
            onClick={() => setShowSuccessModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    )}
    
    {showContributeModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Contribute to Emergency Fund</h2>
          <p className="text-gray-600 mb-4">
            How much would you like to contribute to your emergency fund?
          </p>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contribution">
              Contribution Amount:
            </label>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">$</span>
              <input
                id="contribution"
                type="number"
                min="0"
                step="0.01"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="input w-full"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              className="btn btn-secondary flex-1"
              onClick={() => setShowContributeModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary flex-1"
              onClick={() => {
                if (contributionAmount && typeof contributionAmount === 'number' && contributionAmount > 0) {
                  contributeToGoal(contributionAmount);
                  setContributionAmount('');
                  setShowContributeModal(false);
                }
              }}
              disabled={!contributionAmount || contributionAmount <= 0}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
    {/* Delete Confirmation Modal */}
    {showDeleteConfirmModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete your current Emergency Fund goal and create a new one? This action cannot be undone.
          </p>
          <div className="flex space-x-2">
            <button 
              className="btn btn-secondary flex-1"
              onClick={() => setShowDeleteConfirmModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-warning flex-1"
              onClick={() => {
                setShowDeleteConfirmModal(false);
                deleteAndCreateNew();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

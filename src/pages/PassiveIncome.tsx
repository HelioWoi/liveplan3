import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import { Calculator, TrendingUp, DollarSign, PiggyBank, Download, ChevronLeft, ChevronRight, Share2, Target, RefreshCw, X, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { useAuthStore } from '../stores/authStore';
import { useGoalsStore } from '../stores/goalsStore';
import { useNavigate } from 'react-router-dom';

interface SimulationParams {
  initialInvestment: number;
  monthlyContribution: number;
  contributionGrowth: number;
  annualReturn: number;
  monthlyDividends: number;
  duration: number;
}

interface SimulationResult {
  month: number;
  contribution: number;
  balance: number;
  monthlyIncome: number;
}

export function PassiveIncome() {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { user } = useAuthStore();
  const { addGoal, fetchGoals } = useGoalsStore();
  const [params, setParams] = useState<SimulationParams>({
    initialInvestment: 50000,
    monthlyContribution: 300,
    contributionGrowth: 10,
    annualReturn: 18,
    monthlyDividends: 1,
    duration: 30
  });

  const [results, setResults] = useState<SimulationResult[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  const displayedResults = useMemo(() => {
    return results.slice(currentPage * 12, (currentPage + 1) * 12);
  }, [results, currentPage]);

  useEffect(() => {
    if (showResults) {
      const newResults = calculateResults();
      setResults(newResults);
    }
  }, [params.duration]);

  const handleReset = () => {
    setParams({
      initialInvestment: 50000,
      monthlyContribution: 300,
      contributionGrowth: 10,
      annualReturn: 18,
      monthlyDividends: 1,
      duration: 30
    });
    setResults([]);
    setShowResults(false);
    setCurrentPage(0);
  };

  useEffect(() => {
    const loadSavedSimulation = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('simulations')
          .select('params')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data?.params) {
          setParams(data.params);
        }
      } catch (error) {
        console.error('Error loading simulation:', error);
      }
    };

    loadSavedSimulation();
  }, [user, supabase]);

  const saveSimulation = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('simulations')
        .upsert({
          user_id: user.id,
          params
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving simulation:', error);
    }
  };

  const calculateResults = () => {
    const results: SimulationResult[] = [];
    let currentBalance = params.initialInvestment;
    let currentContribution = params.monthlyContribution;
    const monthlyReturn = (params.annualReturn / 12) / 100;
    const monthlyDividendRate = params.monthlyDividends / 100;

    results.push({
      month: 1,
      contribution: params.initialInvestment + currentContribution,
      balance: params.initialInvestment + currentContribution,
      monthlyIncome: (params.initialInvestment + currentContribution) * monthlyDividendRate
    });

    for (let month = 2; month <= params.duration * 12; month++) {
      currentBalance = results[month - 2].balance;
      currentBalance += currentContribution;
      const monthlyInterest = currentBalance * monthlyReturn;
      currentBalance += monthlyInterest;
      const monthlyIncome = currentBalance * monthlyDividendRate;

      results.push({
        month,
        contribution: currentContribution,
        balance: currentBalance,
        monthlyIncome
      });

      if (month % 12 === 0) {
        currentContribution *= (1 + params.contributionGrowth / 100);
      }
    }

    return results;
  };

  const handleDurationChange = (newDuration: number) => {
    setParams(prev => ({ ...prev, duration: newDuration }));
    if (showResults) {
      const newResults = calculateResults();
      setResults(newResults);
      setCurrentPage(0);
    }
  };

  const handleCalculate = () => {
    const results = calculateResults();
    setResults(results);
    setShowResults(true);
    setCurrentPage(0);
    saveSimulation();
  };

  const handleCreateGoal = () => {
    if (!finalResult || !user) {
      setGoalError('Please calculate results first');
      return;
    }
    setGoalError(null);
    setShowGoalModal(true);
  };

  const handleSubmitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalResult || !user) {
      setGoalError('Please calculate results first');
      return;
    }

    if (!goalName.trim()) {
      setGoalError('Please enter a goal name');
      return;
    }

    setIsCreatingGoal(true);
    setGoalError(null);

    try {
      const targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + params.duration);

      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goalName.trim(),
          description: `Monthly Income Target: ${formatCurrency(finalResult.monthlyIncome)}\nInitial Investment: ${formatCurrency(params.initialInvestment)}\nMonthly Contribution: ${formatCurrency(params.monthlyContribution)}`,
          target_amount: finalResult.balance,
          current_amount: 0,
          target_date: targetDate.toISOString()
        });

      if (error) throw error;

      await fetchGoals();
      
      setGoalName('');
      setShowGoalModal(false);
      
      navigate('/goals');
    } catch (error: any) {
      console.error('Failed to create goal:', error);
      setGoalError(error.message || 'Failed to create goal');
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const handleShare = (method: 'sms' | 'whatsapp' | 'email') => {
    if (!finalResult) return;

    const message = `Check out my passive income plan! 📈\n\nTarget: ${formatCurrency(finalResult.balance)}\nMonthly Income: ${formatCurrency(finalResult.monthlyIncome)}\nDuration: ${params.duration} years`;
    
    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(message)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=My Passive Income Plan&body=${encodeURIComponent(message)}`);
        break;
    }

    setShowShareModal(false);
  };

  const exportToCSV = () => {
    const headers = ['Month', 'Monthly Contribution', 'Total Balance', 'Monthly Income'];
    const csvContent = [
      headers.join(','),
      ...results.map(r => [
        r.month,
        formatCurrency(r.contribution).replace('$', ''),
        formatCurrency(r.balance).replace('$', ''),
        formatCurrency(r.monthlyIncome).replace('$', '')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `passive_income_simulation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const finalResult = results[results.length - 1];
  const totalPages = Math.ceil(results.length / 12);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Passive Income Simulator" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Investment Parameters</h2>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="btn btn-outline flex items-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Reset
              </button>
              <button
                onClick={exportToCSV}
                className="btn btn-outline flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                Export Results
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Investment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  className="input pl-8"
                  value={params.initialInvestment}
                  onChange={(e) => setParams(prev => ({ ...prev, initialInvestment: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Contribution
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  className="input pl-8"
                  value={params.monthlyContribution}
                  onChange={(e) => setParams(prev => ({ ...prev, monthlyContribution: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Contribution Growth (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input pr-8"
                  value={params.contributionGrowth}
                  onChange={(e) => setParams(prev => ({ ...prev, contributionGrowth: Number(e.target.value) }))}
                  min="0"
                  max="20"
                  step="0.1"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Annual Return (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input pr-8"
                  value={params.annualReturn}
                  onChange={(e) => setParams(prev => ({ ...prev, annualReturn: Number(e.target.value) }))}
                  min="1"
                  max="25"
                  step="0.1"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Dividends (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input pr-8"
                  value={params.monthlyDividends}
                  onChange={(e) => setParams(prev => ({ ...prev, monthlyDividends: Number(e.target.value) }))}
                  min="0"
                  max="3"
                  step="0.1"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Years)
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={params.duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>5 years</span>
                <span className="font-medium text-primary-600">{params.duration} years</span>
                <span>60 years</span>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full btn btn-primary"
            >
              <Calculator className="h-5 w-5 mr-2" />
              Calculate Results
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Final Balance</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatCurrency(finalResult?.balance || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Income</p>
                <p className="text-xl font-bold text-success-600">
                  {formatCurrency(finalResult?.monthlyIncome || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Returns</p>
                <p className="text-xl font-bold text-warning-600">
                  {formatCurrency((finalResult?.balance || 0) - params.initialInvestment)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Invested</p>
                <p className="text-xl font-bold text-accent-600">
                  {formatCurrency(params.initialInvestment)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {showResults && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-card">
              <h2 className="text-xl font-bold mb-6">Projection Chart</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => `${Math.floor(value / 12)}y ${value % 12}m`}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Month ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      name="Balance"
                      stroke="#4F46E5"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="monthlyIncome"
                      name="Monthly Income"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Monthly Results</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Year {Math.floor(currentPage * 12 / 12) + 1}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage >= totalPages - 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 px-4 text-left font-medium text-gray-500">Month</th>
                      <th className="py-2 px-4 text-right font-medium text-gray-500">Contribution</th>
                      <th className="py-2 px-4 text-right font-medium text-gray-500">Balance</th>
                      <th className="py-2 px-4 text-right font-medium text-gray-500">Income</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedResults.map((result) => (
                      <tr key={result.month} className="hover:bg-gray-50">
                        <td className="py-2 px-4 text-left">{result.month}</td>
                        <td className="py-2 px-4 text-right font-mono">{formatCurrency(result.contribution)}</td>
                        <td className="py-2 px-4 text-right font-mono">{formatCurrency(result.balance)}</td>
                        <td className="py-2 px-4 text-right font-mono">{formatCurrency(result.monthlyIncome)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-card">
              <h2 className="text-xl font-bold mb-4">Save & Share</h2>
              <div className="flex gap-4">
                <button
                  onClick={handleCreateGoal}
                  className="flex-1 btn btn-primary"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Create Goal
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 btn btn-outline"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create Goal</h2>
              <button
                onClick={() => {
                  setShowGoalModal(false);
                  setGoalError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Name <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  className={`input ${goalError ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="e.g., Family Passive Income"
                  value={goalName}
                  onChange={(e) => {
                    setGoalName(e.target.value);
                    if (goalError) setGoalError(null);
                  }}
                  required
                />
              </div>

              {goalError && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{goalError}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target Amount:</span>
                  <span className="font-medium">{formatCurrency(finalResult?.balance || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Income:</span>
                  <span className="font-medium">{formatCurrency(finalResult?.monthlyIncome || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{params.duration} years</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreatingGoal || !goalName.trim()}
                  className={`btn btn-primary flex-1 ${isCreatingGoal ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCreatingGoal ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Goal'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGoalModal(false);
                    setGoalError(null);
                  }}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
            <h2 className="text-xl font-bold mb-4">Share Results</h2>
            <div className="space-y-4">
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full btn btn-outline"
              >
                Share via WhatsApp
              </button>
              <button
                onClick={() => handleShare('sms')}
                className="w-full btn btn-outline"
              >
                Share via SMS
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-full btn btn-outline"
              >
                Share via Email
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

export default PassiveIncome;
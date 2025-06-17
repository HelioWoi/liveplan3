import { useNavigate } from 'react-router-dom';
import { Calculator, TrendingUp, LifeBuoy, Target } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';

export default function SimulatorPage() {
  const navigate = useNavigate();
  
  // Funções para navegar diretamente para as páginas correspondentes
  const goToInvestmentParameters = () => navigate('/passive-income');
  const goToEmergencyFund = () => navigate('/emergency-fund');
  const goToSetGoal = () => navigate('/goals?action=create');

  return (
    <div className="pb-24">
      <PageHeader title="Financial Calculator" />
      
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="text-center py-8">
          <div className="mb-6 flex justify-center">
            <Calculator className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-primary-900 mb-2">Financial Calculator</h1>
          <p className="text-gray-600 mb-8">
            Choose a calculator option to help plan your financial future
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Investment Parameters Card */}
            <button
              onClick={goToInvestmentParameters}
              className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary-300"
            >
              <div className="flex items-center justify-center h-16 w-16 bg-primary-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-primary-900">Investment Parameters</h3>
              <p className="text-sm text-gray-500 text-center mt-2">Calculate your investment returns</p>
            </button>
            
            {/* Emergency Fund Card */}
            <button
              onClick={goToEmergencyFund}
              className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary-300"
            >
              <div className="flex items-center justify-center h-16 w-16 bg-accent-100 rounded-full mb-4">
                <LifeBuoy className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-lg font-medium text-primary-900">Emergency Fund</h3>
              <p className="text-sm text-gray-500 text-center mt-2">Plan your safety net</p>
            </button>
            
            {/* Set a Goal Card */}
            <button
              onClick={goToSetGoal}
              className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary-300"
            >
              <div className="flex items-center justify-center h-16 w-16 bg-success-100 rounded-full mb-4">
                <Target className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-lg font-medium text-primary-900">Set a Goal</h3>
              <p className="text-sm text-gray-500 text-center mt-2">Create and track financial goals</p>
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BankSelector from '../components/bank/BankSelector';
import CubeLogoLivePlan from '../components/brand/CubeLogoLivePlan';
import { useBankConnectionStore } from '../stores/bankConnectionStore';
import { useAuthStore } from '../stores/authStore';
import { getBasiqApiKey } from '../utils/basiqUtils';
import basiqService from '../services/basiqService';
import { Shield, Key, ExternalLink } from 'lucide-react';

enum OnboardingStep {
  SELECT_BANK,
  CONNECTING,
  CONNECTION_READY,
  SUCCESS,
  ERROR
}

export default function BankOnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.SELECT_BANK);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionUrl, setConnectionUrl] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuthStore();
  const bankConnectionStore = useBankConnectionStore();
  
  // Check if the user has already configured the Basiq API key
  useEffect(() => {
    const apiKey = getBasiqApiKey();
    setHasApiKey(!!apiKey);
  }, []);

  // Handle bank selection
  const handleBankSelected = async (bankId: string) => {
    setSelectedBankId(bankId);
    setCurrentStep(OnboardingStep.CONNECTING);
    setError(null);
    
    try {
      setIsLoading(true);
      
      // Usar dados do usuário atual ou valores padrão
      const email = user?.email || 'user@example.com';
      const firstName = user?.user_metadata?.first_name || 'Test';
      const lastName = user?.user_metadata?.last_name || 'User';
      const mobile = user?.phone || '';

      console.log('Criando usuário e obtendo link de conexão...');
      console.log('Dados do usuário:', { email, firstName, lastName, mobile });

      // Chamar o serviço para criar usuário e obter link
      const result = await basiqService.createUserAndGetConnectionLink(
        email,
        firstName,
        lastName,
        mobile
      );

      console.log('Resultado da conexão:', result);

      // Verificar se temos um URL de conexão válido
      if (result?.connectionData?.steps?.[0]?.action?.url) {
        // Definir o URL de conexão e avançar para o próximo passo
        setConnectionUrl(result.connectionData.steps[0].action.url);
        setCurrentStep(OnboardingStep.CONNECTION_READY);
      } else {
        throw new Error('Nenhum URL de conexão encontrado na resposta');
      }
    } catch (error: any) {
      console.error('Erro ao conectar banco:', error);
      setError(error.message || 'Falha ao conectar ao banco');
      setCurrentStep(OnboardingStep.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the connection URL in a new tab
  const handleOpenConnectionUrl = () => {
    if (connectionUrl) {
      window.open(connectionUrl, '_blank');
      
      // In a real implementation, we would have a webhook to notify when the connection is complete
      // For now, we'll simulate success after a delay
      setTimeout(() => {
        setCurrentStep(OnboardingStep.SUCCESS);
        // Initialize bank connection store
        bankConnectionStore.initialize();
      }, 5000);
    }
  };

  // Restart the process
  const handleRetry = () => {
    setSelectedBankId(null);
    setError(null);
    setConnectionUrl(null);
    setCurrentStep(OnboardingStep.SELECT_BANK);
  };

  // Finish and go to the home page
  const handleFinish = () => {
    navigate('/home');
  };

  // Check if the user has the API key configured
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-4 py-6">
          <div className="mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          </div>
          
          <div className="flex justify-center mb-8">
            <CubeLogoLivePlan size="large" />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 p-4 rounded-full">
                <Shield className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">API Key Required</h2>
            
            <p className="text-gray-700 mb-6">
              To connect your bank account, you need to configure the Basiq API key first. 
              This is required to securely access your banking data.
            </p>
            
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={() => navigate('/basiq-config')}
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Key className="h-5 w-5 mr-2" />
                Configure API Key
              </button>
              
              <button
                onClick={() => navigate('/onboarding-choice')}
                className="text-gray-600 hover:text-gray-800"
              >
                Back to Onboarding Options
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case OnboardingStep.SELECT_BANK:
        return (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6">Select Your Bank</h2>
            <BankSelector onBankSelected={handleBankSelected} />
          </div>
        );
      case OnboardingStep.CONNECTING:
        return (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6">Connecting to Your Bank</h2>
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-gray-600">Establishing secure connection...</p>
            </div>
          </div>
        );
      case OnboardingStep.CONNECTION_READY:
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Ready to Connect</h2>
            <p className="mb-6">
              Click the button below to open the bank connection page. You will be redirected to a secure site where you can provide your banking credentials.
            </p>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">Connection link generated:</p>
              <p className="text-sm text-blue-600 break-all mt-2">{connectionUrl || ''}</p>
            </div>
            <a 
              href={connectionUrl || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ExternalLink className="mr-2" size={20} />
              Connect to Bank
            </a>
            <p className="mt-4 text-sm text-gray-600">
              After completing the connection process, return to this page and click "Continue".
            </p>
            <button
              onClick={() => setCurrentStep(OnboardingStep.SUCCESS)}
              className="mt-6 px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Continue
            </button>
          </div>
        );
      case OnboardingStep.SUCCESS:
        return (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6">Connection Successful!</h2>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-600 mb-6">Your bank account has been successfully connected.</p>
            <button 
              onClick={handleFinish} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go to Home
            </button>
          </div>
        );
      case OnboardingStep.ERROR:
        return (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6">Connection Failed</h2>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 mb-2">We couldn't connect to your bank.</p>
            <p className="text-gray-600 mb-6">{error || 'Please try again or select a different bank.'}</p>
            <button 
              onClick={handleRetry} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <CubeLogoLivePlan className="mb-2 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Bank Account</h1>
          <p className="text-gray-600 mb-8">
            Connect your bank account to automatically import your transactions and keep your financial planning up to date.
          </p>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= OnboardingStep.SELECT_BANK ? 'bg-[#1A1A40] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                currentStep > OnboardingStep.SELECT_BANK ? 'bg-[#1A1A40]' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= OnboardingStep.CONNECTING ? 'bg-[#1A1A40] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                currentStep > OnboardingStep.CONNECTING ? 'bg-[#1A1A40]' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= OnboardingStep.SUCCESS ? 'bg-[#1A1A40] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Select bank</span>
              <span>Connect</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Content based on current step */}
          {renderStep()}
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg mb-24">  {/* Added mb-24 for spacing */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your Data is Secure</h3>
        <p className="text-gray-600 text-sm">
          We use the Basiq platform to connect to your bank securely. Your banking credentials are never stored by us.
          We only receive access to read your transactions, without permission to make any movements.
        </p>
      </div>
    </div>
  );
}

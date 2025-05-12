import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BankSelector from '../components/bank/BankSelector';
import CubeLogoLivePlan from '../components/brand/CubeLogoLivePlan';
import { useBankConnectionStore } from '../stores/bankConnectionStore';
import { useAuthStore } from '../stores/authStore';

enum OnboardingStep {
  SELECT_BANK,
  CONNECTING,
  SUCCESS,
  ERROR
}

export default function BankOnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.SELECT_BANK);
  // Armazenamos o ID do banco apenas para uso futuro quando implementarmos a integração real
  const [, setSelectedBankId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionUrl, setConnectionUrl] = useState<string | null>(null);
  const { user } = useAuthStore();
  const bankConnectionStore = useBankConnectionStore();

  // Manipular a seleção do banco
  const handleBankSelected = async (bankId: string) => {
    setSelectedBankId(bankId);
    setCurrentStep(OnboardingStep.CONNECTING);
    
    try {
      // Em produção, isso geraria uma URL de conexão real
      // const url = await basiqService.generateConnectionUrl(bankId);
      
      // Para desenvolvimento, simulamos o processo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // URL simulada para teste
      const mockUrl = `https://connect.basiq.io/consent?institution=${bankId}&userId=${user?.id || 'mock-user'}&token=mock-token`;
      setConnectionUrl(mockUrl);
      
      // Em produção, redirecionaríamos para esta URL
      // window.location.href = url;
      
      // Para desenvolvimento, vamos simular um sucesso após um tempo
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(OnboardingStep.SUCCESS);
      
      // Atualizar a lista de conexões
      await bankConnectionStore.refreshConnections();
    } catch (err: any) {
      console.error('Error connecting to bank:', err);
      setError(err.message || 'Falha ao conectar com o banco');
      setCurrentStep(OnboardingStep.ERROR);
    }
  };

  // Reiniciar o processo
  const handleRetry = () => {
    setSelectedBankId(null);
    setError(null);
    setConnectionUrl(null);
    setCurrentStep(OnboardingStep.SELECT_BANK);
  };

  // Finalizar e ir para a página home
  const handleFinish = () => {
    navigate('/home');
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

          {/* Indicador de progresso */}
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

          {/* Conteúdo baseado na etapa atual */}
          {currentStep === OnboardingStep.SELECT_BANK && (
            <BankSelector onBankSelected={handleBankSelected} />
          )}

          {currentStep === OnboardingStep.CONNECTING && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1A1A40] mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Connecting to your bank</h2>
              <p className="text-gray-600">
                We're establishing a secure connection with your bank. This may take a moment...
              </p>
              {connectionUrl && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                  <p className="text-sm text-gray-600 mb-2">
                    In a production environment, you would be redirected to:
                  </p>
                  <code className="block p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {connectionUrl}
                  </code>
                </div>
              )}
            </div>
          )}

          {currentStep === OnboardingStep.SUCCESS && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Connection Established Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your bank account has been successfully connected. Now you can view your transactions and manage your finances.
              </p>
              <button
                onClick={handleFinish}
                className="px-6 py-3 bg-[#1A1A40] text-white rounded-md hover:bg-[#2D2D6A] transition-colors"
              >
                Go to Home
              </button>
            </div>
          )}

          {currentStep === OnboardingStep.ERROR && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
              <p className="text-gray-600 mb-2">
                We couldn't establish a connection with your bank. Please try again.
              </p>
              {error && (
                <p className="text-red-600 text-sm mb-6">{error}</p>
              )}
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-[#1A1A40] text-white rounded-md hover:bg-[#2D2D6A] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg mb-24">  {/* Adicionado mb-24 para espaçamento */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your Data is Secure</h3>
        <p className="text-gray-600 text-sm">
          We use the Basiq platform to connect to your bank securely. Your banking credentials are never stored by us.
          We only receive access to read your transactions, without permission to make any movements.
        </p>
      </div>
    </div>
  );
}

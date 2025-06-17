import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import CubeLogoLivePlan from '../components/brand/CubeLogoLivePlan';
import SpreadsheetUploadModal from '../components/modals/SpreadsheetUploadModal';

// Importar estilos de animação
import '../styles/animations.css';

export default function OnboardingChoicePage() {
  const navigate = useNavigate();
  // Podemos usar o usuário para personalização futura, mas não estamos usando agora
  const { user: _ } = useAuthStore();
  const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);
  const [showComingSoonMessage, setShowComingSoonMessage] = useState(false);
  const [messageClass, setMessageClass] = useState('animate-fade-in-down');

  // Controlar a animação de fade out antes de remover a mensagem
  useEffect(() => {
    if (showComingSoonMessage) {
      const timer = setTimeout(() => {
        setMessageClass('animate-fade-out');
        
        // Remover a mensagem após a animação de fade out
        setTimeout(() => {
          setShowComingSoonMessage(false);
          setMessageClass('animate-fade-in-down'); // Resetar para próxima exibição
        }, 500); // Tempo da animação de fade out
      }, 3000); // Mostrar por 3 segundos
      
      return () => clearTimeout(timer);
    }
  }, [showComingSoonMessage]);

  const handleBankConnection = () => {
    // Mostrar mensagem de "em breve disponível" em vez de navegar
    setShowComingSoonMessage(true);
  };

  const handleSpreadsheetImport = () => {
    setShowSpreadsheetModal(true);
  };

  const handleCloseSpreadsheetModal = (uploadCompleted: boolean = false) => {
    setShowSpreadsheetModal(false);
    // Redirecionar para a página inicial apenas se o upload foi completado
    if (uploadCompleted) {
      navigate('/home');
    }
    // Se não foi completado, permanece na página de escolha de onboarding
  };

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        
        <SpreadsheetUploadModal open={showSpreadsheetModal} onClose={handleCloseSpreadsheetModal} />
        
        {/* Mensagem de "em breve disponível" */}
        {showComingSoonMessage && (
          <div className={`fixed inset-x-0 top-6 flex justify-center z-50 ${messageClass}`}>
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Bank connection feature coming soon! Stay tuned.</span>
            </div>
          </div>
        )}
        
        <div className="max-w-5xl mx-auto w-full flex flex-col justify-center">
          <div className="text-center mb-10 mt-4">
            <h2 className="text-2xl font-medium text-gray-800 mb-0">Welcome to</h2>
            <div className="-mt-2">
              <CubeLogoLivePlan className="mx-auto" size="massive" withSlogan={true} />
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto -mt-4">
              Let's get started with your financial planning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Bank Connection Option - Hidden for now */}
            <div 
              onClick={handleBankConnection}
              className="hidden bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 border-2 border-blue-200 relative"
            >
              {/* Badge "Coming Soon" com tamanho reduzido */}
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-medium">
                Coming Soon
              </div>
              
              <div className="p-5">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l9-4 9 4m-9-4v20m-9-4h18" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-center mb-3">Connect Bank Account</h2>
                <p className="text-gray-600 text-center mb-4">
                  Automatically import transactions from your bank account
                </p>
                {/* Botão Recommended removido */}
              </div>
            </div>

            {/* Spreadsheet Import Option */}
            <div 
              onClick={handleSpreadsheetImport}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="p-5">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-center mb-3">Import Spreadsheet</h2>
                <p className="text-gray-600 text-center mb-4">
                  Upload a spreadsheet with your transaction data
                </p>
                <div className="mt-4 text-center">
                  <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Available Now
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Entry Option */}
            <div 
              onClick={handleSkip}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="p-5">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-center mb-3">Manual Entry</h2>
                <p className="text-gray-600 text-center mb-4">
                  Enter your transactions manually as you go
                </p>
                <div className="mt-4 text-center">
                  <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    Flexible Option
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow-sm mb-8 border border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg text-gray-800 mb-2">Not ready to send your spreadsheet yet?</h3>
                <p className="text-gray-700 mb-4">
                  No problem! You can always import it later from your Profile page.
                  Just click "Import Data" from the dashboard when you're ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

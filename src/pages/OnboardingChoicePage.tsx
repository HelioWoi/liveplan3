import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ArrowRight, Upload, Key, Building, ChevronRight } from 'lucide-react';
import CubeLogoLivePlan from '../components/brand/CubeLogoLivePlan';
import SpreadsheetUploadModal from '../components/modals/SpreadsheetUploadModal';

export default function OnboardingChoicePage() {
  const navigate = useNavigate();
  // Podemos usar o usuário para personalização futura
  const { user: _ } = useAuthStore();
  const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);

  const handleBankConnection = () => {
    navigate('/bank-onboarding');
  };

  const handleSpreadsheetImport = () => {
    setShowSpreadsheetModal(true);
  };

  const handleCloseSpreadsheetModal = () => {
    setShowSpreadsheetModal(false);
    // Após fechar o modal, podemos redirecionar para a página inicial
    navigate('/home');
  };

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <>
      <SpreadsheetUploadModal open={showSpreadsheetModal} onClose={handleCloseSpreadsheetModal} />
      <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-medium text-gray-700 mb-2">Welcome to</h2>
          <CubeLogoLivePlan className="mb-4 mx-auto" size="large" />
          <p className="text-lg text-gray-600">
            Let's get started with your financial planning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">  {/* Reduzido o espaçamento inferior */}
          {/* Bank Connection Option */}
          <div 
            onClick={handleBankConnection}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200"
          >
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l9-4 9 4m-9-4v20m-9-4h18" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2">Connect Bank Account</h2>
              <p className="text-gray-600 text-center">
                Automatically import transactions from your bank account
              </p>
              <div className="mt-4 text-center">
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Recommended
                </span>
              </div>
            </div>
          </div>

          {/* Spreadsheet Import Option */}
          <div 
            onClick={handleSpreadsheetImport}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2">Import Spreadsheet</h2>
              <p className="text-gray-600 text-center">
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
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2">Manual Entry</h2>
              <p className="text-gray-600 text-center">
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

        <div className="grid grid-cols-1 gap-6 mt-8">
          <button
            onClick={() => navigate('/basiq-config')}
            className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-full mr-4">
                <Key className="h-6 w-6 text-primary-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">Configure API Key</h3>
                <p className="text-sm text-gray-600">Set up your Basiq API key first</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
            </div>
          </button>
          
          <button
            onClick={() => navigate('/bank-onboarding')}
            className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-full mr-4">
                <Building className="h-6 w-6 text-primary-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">Connect Bank Account</h3>
                <p className="text-sm text-gray-600">Import your transactions automatically</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
            </div>
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-12">
          <h3 className="font-medium text-gray-800 mb-2">Not ready to connect yet?</h3>
          <p className="text-gray-600 mb-4">
            No problem! You can always connect your bank account or import data later by:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li>Going to your <span className="font-medium">Profile</span> page and selecting <span className="font-medium">Connect Bank Account</span></li>
            <li>Clicking on <span className="font-medium">Import Data</span> from the dashboard</li>
            <li>Accessing <span className="font-medium">Settings</span> &rarr; <span className="font-medium">Data Sources</span></li>
          </ul>
          <p className="text-gray-600 text-sm">
            You can always change your data sources later in the settings
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

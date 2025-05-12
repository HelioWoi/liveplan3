import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBasiqApiKey, storeBasiqApiKey, clearBasiqApiKey } from '../utils/basiqUtils';
import basiqService from '../services/basiqService';
import BottomNavigation from '../components/layout/BottomNavigation';
import { Shield, Key, Save, Trash } from 'lucide-react';

export default function BasiqApiConfig() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we already have a stored API key
    const storedKey = getBasiqApiKey();
    setHasStoredKey(!!storedKey);
    if (storedKey) {
      // Mask the API key for security
      setApiKey(storedKey.substring(0, 5) + '...' + storedKey.substring(storedKey.length - 5));
    }
  }, []);

  const handleSaveKey = async () => {
    if (!apiKey) {
      setTestResult({
        success: false,
        message: 'Please enter an API key'
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Store the API key
      storeBasiqApiKey(apiKey);
      setHasStoredKey(true);

      // Test the connection
      const success = await basiqService.testConnection();
      
      setTestResult({
        success,
        message: success ? 'Connection successful!' : 'Connection failed. Please check your API key.'
      });

      if (success) {
        // Redirect to bank onboarding page after a short delay
        setTimeout(() => {
          navigate('/bank-onboarding');
        }, 2000);
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearKey = () => {
    clearBasiqApiKey();
    setApiKey('');
    setHasStoredKey(false);
    setTestResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-primary-600 mr-3" />
          <h1 className="text-2xl font-bold">Basiq API Configuration</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-primary-600" />
            API Key Configuration
          </h2>
          
          <p className="mb-4 text-gray-700">
            To connect with your bank accounts, we need to configure the Basiq API key. 
            This key is stored securely in your browser and is only used to communicate with the Basiq API.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Basiq API Key
            </label>
            <input
              type={hasStoredKey ? "password" : "text"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onPaste={(e) => {
                // Permitir colar a chave API
                const pastedText = e.clipboardData.getData('text');
                setApiKey(pastedText);
                e.preventDefault(); // Prevenir o comportamento padrão
              }}
              placeholder="Cole sua chave API Basiq aqui"
              disabled={isLoading}
            />
            {hasStoredKey && (
              <p className="mt-1 text-xs text-gray-500">
                API key is stored. Enter a new key to update.
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSaveKey}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Testing...' : hasStoredKey ? 'Update Key' : 'Save Key'}
            </button>
            
            {hasStoredKey && (
              <button
                onClick={handleClearKey}
                disabled={isLoading}
                className="flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
              >
                <Trash className="h-4 w-4 mr-2" />
                Clear Key
              </button>
            )}
          </div>

          {testResult && (
            <div className={`mt-4 p-3 rounded-md ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.message}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          
          <p className="mb-4 text-gray-700">
            After configuring the API key, you'll be able to:
          </p>
          
          <ul className="list-disc pl-5 mb-4 text-gray-700">
            <li className="mb-2">Connect to your bank accounts</li>
            <li className="mb-2">Import transactions automatically</li>
            <li className="mb-2">Keep your financial data up to date</li>
          </ul>
          
          <button
            onClick={() => navigate('/bank-onboarding')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Go to Bank Connection
          </button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

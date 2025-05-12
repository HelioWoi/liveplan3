import { useState, useEffect } from 'react';
import { basiqService } from '../../services/basiqService';
import { storeBasiqApiKey, getBasiqApiKey, hasBasiqApiKey } from '../../utils/basiqUtils';
import { useBankConnectionStore } from '../../stores/bankConnectionStore';

export default function BasiqConnectionTest() {
  const [apiKey, setApiKey] = useState(getBasiqApiKey());
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState(hasBasiqApiKey());
  
  const { 
    connections, 
    accounts,
    isConnected,
    error,
    initialize,
    fetchConnections
  } = useBankConnectionStore();

  // Initialize the bank connection store when the component mounts
  useEffect(() => {
    if (hasKey) {
      initialize();
    }
  }, [initialize, hasKey]);

  const handleSetApiKey = () => {
    if (!apiKey) {
      setTestResult('Please enter an API key');
      return;
    }
    
    try {
      storeBasiqApiKey(apiKey);
      setHasKey(true);
      setTestResult('API key stored successfully');
    } catch (error: any) {
      setTestResult(`Error storing API key: ${error.message}`);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing connection...');
    
    try {
      const result = await basiqService.testConnection();
      setTestResult(result ? 'Connection successful!' : 'Connection failed');
    } catch (error: any) {
      setTestResult(`Connection error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchConnections = async () => {
    setIsLoading(true);
    setTestResult('Fetching connections...');
    
    try {
      await fetchConnections();
      setTestResult(`Fetched ${connections.length} connections`);
    } catch (error: any) {
      setTestResult(`Error fetching connections: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Basiq API Connection Test</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Basiq API Key"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A1A40] focus:border-[#1A1A40]"
          />
          <button
            onClick={handleSetApiKey}
            className="px-4 py-2 bg-[#1A1A40] text-white rounded-md hover:bg-[#2A2A50] transition-colors"
            disabled={isLoading}
          >
            Set Key
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleTestConnection}
          className="px-4 py-2 bg-[#1A1A40] text-white rounded-md hover:bg-[#2A2A50] transition-colors"
          disabled={isLoading || !hasKey}
        >
          Test Connection
        </button>
        
        <button
          onClick={handleFetchConnections}
          className="px-4 py-2 bg-[#1A1A40] text-white rounded-md hover:bg-[#2A2A50] transition-colors"
          disabled={isLoading || !hasKey}
        >
          Fetch Connections
        </button>
      </div>
      
      {testResult && (
        <div className={`p-4 rounded-md mb-6 ${
          testResult.includes('successful') || testResult.includes('Fetched')
            ? 'bg-green-50 text-green-700'
            : testResult.includes('Testing') || testResult.includes('Fetching')
            ? 'bg-blue-50 text-blue-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {testResult}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md mb-6">
          Error: {error}
        </div>
      )}
      
      {isConnected && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
          <div className="p-3 bg-green-50 text-green-700 rounded-md">
            Connected to Basiq API
          </div>
        </div>
      )}
      
      {connections.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Connections ({connections.length})</h3>
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {connections.map((connection) => (
                  <tr key={connection.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {connection.institution.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        connection.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : connection.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {connection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(connection.lastUsed).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {accounts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Accounts ({accounts.length})</h3>
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${account.balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${account.availableFunds.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

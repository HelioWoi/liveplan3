import { useState, useEffect } from 'react';
import { getBasiqApiKey } from '../utils/basiqUtils';
import basiqService from '../services/basiqService';

export default function BasiqDirectTest() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Check if we have a stored API key
    const key = getBasiqApiKey();
    if (key) {
      setApiKey(key);
      // Mask the key for display
      const maskedKey = key.substring(0, 5) + '...' + key.substring(key.length - 5);
      console.log('Found API key (masked):', maskedKey);
    } else {
      console.log('No API key found');
    }
  }, []);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setResult('Testing direct connection to Basiq API...');

    try {
      // Use the directApiTest method from basiqService
      const response = await basiqService.directApiTest();
      console.log('Direct API test response:', response);
      
      if (response.error) {
        setResult(`Connection failed: ${response.error}`);
      } else if (response.status) {
        setResult(`Connection successful! Status: ${response.status} ${response.statusText || ''}`);
      } else {
        setResult('Unexpected response format from API test');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWithKey = async () => {
    if (!apiKey) {
      setResult('No API key available');
      return;
    }

    setIsLoading(true);
    setResult('Testing with API key...');

    try {
      // Use the basiqService to test the connection
      const success = await basiqService.testConnection();
      
      if (success) {
        setResult('Connection successful! API key is valid.');
      } else {
        setResult('Connection failed. API key may be invalid or there might be network issues.');
      }
    } catch (error) {
      console.error('Error calling Basiq API:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Basiq Direct API Test</h1>
      <p className="mb-4 text-gray-700">
        This page tests direct connectivity to the Basiq API without using proxies.
        Note that this will likely fail due to CORS restrictions, but the errors will be helpful for debugging.
      </p>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">API Key Status</h2>
        <p className="mb-4">
          {apiKey ? 'API key is available' : 'No API key found'}
        </p>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleTestConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Basic Connection
          </button>

          <button
            onClick={handleTestWithKey}
            disabled={isLoading || !apiKey}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test With API Key
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded ${result.includes('successful') ? 'bg-green-100' : 'bg-red-100'}`}>
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Debugging Tips</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Open your browser's developer console (F12) to see detailed error messages</li>
          <li>CORS errors are expected when testing directly - this is just for diagnostic purposes</li>
          <li>If you see "Failed to fetch" errors, it's likely due to CORS restrictions</li>
        </ul>
      </div>
    </div>
  );
}

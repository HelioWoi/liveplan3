import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BasiqConnectionTest from '../components/bank/BasiqConnectionTest';

export default function BasiqTestPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Basiq API Integration Test</h1>
        </div>
        
        <p className="text-gray-500 mb-6">
          This page allows you to test the connection to the Basiq API and view your bank connections.
        </p>
        
        <BasiqConnectionTest />
      </div>
    </div>
  );
}

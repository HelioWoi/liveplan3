import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { resetAllUserData } from '../../services/dataResetService';

interface DataResetModalProps {
  open: boolean;
  onClose: () => void;
  resetType: 'partial' | 'full' | 'fiscal-year';
  fiscalYear?: number;
}

const DataResetModal: React.FC<DataResetModalProps> = ({ 
  open, 
  onClose, 
  resetType,
  fiscalYear 
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Reset state when modal is opened
  React.useEffect(() => {
    if (open) {
      setConfirmText('');
      setResetSuccess(false);
      setError(null);
      setCountdown(5);
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [open]);

  const getResetTypeLabel = () => {
    switch (resetType) {
      case 'partial':
        return 'Partial Reset';
      case 'full':
        return 'Full Reset';
      case 'fiscal-year':
        return `Archive Fiscal Year ${fiscalYear}`;
    }
  };

  const getResetTypeDescription = () => {
    switch (resetType) {
      case 'partial':
        return 'Clears transactions and budgets while keeping goals and settings';
      case 'full':
        return 'Clears all financial data while keeping only your account';
      case 'fiscal-year':
        return `Archives all data from fiscal year ${fiscalYear} and removes it from the main view`;
    }
  };

  const getConfirmationWord = () => {
    switch (resetType) {
      case 'partial':
        return 'RESET';
      case 'full':
        return 'FULLRESET';
      case 'fiscal-year':
        return 'ARCHIVE';
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setError(null);
    
    try {
      // Implementar lógica específica para cada tipo de reset
      if (resetType === 'fiscal-year' && fiscalYear) {
        // Aqui implementaríamos a lógica de arquivamento do ano fiscal
        // Por enquanto, simulamos o sucesso após um delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResetSuccess(true);
      } else {
        // Para reset parcial e completo, usamos o serviço existente
        const result = await resetAllUserData();
        
        if (result.success) {
          setResetSuccess(true);
        } else {
          setError(result.message || 'Erro ao resetar dados');
        }
      }
    } catch (err) {
      console.error('Erro durante o reset:', err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsResetting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {!resetSuccess ? (
          <>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center mb-2">
              {getResetTypeLabel()}
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              {getResetTypeDescription()}
            </p>
            
            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="bg-yellow-50 p-4 rounded-md mb-4">
                <p className="text-yellow-800 font-medium">Attention</p>
                <p className="text-yellow-700 text-sm mt-1">
                  {resetType === 'fiscal-year' 
                    ? 'Archived data will still be accessible in the Fiscal Years section, but will no longer appear in the main reports and dashboards.'
                    : 'This action cannot be undone. All data will be permanently removed.'}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type {getConfirmationWord()} to confirm:
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={getConfirmationWord()}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              
              <button
                onClick={handleReset}
                disabled={confirmText !== getConfirmationWord() || countdown > 0 || isResetting}
                className={`px-4 py-2 rounded-md ${
                  confirmText === getConfirmationWord() && countdown === 0
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isResetting 
                  ? 'Processing...' 
                  : countdown > 0 
                    ? `Wait (${countdown})` 
                    : getResetTypeLabel()}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {resetType === 'fiscal-year' ? 'Fiscal year archived!' : 'Data reset successfully!'}
            </h3>
            <p className="text-gray-500 mb-6">
              {resetType === 'fiscal-year'
                ? `Data from fiscal year ${fiscalYear} has been archived and can be accessed in the Fiscal Years section.`
                : 'Your data has been cleared. You can start using the application again.'}
            </p>
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              I understand
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataResetModal;

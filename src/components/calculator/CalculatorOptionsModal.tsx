
import { useNavigate } from 'react-router-dom';
import { X, TrendingUp, LifeBuoy, Target } from 'lucide-react';

interface CalculatorOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalculatorOptionsModal({ isOpen, onClose }: CalculatorOptionsModalProps) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  const handleOptionClick = (path: string) => {
    navigate(path);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-lg p-6 mx-4 w-full max-w-md" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary-900">Calculator Options</h2>
          <button 
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        <div className="grid gap-4">
          {/* Investment Parameters */}
          <button
            className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary-300"
            onClick={() => handleOptionClick('/passive-income')}
          >
            <div className="flex items-center justify-center h-12 w-12 bg-primary-100 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium text-primary-900">Investment Parameters</h3>
              <p className="text-sm text-gray-500">Calculate your investment returns</p>
            </div>
          </button>
          
          {/* Emergency Fund Calculator */}
          <button
            className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary-300"
            onClick={() => handleOptionClick('/goals')}
          >
            <div className="flex items-center justify-center h-12 w-12 bg-accent-100 rounded-full mr-4">
              <LifeBuoy className="h-6 w-6 text-accent-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium text-primary-900">Emergency Fund Calculator</h3>
              <p className="text-sm text-gray-500">Plan your safety net</p>
            </div>
          </button>
          
          {/* Set a Goal */}
          <button
            className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary-300"
            onClick={() => handleOptionClick('/goals?action=create')}
          >
            <div className="flex items-center justify-center h-12 w-12 bg-success-100 rounded-full mr-4">
              <Target className="h-6 w-6 text-success-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium text-primary-900">Set a Goal</h3>
              <p className="text-sm text-gray-500">Create and track financial goals</p>
            </div>
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <button
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';

interface FeedbackContextType {
  showToast: (message: string, type?: ToastType) => void;
  showProgress: (message: string, progress: number) => void;
  showLoading: (message: string) => void;
  hideLoading: () => void;
}

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface Progress {
  message: string;
  progress: number;
}

interface Loading {
  message: string;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

interface FeedbackProviderProps {
  children: ReactNode;
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState<Loading | null>(null);
  const haptics = useHaptics();

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Haptic feedback based on type
    switch (type) {
      case 'success':
        haptics.success();
        break;
      case 'error':
        haptics.error();
        break;
      case 'warning':
        haptics.warning();
        break;
      default:
        haptics.light();
    }

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const showProgress = (message: string, progress: number) => {
    setProgress({ message, progress });
    haptics.medium();
  };

  const showLoading = (message: string) => {
    setLoading({ message });
    haptics.light();
  };

  const hideLoading = () => {
    setLoading(null);
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <FeedbackContext.Provider value={{ showToast, showProgress, showLoading, hideLoading }}>
      {children}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`flex items-center p-4 rounded-lg border ${getToastColor(toast.type)} shadow-lg max-w-sm`}
            >
              {getToastIcon(toast.type)}
              <span className="ml-3 text-sm font-medium text-gray-900">{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 z-50"
          >
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
              <div className="text-sm font-medium text-gray-900 mb-2">{progress.message}</div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Spinner */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
              <div className="flex items-center justify-center space-x-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                />
                <span className="text-sm font-medium text-gray-900">{loading.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
}

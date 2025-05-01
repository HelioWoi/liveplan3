import { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import classNames from 'classnames';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 mb-4 mr-4 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={classNames(
              'animate-slide-up rounded-lg shadow-lg p-4 max-w-xs',
              {
                'bg-success-50 text-success-700 border-l-4 border-success-500': toast.type === 'success',
                'bg-error-50 text-error-700 border-l-4 border-error-500': toast.type === 'error',
                'bg-warning-50 text-warning-700 border-l-4 border-warning-500': toast.type === 'warning',
                'bg-primary-50 text-primary-700 border-l-4 border-primary-500': toast.type === 'info',
              }
            )}
          >
            <div className="flex justify-between items-center">
              <p>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-500 hover:text-gray-700 ml-2"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastContainer() {
  return <ToastProvider>{null}</ToastProvider>;
}
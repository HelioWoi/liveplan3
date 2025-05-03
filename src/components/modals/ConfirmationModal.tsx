import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      icon: 'text-red-600',
      bg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700',
      ring: 'focus:ring-red-500',
    },
    warning: {
      icon: 'text-amber-600',
      bg: 'bg-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700',
      ring: 'focus:ring-amber-500',
    },
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl animate-slideUp">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 ${colors[type].bg} rounded-full flex-shrink-0`}>
              <AlertTriangle className={`h-6 w-6 ${colors[type].icon}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-gray-600">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-white ${colors[type].button} rounded-lg transition-colors ${colors[type].ring} focus:ring-2 focus:ring-offset-2 focus:outline-none`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

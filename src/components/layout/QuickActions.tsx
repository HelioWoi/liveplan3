import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Target, 
  DollarSign,
  Receipt,
  X,
  ChevronUp
} from 'lucide-react';

interface QuickAction {
  id: string;
  icon: JSX.Element;
  label: string;
  action: () => void;
}

interface QuickActionsProps {
  onAddTransaction?: () => void;
}

export default function QuickActions({ onAddTransaction }: QuickActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: 'add-transaction',
      icon: <Plus className="h-4 w-4" />,
      label: 'Add Transaction',
      action: () => {
        if (onAddTransaction) {
          onAddTransaction();
        } else {
          navigate('/transactions');
        }
        setIsExpanded(false);
      }
    },
    {
      id: 'add-goal',
      icon: <Target className="h-4 w-4" />,
      label: 'Add Goal',
      action: () => {
        navigate('/goals');
        setIsExpanded(false);
      }
    },
    {
      id: 'add-investment',
      icon: <DollarSign className="h-4 w-4" />,
      label: 'Add Investment',
      action: () => {
        navigate('/investments');
        setIsExpanded(false);
      }
    },
    {
      id: 'add-bill',
      icon: <Receipt className="h-4 w-4" />,
      label: 'Add Bill',
      action: () => {
        navigate('/bills');
        setIsExpanded(false);
      }
    }
  ];

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <div className={`
        flex flex-col items-end space-y-2
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Actions */}
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-full
              bg-[#1A1A40] text-white hover:bg-[#2A2A50]
              shadow-lg transform transition-all duration-200
              ${isExpanded ? 'translate-x-0' : 'translate-x-12'}
            `}
          >
            <span className="text-sm whitespace-nowrap">{action.label}</span>
            {action.icon}
          </button>
        ))}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          mt-4 p-4 rounded-full bg-[#1A1A40] text-white
          shadow-lg hover:bg-[#2A2A50] transition-all duration-300
          flex items-center justify-center
        `}
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <ChevronUp className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}

import { ButtonHTMLAttributes } from 'react';

interface PeriodButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export default function PeriodButton({ 
  children, 
  isActive = false, 
  className = '',
  ...props 
}: PeriodButtonProps) {
  return (
    <button
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all
        ${isActive 
          ? 'bg-gradient-to-r from-[#A855F7] to-[#9333EA] text-white shadow-sm' 
          : 'bg-white text-gray-700 border border-[#E5E7EB] hover:bg-gray-50'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

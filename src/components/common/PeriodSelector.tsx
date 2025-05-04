import { useState, useRef, useEffect } from 'react';
import PeriodButton from './PeriodButton';
import { ChevronDown } from 'lucide-react';

type Period = 'Day' | 'Week' | 'Month' | 'Year';
type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

interface PeriodSelectorProps {
  onPeriodChange: (period: Period) => void;
  onMonthChange: (month: Month) => void;
  selectedPeriod: Period;
  selectedMonth: Month;
}

export default function PeriodSelector({
  onPeriodChange,
  onMonthChange,
  selectedPeriod,
  selectedMonth
}: PeriodSelectorProps) {
  const [showMonths, setShowMonths] = useState(false);

  const periods: Period[] = ['Day', 'Week', 'Month', 'Year'];
  const months: Month[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePeriodClick = (period: Period) => {
    onPeriodChange(period);
    if (period === 'Month') {
      setShowMonths(true);
    } else {
      setShowMonths(false);
    }
  };

  const handleMonthClick = (month: Month) => {
    onMonthChange(month);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMonths(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Period Buttons */}
        {periods.map((period) => (
          <PeriodButton
            key={period}
            onClick={() => handlePeriodClick(period)}
            isActive={selectedPeriod === period}
          >
            {period}
          </PeriodButton>
        ))}

        {/* Month Dropdown */}
        {selectedPeriod === 'Month' && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowMonths(!showMonths)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                bg-gradient-to-r from-[#A855F7] to-[#9333EA] text-white shadow-sm"
            >
              {selectedMonth}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showMonths && (
              <div className="absolute z-10 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1 max-h-60 overflow-auto">
                  {months.map((month) => (
                    <button
                      key={month}
                      onClick={() => {
                        handleMonthClick(month);
                        setShowMonths(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-purple-50
                        ${selectedMonth === month ? 'bg-purple-100 text-purple-900' : 'text-gray-700'}`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

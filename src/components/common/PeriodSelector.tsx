import { useState, useRef, useEffect } from 'react';
import PeriodButton from './PeriodButton';
import { ChevronDown } from 'lucide-react';

type Period = 'Day' | 'Week' | 'Month' | 'Year';
type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

interface PeriodSelectorProps {
  onPeriodChange: (period: Period) => void;
  onMonthChange: (month: Month) => void;
  onYearChange?: (year: string) => void;
  selectedPeriod: Period;
  selectedMonth: Month;
  selectedYear?: string;
}

export default function PeriodSelector({
  onPeriodChange,
  onMonthChange,
  onYearChange,
  selectedPeriod,
  selectedMonth,
  selectedYear
}: PeriodSelectorProps) {
  const [showMonths, setShowMonths] = useState(false);
  const [showYears, setShowYears] = useState(false);

  const periods: Period[] = ['Day', 'Week', 'Month', 'Year'];
  const months: Month[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => (2022 + i).toString());

  const handlePeriodClick = (period: Period) => {
    onPeriodChange(period);
    if (period === 'Month') {
      setShowMonths(true);
      setShowYears(false);
    } else if (period === 'Year') {
      setShowYears(true);
      setShowMonths(false);
    } else {
      setShowMonths(false);
      setShowYears(false);
    }
  };

  const handleMonthClick = (month: Month) => {
    onMonthChange(month);
  };

  const handleYearClick = (year: string) => {
    onYearChange?.(year);
  };

  const monthsDropdownRef = useRef<HTMLDivElement>(null);
  const yearsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (monthsDropdownRef.current && !monthsDropdownRef.current.contains(event.target as Node)) {
        setShowMonths(false);
      }
      if (yearsDropdownRef.current && !yearsDropdownRef.current.contains(event.target as Node)) {
        setShowYears(false);
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
            {period === 'Year' && selectedPeriod === 'Year' ? selectedYear : period}
          </PeriodButton>
        ))}

        {/* Month Dropdown */}
        {selectedPeriod === 'Month' && (
          <div className="relative" ref={monthsDropdownRef}>
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

        {/* Year Dropdown */}
        {selectedPeriod === 'Year' && (
          <div className="relative" ref={yearsDropdownRef}>
            <button
              onClick={() => setShowYears(!showYears)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                bg-gradient-to-r from-[#A855F7] to-[#9333EA] text-white shadow-sm"
            >
              {selectedYear || currentYear}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showYears && (
              <div className="absolute z-10 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1 max-h-60 overflow-auto">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        handleYearClick(year);
                        setShowYears(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-purple-50
                        ${selectedYear === year ? 'bg-purple-100 text-purple-900' : 'text-gray-700'}`}
                    >
                      {year}
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

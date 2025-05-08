import { useState, useRef, useEffect } from 'react';
import PeriodButton from '../common/PeriodButton';
import { ChevronDown } from 'lucide-react';

type Period = 'Month' | 'Year';
type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

interface InvestmentPeriodSelectorProps {
  onPeriodChange: (period: Period) => void;
  onMonthChange: (month: Month) => void;
  onYearChange?: (year: string) => void;
  selectedPeriod: Period;
  selectedMonth: Month;
  selectedYear?: string;
}

export default function InvestmentPeriodSelector({
  onPeriodChange,
  onMonthChange,
  onYearChange,
  selectedPeriod,
  selectedMonth,
  selectedYear
}: InvestmentPeriodSelectorProps) {
  const [showMonths, setShowMonths] = useState(false);
  const [showYears, setShowYears] = useState(false);

  const periods: Period[] = ['Month', 'Year'];
  const months: Month[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
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
    setShowMonths(false);
  };

  const handleYearClick = (year: string) => {
    onYearChange?.(year);
    setShowYears(false);
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
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg p-2 z-10 w-48 grid grid-cols-2 gap-1">
                {months.map((month) => (
                  <button
                    key={month}
                    onClick={() => handleMonthClick(month)}
                    className={`px-2 py-1 text-sm rounded-md ${
                      selectedMonth === month
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {month}
                  </button>
                ))}
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
              {selectedYear}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showYears && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg p-2 z-10 w-32">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearClick(year)}
                    className={`block w-full px-2 py-1 text-sm text-left rounded-md ${
                      selectedYear === year
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

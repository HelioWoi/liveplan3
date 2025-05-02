import { useState } from 'react';
import PeriodButton from './PeriodButton';

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

  return (
    <div className="space-y-4">
      {/* Period Buttons */}
      <div className="flex flex-wrap gap-2">
        {periods.map((period) => (
          <PeriodButton
            key={period}
            onClick={() => handlePeriodClick(period)}
            isActive={selectedPeriod === period}
          >
            {period}
          </PeriodButton>
        ))}
      </div>

      {/* Month Buttons - Only show when Month period is selected */}
      {showMonths && (
        <div className="flex flex-wrap gap-2">
          {months.map((month) => (
            <PeriodButton
              key={month}
              onClick={() => handleMonthClick(month)}
              isActive={selectedMonth === month}
            >
              {month}
            </PeriodButton>
          ))}
        </div>
      )}
    </div>
  );
}

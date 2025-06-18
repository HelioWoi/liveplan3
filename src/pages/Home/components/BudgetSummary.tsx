import { useState } from "react";

import type { Month, Period, WeekNumber } from "../types";

import { Skeleton } from '../../../components';

import { formatCurrency } from '../../../utils/formatters';
import { getCurrentMonth, getCurrentWeek, getCurrentYear } from "./helper";
import PeriodSelector from "../../../components/common/PeriodSelector";
import { useBudgetSummary } from "./useBudgetSummary";

export function BudgetSummary() {
  const [selectedPeriodState, setSelectedPeriodState] = useState<{
    period: Period;
    month: Month;
    year: string;
    week: WeekNumber;
  }>({
    period: 'Week',
    month: getCurrentMonth(), // "Jun" - Value for testing
    year: getCurrentYear(), // 2025 - Value for testing
    week: getCurrentWeek(), // 3 - Value for testing
  });

  function updateSelectedPeriod(partial: Partial<typeof selectedPeriodState>) {
    setSelectedPeriodState(prev => ({ ...prev, ...partial }));
  }

  const { isLoading, totalIncome, totalExpenses } = useBudgetSummary(selectedPeriodState);
  
  return (
    <div className="max-w-3xl mx-auto px-4 space-y-6 mt-6">
      <div className="bg-white rounded-xl p-4 mb-6 shadow-card">
        <PeriodSelector
          selectedPeriod={selectedPeriodState.period}
          selectedMonth={selectedPeriodState.month}
          selectedYear={selectedPeriodState.year}
          selectedWeek={selectedPeriodState.week}
          onPeriodChange={period => updateSelectedPeriod({ period })}
          onMonthChange={month => updateSelectedPeriod({ month })}
          onYearChange={year => updateSelectedPeriod({ year })}
          onWeekChange={week => updateSelectedPeriod({ week })}
          useShortMonthNames={true}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Total Income</h3>
          {isLoading ? (
            <Skeleton height={28} />
          ) : (
            <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
          )}
          <p className="text-xs text-gray-500">All income in the period</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Total Expenses</h3>
          {isLoading ? (
            <Skeleton height={28} />
          ) : (
            <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
          )}
          <p className="text-xs text-gray-500">All expenses in the period</p>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PeriodButton from "./PeriodButton";
import type {
  Month,
  Period,
  WeekNumber,
} from "../../pages/@types/period-selection";
import { SHORT_MONTHS } from "../../constants";
interface PeriodSelectorProps {
  onPeriodChange: (period: Period) => void;
  onMonthChange: (month: Month) => void;
  onYearChange?: (year: string) => void;
  onWeekChange?: (week: WeekNumber) => void;
  selectedPeriod: Period;
  selectedMonth: Month;
  selectedYear?: number | string;
  selectedWeek?: WeekNumber;
  useShortMonthNames?: boolean;
}

export default function PeriodSelector({
  onPeriodChange,
  onMonthChange,
  onYearChange,
  onWeekChange,
  selectedPeriod,
  selectedMonth,
  selectedYear,
  selectedWeek = "1",
  useShortMonthNames = false,
}: PeriodSelectorProps) {
  const navigate = useNavigate();
  const [showMonths, setShowMonths] = useState(false);
  const [showYears, setShowYears] = useState(false);
  const [showWeeks, setShowWeeks] = useState(false);

  const periods: Period[] = ["Week", "Month", "Year"];
  const months: Month[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 4 }, (_, i) => (2022 + i).toString());

  // Function to determine if a month has 5 weeks
  const hasFiveWeeks = (month: Month, year: string): boolean => {
    const monthIndex = months.indexOf(month);
    if (monthIndex === -1) return false;

    // Get the first day of the month
    const firstDay = new Date(parseInt(year), monthIndex, 1);

    // Get the last day of the month
    const lastDay = new Date(parseInt(year), monthIndex + 1, 0);

    // Calculate the number of days in the month
    const daysInMonth = lastDay.getDate();

    // Calculate the day of week the month starts on (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();

    // Calculate total number of weeks
    // If the month starts late in the week and has many days, it might span 5 weeks
    const totalWeeks = Math.ceil((firstDayOfWeek + daysInMonth) / 7);

    return totalWeeks >= 5;
  };

  // Ensure the selected week is valid for the current month
  useEffect(() => {
    // If Week 5 is selected but the current month doesn't have 5 weeks, reset to Week 4
    if (
      selectedWeek === "5" &&
      !hasFiveWeeks(
        selectedMonth,
        selectedYear?.toString() || new Date().getFullYear().toString()
      )
    ) {
      if (onWeekChange) {
        onWeekChange("4");
      }
    }
  }, [selectedMonth, selectedYear, selectedWeek, onWeekChange]);

  // Determine available weeks based on the selected month
  const getAvailableWeeks = (): WeekNumber[] => {
    const baseWeeks: WeekNumber[] = ["1", "2", "3", "4"];
    if (
      hasFiveWeeks(
        selectedMonth,
        selectedYear?.toString() || new Date().getFullYear().toString()
      )
    ) {
      return [...baseWeeks, "5"];
    }
    return baseWeeks;
  };

  const weeks = getAvailableWeeks();

  const handlePeriodClick = (period: Period) => {
    // Se for Week e a semana selecionada for 5 ("View More"), redirecionar para o Dashboard
    if (period === "Week" && selectedWeek === "5") {
      navigate("/dashboard");
      return;
    }

    onPeriodChange(period);
    if (period === "Month") {
      setShowMonths(!showMonths);
      setShowYears(false);
      setShowWeeks(false);
    } else if (period === "Year") {
      setShowYears(!showYears);
      setShowMonths(false);
      setShowWeeks(false);
    } else if (period === "Week") {
      setShowWeeks(!showWeeks);
      setShowMonths(false);
      setShowYears(false);
    } else {
      setShowMonths(false);
      setShowYears(false);
      setShowWeeks(false);
    }
  };

  const handleMonthClick = (month: Month) => {
    onMonthChange(month);
    // Keep the month dropdown open after selection
    setShowMonths(true);
  };

  const handleYearClick = (year: string) => {
    if (onYearChange) {
      onYearChange(year);
    }
    setShowYears(false);
  };

  const handleWeekClick = (week: WeekNumber) => {
    // Se for a semana 5 ("View More"), redirecionar para o Dashboard
    if (week === "5") {
      navigate("/dashboard");
      return;
    }

    if (onWeekChange) {
      onWeekChange(week);
    }
    setShowWeeks(false);
  };

  const monthsDropdownRef = useRef<HTMLDivElement>(null);
  const yearsDropdownRef = useRef<HTMLDivElement>(null);
  const weeksDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        monthsDropdownRef.current &&
        !monthsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMonths(false);
      }
      if (
        yearsDropdownRef.current &&
        !yearsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowYears(false);
      }
      if (
        weeksDropdownRef.current &&
        !weeksDropdownRef.current.contains(event.target as Node)
      ) {
        setShowWeeks(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            {period === "Week" && selectedWeek
              ? selectedWeek === "5"
                ? "View More"
                : `Week ${selectedWeek}`
              : period === "Month"
              ? useShortMonthNames
                ? SHORT_MONTHS[selectedMonth]
                : selectedMonth
              : period === "Year"
              ? selectedYear || new Date().getFullYear().toString()
              : period}
          </PeriodButton>
        ))}
      </div>

      {/* Week Dropdown */}
      {selectedPeriod === "Week" && showWeeks && (
        <div className="mt-2" ref={weeksDropdownRef}>
          <div className="grid grid-cols-4 gap-2">
            {weeks.map((week) => (
              <button
                key={week}
                onClick={() => handleWeekClick(week)}
                className={`py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                  selectedWeek === week
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "border border-gray-200 text-gray-700 hover:border-purple-200"
                }`}
              >
                {week === "5" ? "View More" : `Week ${week}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Month Dropdown */}
      {selectedPeriod === "Month" && showMonths && (
        <div className="mt-2" ref={monthsDropdownRef}>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
            {months.map((month) => (
              <button
                key={month}
                onClick={() => handleMonthClick(month)}
                className={`py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                  selectedMonth === month
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "border border-gray-200 text-gray-700 hover:border-purple-200"
                }`}
              >
                {useShortMonthNames ? SHORT_MONTHS[month] : month}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Year Dropdown */}
      {selectedPeriod === "Year" && showYears && (
        <div className="mt-2" ref={yearsDropdownRef}>
          <div className="flex gap-2">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => handleYearClick(year)}
                className={`py-1.5 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedYear === year
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "border border-gray-200 text-gray-700 hover:border-purple-200"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { MONTHS_FULL } from "../../constants";
import type { Month, WeekNumber } from "../@types/period-selection";

// Converter nome do mês para número (0-11)
export const getMonthNumber = (monthName: string): number => {
  const months = [
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

  return months.indexOf(monthName);
};

export const getCurrentMonth = (): Month => MONTHS_FULL[new Date().getMonth()];

export const getCurrentYear = (): string => new Date().getFullYear().toString();

export const getCurrentWeek = (): WeekNumber => {
  const date = new Date();
  const dayOfMonth = date.getDate();
  const weekNumber = Math.ceil(dayOfMonth / 7);
  return weekNumber > 5 ? '5' : weekNumber.toString() as WeekNumber;
};

export * from './totalIncomeFn';
export * from './totalExpensesFn';

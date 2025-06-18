import { MONTHS_FULL } from "../../../../constants";
import type { Month, WeekNumber } from "../../types";

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

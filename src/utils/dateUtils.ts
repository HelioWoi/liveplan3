import { MONTHS, MONTHS_FULL } from '../constants';

/**
 * Converts a week string (e.g., "Week 1") to a date in the specified month and year
 * Week 1: Days 1-7
 * Week 2: Days 8-14
 * Week 3: Days 15-21
 * Week 4: Days 22-end of month
 */
export function weekToDate(week: string, month: string, year: number): Date {
  const monthFull = MONTHS.filter(m => m.full === month || m.short === month);
  const monthIndex = getMonthIndex(monthFull[0].full);
  let day = 1;
  
  // Determine the day based on the week
  switch (week) {
    case 'Week 1':
      day = 1; // First day of the month
      break;
    case 'Week 2':
      day = 8; // 8th day of the month
      break;
    case 'Week 3':
      day = 15; // 15th day of the month
      break;
    case 'Week 4':
      day = 22; // 22nd day of the month
      break;
    default:
      day = 1;
  }

  return new Date(year, monthIndex, day);
}

/**
 * Converts a month name to its index (0-11)
 */
export function getMonthIndex(month: any): number {
  return MONTHS_FULL.indexOf(month);
}

/**
 * Determines which week of the month a date falls into
 */
export function getWeekOfMonth(date: Date): 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4' {
  const day = date.getDate();
  
  if (day <= 7) return 'Week 1';
  if (day <= 14) return 'Week 2';
  if (day <= 21) return 'Week 3';
  return 'Week 4';
}

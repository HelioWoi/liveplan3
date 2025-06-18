import type { Month } from '../pages/Home/types';

// Anos fixos de 2022 a 2025
export const YEARS = [2022, 2023, 2024, 2025];

export const CATEGORIES = ['Income', 'Fixed', 'Variable', 'Extra', 'Additional'];

export const MONTHS_FULL: Month[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const SHORT_MONTHS: Record<Month, string> = {
    'January': 'Jan',
    'February': 'Feb',
    'March': 'Mar',
    'April': 'Apr',
    'May': 'May',
    'June': 'Jun',
    'July': 'Jul',
    'August': 'Aug',
    'September': 'Sep',
    'October': 'Oct',
    'November': 'Nov',
    'December': 'Dec'
  };

export const monthMap = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

export const MONTHS = [
  { full: 'January', short: 'Jan' },
  { full: 'February', short: 'Feb' },
  { full: 'March', short: 'Mar' },
  { full: 'April', short: 'Apr' },
  { full: 'May', short: 'May' },
  { full: 'June', short: 'Jun' },
  { full: 'July', short: 'Jul' },
  { full: 'August', short: 'Aug' },
  { full: 'September', short: 'Sep' },
  { full: 'October', short: 'Oct' },
  { full: 'November', short: 'Nov' },
  { full: 'December', short: 'Dec' }
];

// Categoria descriptions for tooltips
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Fixed: 'Mandatory and recurring expenses, such as rent, school, health insurance, etc.',
  Variable: 'Flexible and monthly expenses, such as groceries, fuel, delivery.',
  Extra: 'Non-standard costs, such as unexpected repairs or last-minute travel. Should be used with caution.',
  Additional: 'Non-essential expenses that you chose to make, such as gifts or parties. Ideally, these should be planned.',
  Income: 'Money received from salary, freelance work, or other sources.'
};
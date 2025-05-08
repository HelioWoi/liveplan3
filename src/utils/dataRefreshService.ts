// Data Refresh Service
// Provides centralized data refresh functionality across the application

// Flag names for different types of data that might need refreshing
export const REFRESH_FLAGS = {
  TRANSACTIONS: 'refresh_transactions_data',
  WEEKLY_BUDGET: 'refresh_weekly_budget_data',
  GOALS: 'refresh_goals_data',
  INCOME: 'refresh_income_data',
  ALL: 'refresh_all_data'
};

// Set a refresh flag with optional timestamp
export const setRefreshFlag = (flag: string, value: string = Date.now().toString()) => {
  localStorage.setItem(flag, value);
};

// Check if a refresh flag is set
export const checkRefreshFlag = (flag: string): boolean => {
  return !!localStorage.getItem(flag);
};

// Clear a specific refresh flag
export const clearRefreshFlag = (flag: string) => {
  localStorage.removeItem(flag);
};

// Clear all refresh flags
export const clearAllRefreshFlags = () => {
  Object.values(REFRESH_FLAGS).forEach(flag => {
    localStorage.removeItem(flag);
  });
};

// Set all refresh flags at once (useful after spreadsheet import)
export const setAllRefreshFlags = () => {
  const timestamp = Date.now().toString();
  Object.values(REFRESH_FLAGS).forEach(flag => {
    localStorage.setItem(flag, timestamp);
  });
};

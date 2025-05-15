/**
 * Formats a numeric value to Australian Dollar (AUD) with two decimal places
 * @param value - Value to be formatted
 * @returns String formatted as currency
 */
export const formatCurrency = (value: number): string => {
  // Ensure the value is a valid number
  const safeValue = isNaN(value) ? 0 : value;
  
  // Format with AUD and always with 2 decimal places
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);
};

/**
 * Processes text input for currency format
 * @param value - Text value to be processed
 * @returns Clean string for use in currency calculations
 */
export const parseCurrencyInput = (value: string): string => {
  // Remove currency symbol and any non-numeric characters except decimal point
  let cleanValue = value.replace(/[^0-9.]/g, '');
  
  // Handle multiple decimal points
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    cleanValue = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 2 decimal places
  if (parts.length === 2) {
    cleanValue = parts[0] + '.' + parts[1].slice(0, 2);
  }
  
  // Format with thousand separators and 2 decimal places
  const number = parseFloat(cleanValue || '0');
  if (isNaN(number)) return '0.00';
  
  return number.toFixed(2);
};

/**
 * Formats a number for display with thousand separators
 * @param value - Numeric value to be formatted
 * @returns String formatted with thousand separators
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-AU');
};

/**
 * Processes text input for numeric format
 * @param value - Text value to be processed
 * @returns Clean string for use in numeric calculations
 */
export const parseNumericInput = (value: string): string => {
  // Remove any non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  return cleanValue;
};
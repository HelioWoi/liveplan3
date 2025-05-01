export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const parseCurrencyInput = (value: string): string => {
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

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-AU').format(value);
};

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
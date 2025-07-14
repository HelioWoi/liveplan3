import { Transaction, TransactionCategory, TransactionType } from '../types/transaction';
import Papa from 'papaparse';

interface SpreadsheetRow {
  Date: string;
  Month: string;
  Type: string;
  Category: string;
  Description: string;
  Amount: string | number;
  Frequency?: string;
}

export const validateSpreadsheetFormat = async (file: File): Promise<boolean> => {
  try {
    if (file.name.endsWith('.csv')) {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const requiredHeaders = ['Date', 'Month', 'Type', 'Category', 'Description', 'Amount'];
            const headers = results.meta.fields || [];
            
            const hasAllHeaders = requiredHeaders.every(header => 
              headers.includes(header)
            );

            resolve(hasAllHeaders);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } else if (file.name.match(/\.xlsx?$/)) {
      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const headers = Object.keys(worksheet)
        .filter(key => key.match(/^[A-Z]1$/))
        .map(key => worksheet[key].v);

      const requiredHeaders = ['Date', 'Type', 'Category', 'Description', 'Amount'];
      return requiredHeaders.every(header => headers.includes(header));
    }
    return false;
  } catch (error) {
    console.error('Error validating file:', error);
    return false;
  }
};

export const parseSpreadsheet = async (file: File): Promise<Partial<Transaction>[]> => {
  try {
    if (file.name.endsWith('.csv')) {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              const transactions = processRows(results.data as SpreadsheetRow[]);
              resolve(transactions);
            } catch (error) {
              reject(error);
            }
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } else if (file.name.match(/\.xlsx?$/)) {
      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<SpreadsheetRow>(worksheet);
      return processRows(rows);
    }
    throw new Error('Unsupported file format');
  } catch (error) {
    console.error('Error parsing file:', error);
    throw error;
  }
};

const processRows = (rows: SpreadsheetRow[]): Partial<Transaction>[] => {
  return rows
    .map(row => {
      // Validate date format
      const date = new Date(row.Date);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format in row: ${JSON.stringify(row)}`);
      }

      // Parse amount and validate it's positive
      const amount = typeof row.Amount === 'string' ? 
        parseFloat(row.Amount.replace(/[^0-9.-]+/g, '')) : 
        row.Amount;

      if (isNaN(amount)) {
        throw new Error(`Invalid amount in row: ${JSON.stringify(row)}`);
      }

      // Validate month
      if (!row.Month) {
        throw new Error(`Month is required in row: ${JSON.stringify(row)}`);
      }

      // Map category and validate
      const category = mapCategory(row.Category);
      const type = determineType(row.Type);

      const transaction: Partial<Transaction> = {
        date: date.toISOString(),
        amount: Math.abs(amount),
        category,
        type,
        origin: row.Description,
        description: row.Description,
        user_id: 'current-user'
      };

      return transaction;
    })
    .filter((t): t is Partial<Transaction> => t !== null);
};

const mapCategory = (category: string): TransactionCategory => {
  // Normalize category name
  const normalizedCategory = category.trim().toLowerCase();
  
  const categoryMap: Record<string, TransactionCategory> = {
    'income': 'Income',
    'salary': 'Income',
    'investment': 'Investment',
    'fixed': 'Fixed',
    'variable': 'Variable',
    'extra': 'Extra',
    'additional': 'Additional',
    'tax': 'Tax',
    'invoices': 'Invoices',
    'contribution': 'Contribution',
    'goal': 'Goal',
    'rent': 'Fixed',
    'groceries': 'Variable',
    'gift': 'Extra'
  };

  const mappedCategory = categoryMap[normalizedCategory];

  if (!mappedCategory) {
    throw new Error(`Invalid category: ${category}. Valid categories are: ${Object.values(categoryMap).join(', ')}`);
  }
  return mappedCategory;
};

const determineType = (type: string): TransactionType => {
  const normalizedType = type.trim().toLowerCase();
  const incomeTypes = ['income', 'salary', 'bonus', 'investment', 'invoices'];
  return incomeTypes.includes(normalizedType) ? 'income' : 'expense';
};

export const generateTemplateFile = (): string => {
  const headers = ['Date', 'Month', 'Type', 'Category', 'Description', 'Amount', 'Frequency'];
  const sampleData = [
    ['07/01/2025', 'June', 'income', 'Income', 'Monthly salary', '5000.00', 'Monthly'],
    ['07/07/2025', 'June', 'salary', 'Fixed', 'Apartment rent', '1500.00', 'Monthly'],
    ['07/15/2025', 'June', 'expense', 'Variable', 'Supermarket', '300.00', 'Weekly'],
    ['07/30/2025', 'June', 'invoices', 'Additional', 'Additional', '800.00', 'Yearly']
  ];

  return [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');
};
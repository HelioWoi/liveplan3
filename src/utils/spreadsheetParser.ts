import { Transaction } from '../types/transaction';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface SpreadsheetRow {
  Date: string;
  Month?: string;
  Week?: string;
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
            const requiredHeaders = ['Date', 'Type', 'Category', 'Description', 'Amount'];
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
        throw new Error(`Invalid amount format in row: ${JSON.stringify(row)}`);
      }

      if (amount <= 0) {
        throw new Error(`Amount must be positive in row: ${JSON.stringify(row)}`);
      }

      // Map spreadsheet categories to app categories
      const category = mapCategory(row.Category);
      const type = determineType(row.Type);

      return {
        date: date.toISOString(),
        origin: row.Description,
        amount,
        category,
        type
      };
    })
    .filter(t => t !== null);
};

const mapCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'Salary': 'Income',
    'Rent': 'Fixed',
    'Groceries': 'Variable',
    'Gift': 'Extra',
    'Bonus': 'Additional',
    'Income Tax': 'Tax',
    'Bank': 'Fixed',
    'Savings': 'Fixed',
    'Investment': 'Investimento',
  };

  return categoryMap[category] || category;
};

const determineType = (type: string): 'income' | 'expense' => {
  const incomeTypes = ['Income', 'Salary', 'Bonus', 'Investment'];
  return incomeTypes.includes(type) ? 'income' : 'expense';
};

export const generateTemplateFile = (): string => {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Month', 'Week', 'Frequency'];
  const sampleData = [
    ['2025-08-05', 'Income', 'Salary', 'Monthly salary', '5000', 'August', 'Week 1', 'Monthly'],
    ['2025-08-10', 'Fixed Expense', 'Rent', 'Apartment rent', '1500', 'August', 'Week 2', 'Monthly'],
    ['2025-08-15', 'Variable Expense', 'Groceries', 'Supermarket', '300', 'August', 'Week 3', 'Weekly'],
    ['2025-08-20', 'Extra', 'Gift', 'Birthday gift', '400', 'August', 'Week 3', ''],
    ['2025-08-25', 'Investment', 'Bank', 'Stock investment', '2000', 'August', 'Week 4', 'Monthly'],
    ['2025-08-30', 'Savings', 'Bank', 'Save for holidays', '500', 'August', 'Week 4', 'Weekly']
  ];

  const csv = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');

  return csv;
};
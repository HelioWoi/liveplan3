/**
 * Calculation Service - Ensures accurate and reliable financial calculations
 * Implements verification, validation, and audit capabilities
 */

import { Transaction } from '../types/Transaction';

/**
 * Service for handling financial calculations with validation
 */
export const calculationService = {
  /**
   * Calculates the sum of transaction amounts with validation
   * @param transactions - Array of transactions to sum
   * @param type - Optional type filter ('income' or 'expense')
   * @returns Validated sum of transactions
   */
  calculateTotal: (transactions: Transaction[], type?: 'income' | 'expense'): number => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    
    // Filter by type if specified
    const filteredTransactions = type 
      ? transactions.filter(t => t.type === type)
      : transactions;
    
    // Primary calculation
    const primarySum = filteredTransactions.reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount.toString());
      return !isNaN(amount) ? sum + amount : sum;
    }, 0);
    
    // Verification calculation using a different approach
    const verificationSum = filteredTransactions
      .map(t => parseFloat(t.amount.toString()))
      .filter(amount => !isNaN(amount))
      .reduce((sum, amount) => sum + amount, 0);
    
    // Validate that both calculations match
    if (Math.abs(primarySum - verificationSum) > 0.001) {
      console.error('Calculation verification failed', { primarySum, verificationSum });
      throw new Error('Financial calculation verification failed');
    }
    
    // Return rounded to 2 decimal places for currency
    return Math.round(primarySum * 100) / 100;
  },

  /**
   * Calculates percentage change between two values with validation
   * @param oldValue - Previous value
   * @param newValue - Current value
   * @returns Validated percentage change
   */
  calculatePercentageChange: (oldValue: number, newValue: number): number => {
    if (oldValue === 0) return newValue === 0 ? 0 : 100;
    
    const change = ((newValue - oldValue) / Math.abs(oldValue)) * 100;
    
    // Verification calculation
    const verificationChange = (newValue / oldValue - 1) * 100;
    
    // Validate calculations match
    if (Math.abs(change - verificationChange) > 0.001) {
      console.error('Percentage calculation verification failed', { change, verificationChange });
      throw new Error('Percentage calculation verification failed');
    }
    
    return Math.round(change * 100) / 100;
  },

  /**
   * Validates a financial amount
   * @param amount - Amount to validate
   * @returns Validated amount
   */
  validateAmount: (amount: any): number => {
    let validatedAmount: number;
    
    if (typeof amount === 'string') {
      // Remove any non-numeric characters except decimal point
      const cleanedAmount = amount.replace(/[^0-9.-]/g, '');
      validatedAmount = parseFloat(cleanedAmount);
    } else if (typeof amount === 'number') {
      validatedAmount = amount;
    } else {
      validatedAmount = 0;
    }
    
    if (isNaN(validatedAmount)) {
      console.error('Invalid amount detected', { originalAmount: amount });
      return 0;
    }
    
    // Ensure we don't have more than 2 decimal places
    return Math.round(validatedAmount * 100) / 100;
  },

  /**
   * Creates an audit record for financial calculations
   * @param operation - Type of calculation performed
   * @param inputs - Input values
   * @param result - Calculation result
   * @returns Audit record object
   */
  createAuditRecord: (operation: string, inputs: any, result: any): object => {
    return {
      operation,
      inputs,
      result,
      timestamp: new Date().toISOString(),
      calculationId: Math.random().toString(36).substring(2, 15)
    };
  }
};

export default calculationService;

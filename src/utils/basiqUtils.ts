// Utility functions for Basiq integration
import { TransactionCategory, TransactionType } from '../types/transaction';

// Secure storage key for Basiq API key
const BASIQ_API_KEY_STORAGE = 'basiq_api_key_secure';

/**
 * Store the Basiq API key securely
 * In a production environment, this should use a more secure storage mechanism
 * For development, we're using localStorage with encryption
 */
export const storeBasiqApiKey = (apiKey: string): void => {
  try {
    // Simple "encryption" for development - NOT for production use
    const encodedKey = btoa(apiKey);
    localStorage.setItem(BASIQ_API_KEY_STORAGE, encodedKey);
  } catch (error) {
    console.error('Error storing Basiq API key:', error);
    throw error;
  }
};

/**
 * Limpar a chave antiga da API Basiq do localStorage
 * Esta função deve ser chamada uma vez para garantir que não há chaves antigas armazenadas
 */
export const clearOldBasiqApiKey = (): void => {
  try {
    localStorage.removeItem(BASIQ_API_KEY_STORAGE);
    console.log('Antiga chave da API Basiq removida do localStorage');
  } catch (error) {
    console.error('Erro ao limpar a antiga chave da API Basiq:', error);
  }
};

/**
 * Retrieve the Basiq API key
 * Checks both environment variables and localStorage
 */
export const getBasiqApiKey = (): string => {
  try {
    // Primeiro verificar as variáveis de ambiente (prioridade)
    const envApiKey = import.meta.env.VITE_BASIQ_API_KEY || import.meta.env.BASIQ_API_KEY;
    if (envApiKey) {
      console.log('Usando chave da API Basiq das variáveis de ambiente');
      return envApiKey as string;
    }
    
    // Se não estiver nas variáveis de ambiente, verificar o localStorage
    const encodedKey = localStorage.getItem(BASIQ_API_KEY_STORAGE);
    if (encodedKey) {
      console.log('Usando chave da API Basiq do localStorage');
      return atob(encodedKey);
    }
    
    // Nenhuma chave da API encontrada
    console.warn('Nenhuma chave da API Basiq encontrada');
    return '';
  } catch (error) {
    console.error('Erro ao recuperar a chave da API Basiq:', error);
    return '';
  }
};

/**
 * Clear the stored Basiq API key
 */
export const clearBasiqApiKey = (): void => {
  localStorage.removeItem(BASIQ_API_KEY_STORAGE);
};

/**
 * Check if Basiq API key is stored
 * Checks both localStorage and environment variables
 */
export const hasBasiqApiKey = (): boolean => {
  // Check both localStorage and environment variables
  const localStorageKey = !!localStorage.getItem(BASIQ_API_KEY_STORAGE);
  const envKey = !!import.meta.env.VITE_BASIQ_API_KEY;
  
  return localStorageKey || envKey;
};

/**
 * Map Basiq transaction categories to LivePlan categories
 */

export const mapBasiqCategoryToLivePlan = (basiqCategory: string): TransactionCategory => {
  // This is a simplified mapping - should be expanded based on Basiq's actual categories
  const categoryMap: Record<string, TransactionCategory> = {
    'food-and-drink': 'Variable',
    'groceries': 'Variable',
    'restaurants': 'Variable',
    'shopping': 'Variable',
    'entertainment': 'Additional',
    'travel': 'Additional',
    'transport': 'Variable',
    'housing': 'Fixed',
    'utilities': 'Fixed',
    'insurance': 'Fixed',
    'health': 'Fixed',
    'education': 'Fixed',
    'income': 'Income',
    'investment': 'Investment',
    'loan': 'Fixed',
    'fee': 'Fixed',
    'tax': 'Fixed',
    'other': 'Variable'
  };
  
  return categoryMap[basiqCategory.toLowerCase()] || 'Variable';
};

/**
 * Convert Basiq transaction to LivePlan transaction format
 */
export const convertBasiqToLivePlanTransaction = (basiqTransaction: any) => {
  // Determinar o tipo de transação com base na direção
  const transactionType: TransactionType = 
    basiqTransaction.direction === 'credit' ? 'income' : 'expense';
  
  return {
    origin: basiqTransaction.description,
    amount: basiqTransaction.direction === 'credit' ? basiqTransaction.amount : -basiqTransaction.amount,
    category: mapBasiqCategoryToLivePlan(basiqTransaction.category),
    date: basiqTransaction.transactionDate,
    type: transactionType,
    user_id: '', // This will be filled by the transaction store
    basiq_id: basiqTransaction.id // Add reference to original Basiq transaction
  };
};

/**
 * Format a connection status message
 */
export const formatConnectionStatus = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Connected';
    case 'pending':
      return 'Connecting...';
    case 'invalid':
      return 'Connection failed';
    default:
      return 'Unknown';
  }
};

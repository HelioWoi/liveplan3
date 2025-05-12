import { create } from 'zustand';
import basiqService from '../services/basiqService';
import { BasiqConnection, BasiqAccount, BasiqTransaction } from '../services/basiqService';
import { getBasiqApiKey, storeBasiqApiKey, convertBasiqToLivePlanTransaction } from '../utils/basiqUtils';
import { useTransactionStore } from './transactionStore';
import { setRefreshFlag, REFRESH_FLAGS } from '../utils/dataRefreshService';

interface BankConnectionState {
  // API key management
  apiKey: string;
  setApiKey: (key: string) => void;
  
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Data
  connections: BasiqConnection[];
  accounts: BasiqAccount[];
  transactions: BasiqTransaction[];
  
  // Connection URL for onboarding
  connectionUrl: string;
  
  // Actions
  initialize: () => Promise<void>;
  generateConnectionUrl: (institutionId?: string) => Promise<string>;
  fetchConnections: () => Promise<void>;
  fetchAccounts: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  syncTransactionsToApp: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshConnections: () => Promise<void>;
  
  // Status
  lastSyncTime: number | null;
}

export const useBankConnectionStore = create<BankConnectionState>((set, get) => ({
  // Initial state
  apiKey: getBasiqApiKey(),
  isConnected: false,
  isLoading: false,
  error: null,
  connections: [],
  accounts: [],
  transactions: [],
  connectionUrl: '',
  lastSyncTime: null,
  
  // Set API key
  setApiKey: (key: string) => {
    storeBasiqApiKey(key);
    set({ apiKey: key });
  },
  
  // Initialize the store
  initialize: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if we have an API key
      const apiKey = getBasiqApiKey();
      if (!apiKey) {
        set({ isLoading: false });
        return;
      }
      
      // Test connection to Basiq API
      const isConnected = await basiqService.testConnection();
      
      if (isConnected) {
        // Fetch connections
        await get().fetchConnections();
      }
      
      set({ isConnected, isLoading: false });
    } catch (error: any) {
      console.error('Error initializing bank connection store:', error);
      set({ 
        error: error.message || 'Failed to initialize bank connection', 
        isLoading: false,
        isConnected: false
      });
    }
  },
  
  // Generate connection URL for onboarding
  generateConnectionUrl: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Usando o método createUserAndGetConnectionLink em vez de generateConnectionUrl
      const result = await basiqService.createUserAndGetConnectionLink(
        'user@example.com', // Email temporário
        'Test', // Nome temporário
        'User', // Sobrenome temporário
        '' // Telefone (opcional)
      );
      
      // Extrair a URL da resposta
      const url = result.connectionData.steps[0]?.action?.url || '';
      set({ connectionUrl: url, isLoading: false });
      return url;
    } catch (error: any) {
      console.error('Error generating connection URL:', error);
      set({ 
        error: error.message || 'Failed to generate connection URL', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch user's connections
  fetchConnections: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    
    try {
      // Como não temos o método getConnections, vamos usar dados simulados
      // Em uma implementação real, você precisaria implementar o método getConnections no basiqService
      console.log('Usando dados simulados para conexões');
      
      // Dados simulados de conexões
      const mockConnections: BasiqConnection[] = [
        {
          id: 'mock-connection-1',
          status: 'active',
          institution: {
            id: 'AU00001',
            name: 'Demo Bank',
            logo: 'https://cdn.basiq.io/institutions/logos/color/AU00001.svg'
          },
          accounts: ['mock-account-1'],
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        }
      ];
      
      const connections = mockConnections;
      const isConnected = connections.some((conn: BasiqConnection) => conn.status === 'active');
      
      set({ 
        connections, 
        isConnected, 
        isLoading: false 
      });
      
      // If we have active connections, fetch accounts and transactions
      if (isConnected) {
        get().fetchAccounts();
        get().fetchTransactions();
      }
      
      // Não retornamos nada para corresponder ao tipo Promise<void>
    } catch (error: any) {
      console.error('Error fetching connections:', error);
      set({
        error: error.message || 'Failed to fetch connections',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Fetch user's accounts
  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const accounts = await basiqService.getAccounts();
      set({ accounts, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      set({ 
        error: error.message || 'Failed to fetch accounts', 
        isLoading: false 
      });
    }
  },
  
  // Fetch user's transactions
  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch transactions from the last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const filter = `transactionDate.gt='${ninetyDaysAgo.toISOString().split('T')[0]}'`;
      const transactions = await basiqService.getTransactions(filter);
      
      set({ 
        transactions, 
        isLoading: false,
        lastSyncTime: Date.now()
      });
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      set({ 
        error: error.message || 'Failed to fetch transactions', 
        isLoading: false 
      });
    }
  },
  
  // Sync Basiq transactions to the app's transaction store
  syncTransactionsToApp: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { transactions } = get();
      const transactionStore = useTransactionStore.getState();
      
      // Get existing transactions from the app
      const existingTransactions = transactionStore.transactions;
      
      // Convert Basiq transactions to LivePlan format
      const livePlanTransactions = transactions.map(convertBasiqToLivePlanTransaction);
      
      // Filter out transactions that already exist in the app
      // (based on basiq_id which we added to the transaction object)
      const newTransactions = livePlanTransactions.filter(transaction => {
        return !existingTransactions.some(existing => 
          existing.basiq_id === transaction.basiq_id
        );
      });
      
      if (newTransactions.length > 0) {
        // Add new transactions to the app
        await transactionStore.bulkAddTransactions(newTransactions);
        
        // Set refresh flags to update UI
        setRefreshFlag(REFRESH_FLAGS.TRANSACTIONS);
        setRefreshFlag(REFRESH_FLAGS.ALL);
      }
      
      set({ 
        isLoading: false,
        lastSyncTime: Date.now()
      });
    } catch (error: any) {
      console.error('Error syncing transactions to app:', error);
      set({ 
        error: error.message || 'Failed to sync transactions', 
        isLoading: false 
      });
    }
  },
  
  // Disconnect from Basiq
  disconnect: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Clear API key
      storeBasiqApiKey('');
      
      // Reset state
      set({
        apiKey: '',
        isConnected: false,
        connections: [],
        accounts: [],
        transactions: [],
        connectionUrl: '',
        lastSyncTime: null,
        isLoading: false
      });
      
      // Set refresh flag
      setRefreshFlag(REFRESH_FLAGS.BANK_CONNECTIONS);
      
      console.log('Disconnected from Basiq API');
    } catch (error: any) {
      set({ error: error.message || 'Failed to disconnect', isLoading: false });
    }
  },
  
  // Refresh connections (shorthand for fetchConnections)
  refreshConnections: async () => {
    await get().fetchConnections();
  }
}));

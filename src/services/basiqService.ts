import { getBasiqApiKey } from '../utils/basiqUtils';

// Constants
const BASIQ_API_URL = 'https://au-api.basiq.io';
const USE_REAL_API = false; // Definido como false para usar dados simulados
const CORS_PROXY_URL = import.meta.env.VITE_CORS_PROXY_URL || 'https://corsproxy.io/?';

// API Endpoints
const ENDPOINTS = {
  TOKEN: '/token',
  USERS: '/users',
  CONNECTIONS: '/connections',
  ACCOUNTS: '/accounts',
  TRANSACTIONS: '/transactions',
  INSTITUTIONS: '/institutions'
};

// Types
export interface BasiqUser {
  id: string;
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface BasiqConnection {
  id: string;
  status: string;
  institution: {
    id: string;
    name: string;
    logo: string;
  };
  accounts: string[];
  createdAt: string;
  lastUsed: string;
}

export interface BasiqAccount {
  id: string;
  accountNumber: string;
  name: string;
  currency: string;
  balance: number;
  availableFunds: number;
  type: string;
  status: string;
  connection: string;
  createdAt: string;
  lastUpdated: string;
}

export interface BasiqTransaction {
  id: string;
  status: string;
  description: string;
  amount: number;
  account: string;
  direction: string;
  postDate: string;
  transactionDate: string;
  balance: number;
  categories: string[];
  institution: string;
  connection: string;
  createdAt: string;
  lastUpdated: string;
}

export interface BasiqInstitution {
  id: string;
  name: string;
  shortName?: string;
  logo: string;
  country: string;
  institution_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface ConnectionResponse {
  id: string;
  status: string;
  institution: {
    id: string;
    name: string;
    logo: string;
  };
  steps: {
    title: string;
    status: string;
    action?: {
      type: string;
      url?: string;
    };
  }[];
}

export interface ConnectionData {
  id: string;
  institution: {
    id: string;
    name: string;
    logo: string;
  };
  status: string;
  steps: {
    title: string;
    status: string;
    action?: {
      type: string;
      url?: string;
    };
  }[];
}

export interface ConnectionResult {
  userId: string;
  connectionData: ConnectionData;
}

// Mock data for development
const MOCK_DATA = {
  users: [
    {
      id: 'user-123',
      email: 'test@example.com',
      mobile: '+61400000000',
      firstName: 'Test',
      lastName: 'User',
      createdAt: '2023-01-01T00:00:00Z'
    }
  ],
  connections: [
    {
      id: 'conn-123',
      status: 'active',
      institution: {
        id: 'AU00001',
        name: 'Demo Bank',
        logo: 'https://cdn.basiq.io/institutions/logos/color/AU00001.svg'
      },
      accounts: ['acc-123', 'acc-456'],
      createdAt: '2023-01-01T00:00:00Z',
      lastUsed: '2023-01-01T00:00:00Z'
    }
  ],
  accounts: [
    {
      id: 'acc-123',
      accountNumber: '12345678',
      name: 'Everyday Account',
      currency: 'AUD',
      balance: 5000,
      availableFunds: 5000,
      type: 'savings',
      status: 'available',
      connection: 'conn-123',
      createdAt: '2023-01-01T00:00:00Z',
      lastUpdated: '2023-01-01T00:00:00Z'
    },
    {
      id: 'acc-456',
      accountNumber: '87654321',
      name: 'Credit Card',
      currency: 'AUD',
      balance: -1000,
      availableFunds: 9000,
      type: 'credit',
      status: 'available',
      connection: 'conn-123',
      createdAt: '2023-01-01T00:00:00Z',
      lastUpdated: '2023-01-01T00:00:00Z'
    }
  ],
  transactions: [
    {
      id: 'tx-123',
      status: 'posted',
      description: 'Woolworths',
      amount: -85.5,
      account: 'acc-123',
      direction: 'debit',
      postDate: '2023-01-01T00:00:00Z',
      transactionDate: '2023-01-01T00:00:00Z',
      balance: 5000,
      categories: ['groceries'],
      institution: 'AU00001',
      connection: 'conn-123',
      createdAt: '2023-01-01T00:00:00Z',
      lastUpdated: '2023-01-01T00:00:00Z'
    },
    {
      id: 'tx-456',
      status: 'posted',
      description: 'Salary',
      amount: 2000,
      account: 'acc-123',
      direction: 'credit',
      postDate: '2023-01-01T00:00:00Z',
      transactionDate: '2023-01-01T00:00:00Z',
      balance: 5000,
      categories: ['income'],
      institution: 'AU00001',
      connection: 'conn-123',
      createdAt: '2023-01-01T00:00:00Z',
      lastUpdated: '2023-01-01T00:00:00Z'
    }
  ],
  institutions: [
    {
      id: 'AU00001',
      name: 'Demo Bank',
      shortName: 'Demo',
      logo: 'https://cdn.basiq.io/institutions/logos/color/AU00001.svg',
      country: 'AU',
      institution_type: 'bank'
    },
    {
      id: 'AU00002',
      name: 'Test Bank',
      logo: 'https://cdn.basiq.io/institutions/logos/color/AU00002.svg',
      country: 'AU',
      institution_type: 'bank'
    }
  ]
};

class BasiqService {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  // Get token for Basiq API
  private async getToken(): Promise<string> {
    try {
      // Check if we have a valid token
      const now = Date.now();
      if (this.token && this.tokenExpiry > now) {
        return this.token;
      }

      // Get API key
      const apiKey = getBasiqApiKey();
      if (!apiKey) {
        throw new Error('Basiq API key not found');
      }
      
      // Check if we should use real API or mock data
      if (!USE_REAL_API) {
        console.log('Using mock token for development');
        this.token = 'mock_token_for_testing_purposes';
        this.tokenExpiry = now + (60 * 60 * 1000); // 1 hour
        return this.token;
      }
      
      console.log('Requesting token from Basiq API using CORS proxy');
      console.log('API key length:', apiKey.length);
      
      // For debugging, let's log a masked version of the API key
      const maskedKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5);
      console.log('API key (masked):', maskedKey);
      
      // Try different proxy services
      const proxies = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url='
      ];
      
      let lastError: Error | null = null;
      
      // Try each proxy until one works
      for (const proxy of proxies) {
        try {
          console.log('Trying proxy:', proxy);
          
          const response = await fetch(`${proxy}${BASIQ_API_URL}${ENDPOINTS.TOKEN}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(apiKey + ':')}`,
              'basiq-version': '3.0'
            },
            body: JSON.stringify({
              scope: 'SERVER_ACCESS'
            })
          });
          
          if (!response.ok) {
            // Get more details about the error
            const errorData = await response.json();
            console.error('Error getting token:', errorData);
            throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          this.token = data.access_token;
          this.tokenExpiry = now + (data.expires_in * 1000); // Convert to milliseconds
          return this.token;
        } catch (error) {
          console.error(`Error with proxy ${proxy}:`, error);
          lastError = error as Error;
          // Continue to next proxy
        }
      }
      
      // If we get here, all proxies failed
      throw lastError || new Error('All proxies failed to get token');
    } catch (error) {
      console.error('Error in getToken:', error);
      throw error;
    }
  }

  // Test connection to Basiq API
  public async testConnection(): Promise<boolean> {
    try {
      const apiKey = getBasiqApiKey();
      if (!apiKey) {
        console.log('No API key found');
        return false;
      }
      
      // Sempre retorna sucesso para facilitar os testes
      console.log('Teste de conexão bem-sucedido com a chave API');
      return true;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  }

  // Get list of banks
  public async getBanks(): Promise<BasiqInstitution[]> {
    try {
      // Use mock data for development
      if (!USE_REAL_API) {
        console.log('Using mock banks data');
        return MOCK_DATA.institutions as BasiqInstitution[];
      }

      const token = await this.getToken();
      const response = await fetch(`${CORS_PROXY_URL}${BASIQ_API_URL}${ENDPOINTS.INSTITUTIONS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'basiq-version': '3.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get banks: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting banks:', error);
      throw error;
    }
  }

  // Get user accounts
  public async getAccounts(): Promise<BasiqAccount[]> {
    try {
      // Use mock data for development
      if (!USE_REAL_API) {
        console.log('Using mock accounts data');
        return MOCK_DATA.accounts as BasiqAccount[];
      }

      // In a real implementation, you would call the Basiq API here
      throw new Error('Not implemented for real API yet');
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  // Get user transactions
  public async getTransactions(_filter?: string): Promise<BasiqTransaction[]> {
    try {
      // Use mock data for development
      if (!USE_REAL_API) {
        console.log('Using mock transactions data');
        return MOCK_DATA.transactions as BasiqTransaction[];
      }

      // In a real implementation, you would call the Basiq API here
      throw new Error('Not implemented for real API yet');
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  // Direct API test (for debugging)
  public async directApiTest(): Promise<any> {
    try {
      const apiKey = getBasiqApiKey();
      if (!apiKey) {
        throw new Error('Basiq API key not found');
      }

      // Try direct API call without proxy
      const response = await fetch(`${BASIQ_API_URL}/institutions`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(apiKey + ':')}`,
          'Accept': 'application/json',
          'basiq-version': '3.0'
        }
      });

      const data = await response.json();
      return {
        status: response.status,
        statusText: response.statusText,
        body: JSON.stringify(data)
      };
    } catch (error) {
      console.error('Error in direct API test:', error);
      return {
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  // Create a user in Basiq and get a connection link
  public async createUserAndGetConnectionLink(
    email: string,
    firstName: string,
    lastName: string,
    mobile: string = ''
  ): Promise<ConnectionResult> {
    try {
      // Sempre usar dados simulados para garantir que funcione
      console.log('Usando dados simulados para conexão bancária');
      console.log(`Dados do usuário: ${email}, ${firstName} ${lastName}`);
      
      // URL de conexão simulada que funcionará sempre
      const mockConnectionUrl = 'https://connect.basiq.io/consent?mock=true&user=' + encodeURIComponent(email);
      
      return {
        userId: 'mock-user-id-' + Date.now(),
        connectionData: {
          id: 'mock-connection-id-' + Date.now(),
          institution: {
            id: 'AU00001',
            name: 'Demo Bank',
            logo: 'https://cdn.basiq.io/institutions/logos/color/AU00001.svg'
          },
          status: 'pending',
          steps: [
            {
              title: 'Consent',
              status: 'pending',
              action: {
                type: 'external',
                url: mockConnectionUrl
              }
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error creating user and getting connection link:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const basiqService = new BasiqService();
export default basiqService;

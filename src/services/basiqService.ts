import { supabase } from '../lib/supabase/supabaseClient';
import { getBasiqApiKey } from '../utils/basiqUtils';

// API Configuration
// URL original da API Basiq
const BASIQ_API_URL = 'https://au-api.basiq.io';
const ENDPOINTS = {
  TOKEN: '/token',
  USERS: '/users',
  CONNECTIONS: '/users/{userId}/connections',
  ACCOUNTS: '/users/{userId}/accounts',
  TRANSACTIONS: '/users/{userId}/transactions',
  INSTITUTIONS: '/institutions'
};

// Types
export interface BasiqToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

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
  institution: {
    id: string;
    name: string;
    logo: string;
  };
  status: 'active' | 'pending' | 'invalid';
  lastUsed: string;
}

export interface BasiqInstitution {
  id: string;
  name: string;
  shortName?: string;
  logo: string;
  country: string;
  institution_type: string;
}

export interface BasiqAccount {
  id: string;
  accountNo: string;
  name: string;
  currency: string;
  balance: number;
  availableFunds: number;
  type: string;
  status: string;
}

export interface BasiqTransaction {
  id: string;
  status: string;
  description: string;
  amount: number;
  account: string;
  direction: 'debit' | 'credit';
  postDate: string;
  transactionDate: string;
  category: string;
}

// Mock data for testing - mantido como referência para desenvolvimento
// @ts-ignore - Suprimindo avisos de lint para dados de teste
const MOCK_CONNECTIONS: BasiqConnection[] = [
  {
    id: 'conn-123',
    institution: {
      id: 'AU00000',
      name: 'Mock Bank',
      logo: 'https://via.placeholder.com/150'
    },
    status: 'active',
    lastUsed: new Date().toISOString()
  }
];

// @ts-ignore - Suprimindo avisos de lint para dados de teste
const MOCK_ACCOUNTS: BasiqAccount[] = [
  {
    id: 'acc-123',
    accountNo: '123456789',
    name: 'Everyday Account',
    currency: 'AUD',
    balance: 5000.00,
    availableFunds: 4800.00,
    type: 'savings',
    status: 'active'
  },
  {
    id: 'acc-456',
    accountNo: '987654321',
    name: 'Credit Card',
    currency: 'AUD',
    balance: -1200.00,
    availableFunds: 3800.00,
    type: 'credit',
    status: 'active'
  }
];

// @ts-ignore - Suprimindo avisos de lint para dados de teste
const MOCK_TRANSACTIONS: BasiqTransaction[] = [
  {
    id: 'tx-123',
    status: 'posted',
    description: 'Grocery Store',
    amount: 85.20,
    account: 'acc-123',
    direction: 'debit',
    postDate: new Date().toISOString(),
    transactionDate: new Date().toISOString(),
    category: 'groceries'
  },
  {
    id: 'tx-456',
    status: 'posted',
    description: 'Salary',
    amount: 2500.00,
    account: 'acc-123',
    direction: 'credit',
    postDate: new Date().toISOString(),
    transactionDate: new Date().toISOString(),
    category: 'income'
  },
  {
    id: 'tx-789',
    status: 'posted',
    description: 'Restaurant',
    amount: 120.50,
    account: 'acc-456',
    direction: 'debit',
    postDate: new Date().toISOString(),
    transactionDate: new Date().toISOString(),
    category: 'restaurants'
  }
];

// Service class with mock implementation
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

      // Real implementation using the actual API
      const apiKey = getBasiqApiKey();
      if (!apiKey) {
        throw new Error('Basiq API key not found');
      }
      
      console.log('Requesting token from Basiq API');
      console.log('API URL:', `${BASIQ_API_URL}${ENDPOINTS.TOKEN}`);
      console.log('API Key (primeiros 5 caracteres):', apiKey.substring(0, 5) + '...');
      
      // Log para depuração - remover em produção
      const authHeader = `Basic ${btoa(apiKey + ':')}`;
      console.log('Authorization Header (primeiros 20 caracteres):', authHeader.substring(0, 20) + '...');
      
      // A API Basiq espera a chave API no formato correto
      // De acordo com a documentação, precisamos enviar a chave no corpo da requisição
      // Para desenvolvimento, vamos usar uma abordagem diferente
      // Em vez de fazer a chamada direta à API, vamos simular uma resposta bem-sucedida
      console.log('Simulando resposta de token para desenvolvimento');
      
      // Criar um token simulado que expira em 1 hora
      this.token = 'mock_token_for_testing_purposes';
      this.tokenExpiry = now + (60 * 60 * 1000); // 1 hora
      
      // Garantir que o token nunca seja null
      if (!this.token) {
        this.token = 'mock_token_for_testing_purposes';
      }
      
      // Retornar o token simulado para testes
      return this.token as string; // Usar type assertion para garantir que o TypeScript reconheça como string
      
      /* 
      // Código original - para ser usado quando o problema de CORS for resolvido
      const response = await fetch(`${BASIQ_API_URL}${ENDPOINTS.TOKEN}`, {
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
        // Obter mais detalhes sobre o erro
        const errorText = await response.text();
        console.error('Erro detalhado da API Basiq:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to get token: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: BasiqToken = await response.json();
      this.token = data.access_token;
      this.tokenExpiry = now + (data.expires_in * 1000);
      return this.token;
      */
      
      /* For testing with mock data
      console.log('Using mock token for testing');
      this.token = 'mock_token_for_testing_purposes';
      this.tokenExpiry = now + (60 * 60 * 1000); // 1 hour
      return this.token;
      */
    } catch (error) {
      console.error('Error getting Basiq token:', error);
      throw error;
    }
  }

  // Create a new user in Basiq
  async createUser(email: string, firstName: string, lastName: string, mobile?: string): Promise<BasiqUser> {
    try {
      const token = await this.getToken();
      
      const userData = {
        email,
        firstName,
        lastName,
        ...(mobile && { mobile })
      };

      console.log('Creating user with Basiq API');
      
      const response = await fetch(`${BASIQ_API_URL}${ENDPOINTS.USERS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'basiq-version': '3.0'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }

      return await response.json();
      
      /* For testing with mock data
      console.log('Creating mock Basiq user for testing');
      
      // Create a mock user with the provided data
      const mockUser: BasiqUser = {
        id: `mock-user-${Date.now()}`,
        email,
        firstName,
        lastName,
        mobile: mobile || '',
        createdAt: new Date().toISOString()
      };
      
      return mockUser;
      */
    } catch (error) {
      console.error('Error creating Basiq user:', error);
      throw error;
    }
  }

  // Get or create Basiq user ID for the current Supabase user
  async getOrCreateBasiqUserId(): Promise<string> {
    try {
      // Get current user from Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // First, check if the user already has a Basiq user ID in the database
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('basiq_user_id, email, first_name, last_name, mobile')
        .eq('user_id', user.id)
        .single();
      
      // If we have a Basiq user ID in the database, return it
      if (profileData?.basiq_user_id) {
        return profileData.basiq_user_id;
      }
      
      // If not in database, check if we have it in localStorage (for backward compatibility)
      const localStorageKey = `basiq_user_id_${user.id}`;
      const storedBasiqUserId = localStorage.getItem(localStorageKey);
      
      if (storedBasiqUserId) {
        // If found in localStorage, save it to the database and return it
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            basiq_user_id: storedBasiqUserId
          });
        
        // We can clear it from localStorage now that it's in the database
        localStorage.removeItem(localStorageKey);
        
        return storedBasiqUserId;
      }
      
      // If we don't have a Basiq user ID anywhere, create a new one
      // Get user details from profile or session
      const email = profileData?.email || user.email || '';
      const firstName = profileData?.first_name || '';
      const lastName = profileData?.last_name || '';
      const mobile = profileData?.mobile || '';

      if (!email) {
        throw new Error('User email is required');
      }

      // Create a new Basiq user
      const basiqUser = await this.createUser(email, firstName, lastName, mobile);
      
      // Store in database
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          basiq_user_id: basiqUser.id,
          // Don't overwrite existing profile data if it exists
          ...(profileData ? {} : { email, first_name: firstName, last_name: lastName, mobile })
        });

      return basiqUser.id;
    } catch (error) {
      console.error('Error getting or creating Basiq user ID:', error);
      throw error;
    }
  }

  // Generate a connection URL for a user to connect their bank account
  async generateConnectionUrl(institutionId?: string): Promise<string> {
    try {
      const userId = await this.getOrCreateBasiqUserId();
      const token = await this.getToken();
      
      // Generate a connection URL
      const response = await fetch(`${BASIQ_API_URL}${ENDPOINTS.CONNECTIONS.replace('{userId}', userId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'basiq-version': '3.0'
        },
        body: JSON.stringify({
          ...(institutionId && { institution: { id: institutionId } })
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate connection URL: ${response.statusText}`);
      }

      const data = await response.json();
      return data.links.self;
    } catch (error) {
      console.error('Error generating connection URL:', error);
      throw error;
    }
  }

  // Get user's connections
  async getConnections(): Promise<BasiqConnection[]> {
    try {
      // Para desenvolvimento, vamos usar dados simulados
      console.log('Using mock connections data for testing');
      return MOCK_CONNECTIONS;
      
      /* Código real para quando a API estiver pronta
      const userId = await this.getOrCreateBasiqUserId();
      const token = await this.getToken();
      
      console.log('Fetching connections from Basiq API');
      
      const response = await fetch(`${BASIQ_API_URL}${ENDPOINTS.CONNECTIONS.replace('{userId}', userId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'basiq-version': '3.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get connections: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
      */
    } catch (error) {
      console.error('Error getting connections:', error);
      throw error;
    }
  }

  // Get user's accounts
  async getAccounts(): Promise<BasiqAccount[]> {
    try {
      // Para desenvolvimento, vamos usar dados simulados
      console.log('Using mock accounts data for testing');
      return MOCK_ACCOUNTS;
      
      /* Código real para quando a API estiver pronta
      const userId = await this.getOrCreateBasiqUserId();
      const token = await this.getToken();
      
      console.log('Fetching accounts from Basiq API');
      
      const response = await fetch(`${BASIQ_API_URL}${ENDPOINTS.ACCOUNTS.replace('{userId}', userId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'basiq-version': '3.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get accounts: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
      */
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  // Get user's transactions
  async getTransactions(_filter?: string): Promise<BasiqTransaction[]> {
    try {
      // Para desenvolvimento, vamos usar dados simulados
      console.log('Using mock transactions data for testing');
      return MOCK_TRANSACTIONS;
      
      /* Código real para quando a API estiver pronta
      const userId = await this.getOrCreateBasiqUserId();
      const token = await this.getToken();
      
      console.log('Fetching transactions from Basiq API');
      
      let url = `${BASIQ_API_URL}${ENDPOINTS.TRANSACTIONS.replace('{userId}', userId)}`;
      if (filter) {
        url += `?filter=${filter}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'basiq-version': '3.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get transactions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
      */
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  // Test connection to Basiq API
  async testConnection(): Promise<boolean> {
    try {
      await this.getToken();
      return true;
    } catch (error) {
      console.error('Error testing connection to Basiq API:', error);
      return false;
    }
  }
  
  // Get available banks/institutions
  async getBanks(): Promise<BasiqInstitution[]> {
    try {
      // Para desenvolvimento, vamos usar dados simulados
      console.log('Using mock banks data for testing');
      return [
        {
          id: 'AU00000',
          name: 'Commonwealth Bank',
          shortName: 'CBA',
          logo: 'https://cdn.basiq.io/bank-logos/AU00000.svg',
          country: 'AU',
          institution_type: 'bank'
        },
        {
          id: 'AU00001',
          name: 'ANZ Bank',
          shortName: 'ANZ',
          logo: 'https://cdn.basiq.io/bank-logos/AU00001.svg',
          country: 'AU',
          institution_type: 'bank'
        },
        {
          id: 'AU00002',
          name: 'Westpac',
          shortName: 'WBC',
          logo: 'https://cdn.basiq.io/bank-logos/AU00002.svg',
          country: 'AU',
          institution_type: 'bank'
        },
        {
          id: 'AU00003',
          name: 'National Australia Bank',
          shortName: 'NAB',
          logo: 'https://cdn.basiq.io/bank-logos/AU00003.svg',
          country: 'AU',
          institution_type: 'bank'
        },
        {
          id: 'AU00004',
          name: 'St. George Bank',
          logo: 'https://cdn.basiq.io/bank-logos/AU00004.svg',
          country: 'AU',
          institution_type: 'bank'
        },
        {
          id: 'AU00005',
          name: 'Bank of Queensland',
          shortName: 'BOQ',
          logo: 'https://cdn.basiq.io/bank-logos/AU00005.svg',
          country: 'AU',
          institution_type: 'bank'
        },
        {
          id: 'AU00006',
          name: 'Bendigo Bank',
          logo: 'https://cdn.basiq.io/bank-logos/AU00006.svg',
          country: 'AU',
          institution_type: 'bank'
        },
        {
          id: 'AU00007',
          name: 'ING Direct',
          logo: 'https://cdn.basiq.io/bank-logos/AU00007.svg',
          country: 'AU',
          institution_type: 'bank'
        }
      ];
      
      /* Código real para quando a API estiver pronta
      const token = await this.getToken();
      
      console.log('Fetching banks from Basiq API');
      
      const response = await fetch(`${BASIQ_API_URL}${ENDPOINTS.INSTITUTIONS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'basiq-version': '3.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get banks: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
      */
    } catch (error) {
      console.error('Error getting banks:', error);
      throw error;
    }
  }
}

export const basiqService = new BasiqService();

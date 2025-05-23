import { getBasiqApiKey } from '../utils/basiqUtils';

// Constants
const BASIQ_API_URL = 'https://au-api.basiq.io';

// Detectar automaticamente se estamos em ambiente de produção
const IS_PRODUCTION = import.meta.env.MODE === 'production';

// Agora que temos a CLI do Netlify instalada, podemos usar o backend em todos os ambientes
const USE_BACKEND = true; // Alterado para sempre usar o backend

// URLs do backend (funções Netlify)
// Em desenvolvimento local, as funções são acessíveis via /.netlify/functions/
// Em produção, são acessíveis via /api/ devido ao redirecionamento no netlify.toml
const API_BASE_URL = IS_PRODUCTION ? '/api' : '/.netlify/functions';
const API_ENDPOINTS = {
  TOKEN: `${API_BASE_URL}/basiq-token`,
  CREATE_USER: `${API_BASE_URL}/basiq-create-user`,
  CREATE_CONNECTION: `${API_BASE_URL}/basiq-create-connection`,
  GET_BANKS: `${API_BASE_URL}/banks`, // Atualizado para usar a nova rota /banks
  CONNECTION_LINK: `${API_BASE_URL}/basiq-connection-link`
};

console.log('API Base URL:', API_BASE_URL);

// Log para indicar o modo de operação
if (USE_BACKEND) {
  console.log('Usando backend para integração com a API Basiq');
} else {
  console.log('Usando dados simulados para desenvolvimento');
}

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

// Simplified interface for Bank (used in UI)
export interface Bank {
  id: string;
  name: string;
  shortName?: string;
  logo: string;
  country: string;
  provider: string;
}

// Dados simulados para desenvolvimento
const MOCK_BANKS: BasiqInstitution[] = [
  {
    id: 'AU00001',
    name: 'Australia and New Zealand Banking Group',
    shortName: 'ANZ',
    logo: 'https://cdn.basiq.io/au/images/bank/AU00001.svg',
    country: 'AU',
    institution_type: 'bank'
  },
  {
    id: 'AU00002',
    name: 'Commonwealth Bank of Australia',
    shortName: 'CommBank',
    logo: 'https://cdn.basiq.io/au/images/bank/AU00002.svg',
    country: 'AU',
    institution_type: 'bank'
  },
  {
    id: 'AU00003',
    name: 'National Australia Bank',
    shortName: 'NAB',
    logo: 'https://cdn.basiq.io/au/images/bank/AU00003.svg',
    country: 'AU',
    institution_type: 'bank'
  },
  {
    id: 'AU00004',
    name: 'Westpac Banking Corporation',
    shortName: 'Westpac',
    logo: 'https://cdn.basiq.io/au/images/bank/AU00004.svg',
    country: 'AU',
    institution_type: 'bank'
  },
  {
    id: 'AU00005',
    name: 'Macquarie Bank',
    shortName: 'Macquarie',
    logo: 'https://cdn.basiq.io/au/images/bank/AU00005.svg',
    country: 'AU',
    institution_type: 'bank'
  },
  {
    id: 'AU00006',
    name: 'Suncorp Bank',
    shortName: 'Suncorp',
    logo: 'https://cdn.basiq.io/au/images/bank/AU00006.svg',
    country: 'AU',
    institution_type: 'bank'
  },
  {
    id: 'AU00007',
    name: 'Bendigo Bank',
    shortName: 'Bendigo',
    logo: 'https://cdn.basiq.io/au/images/bank/AU00007.svg',
    country: 'AU',
    institution_type: 'bank'
  },
  {
    id: 'AU00008',
    name: 'St.George Bank',
    shortName: 'St.George',
    logo: 'https://cdn.basiq.io/au/images/bank/AU00008.svg',
    country: 'AU',
    institution_type: 'bank'
  },
  {
    id: 'AU00009',
    name: 'Bank of Queensland',
    shortName: 'BOQ',
    logo: 'https://cdn.basiq.io/au/images/bank/AU00009.svg',
    country: 'AU',
    institution_type: 'bank'
  },
  {
    id: 'AU00010',
    name: 'ING',
    shortName: 'ING',
    logo: 'https://cdn.basiq.io/au/images/bank/AU00010.svg',
    country: 'AU',
    institution_type: 'bank'
  }
];

// Basiq Service class
class BasiqService {
  // Gerar URL de avatar para bancos sem logo
  public generateAvatarUrl(name: string): string {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
    const color = this.stringToColor(name);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color.replace('#', '')}&color=ffffff`;
  }

  // Converter string para cor hexadecimal
  private stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }

  // Get list of banks
  public async getBanks(): Promise<BasiqInstitution[]> {
    try {
      console.log('Obtendo lista de bancos');
      console.log('Ambiente de produção?', IS_PRODUCTION);
      console.log('Usando backend?', USE_BACKEND);
      
      // Verificar se estamos usando o backend (produção) ou dados simulados (desenvolvimento)
      if (USE_BACKEND) {
        console.log('Usando backend para obter lista de bancos');
        
        try {
          // Chamar a função Netlify para obter lista de bancos
          console.log('Chamando endpoint:', API_ENDPOINTS.GET_BANKS);
          const response = await fetch(API_ENDPOINTS.GET_BANKS, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          console.log('Resposta recebida:', response.status, response.statusText);
          
          if (!response.ok) {
            try {
              const errorText = await response.text();
              console.error('Erro ao obter bancos via backend - Resposta:', errorText);
              try {
                const errorData = JSON.parse(errorText);
                console.error('Erro ao obter bancos via backend - Dados:', errorData);
                throw new Error(`Falha ao obter bancos: ${response.status} ${response.statusText}`);
              } catch (jsonError) {
                console.error('Erro ao parsear resposta de erro como JSON:', jsonError);
                throw new Error(`Falha ao obter bancos: ${response.status} ${response.statusText} - Resposta não é JSON válido`);
              }
            } catch (textError) {
              console.error('Erro ao ler texto da resposta:', textError);
              throw new Error(`Falha ao obter bancos: ${response.status} ${response.statusText}`);
            }
          }
          
          try {
            const responseText = await response.text();
            console.log('Texto da resposta:', responseText);
            
            if (!responseText || responseText.trim() === '') {
              console.error('Resposta vazia recebida do backend');
              throw new Error('Resposta vazia recebida do backend');
            }
            
            const result = JSON.parse(responseText);
            const banksData = result.data || [];
            console.log(`Bancos obtidos com sucesso via backend: ${banksData.length} bancos`);
          
            // Mapear os dados da API para o formato esperado pelo frontend
            const banks: BasiqInstitution[] = banksData.map((bank: any) => ({
              id: bank.id,
              name: bank.name,
              shortName: bank.shortName || bank.name,
              logo: bank.logo || this.generateAvatarUrl(bank.name),
              country: bank.country || 'AU',
              institution_type: bank.institution_type || 'bank'
            }));
            
            return banks;
          } catch (jsonParseError) {
            console.error('Erro ao processar resposta JSON:', jsonParseError);
            throw jsonParseError;
          }
        } catch (error) {
          console.error('Erro ao chamar backend para obter bancos:', error);
          
          // Em caso de erro no backend, usar dados simulados como fallback
          console.log('Usando dados simulados como fallback após erro no backend');
          // Continua para o código de dados simulados abaixo
        }
      }
      
      // Retornar dados simulados para desenvolvimento
      console.log('Retornando dados simulados de bancos para desenvolvimento');
      return MOCK_BANKS;
    } catch (error) {
      console.error('Error getting banks:', error);
      // Retornar dados simulados em caso de erro
      console.log('Retornando dados simulados de bancos após erro');
      return MOCK_BANKS;
    }
  }

  // Get user accounts
  public async getAccounts(): Promise<BasiqAccount[]> {
    try {
      console.log('Obtendo contas do usuário');
      console.log('Ambiente de produção?', IS_PRODUCTION);
      console.log('Usando backend?', USE_BACKEND);
      
      // Verificar se estamos usando o backend (produção) ou dados simulados (desenvolvimento)
      if (USE_BACKEND) {
        console.log('Usando backend para obter contas do usuário');
        
        try {
          // Chamar a função Netlify para obter contas do usuário
          // Nota: Esta função ainda não foi implementada no backend
          console.log('Função de obtenção de contas ainda não implementada no backend');
          throw new Error('Função não implementada no backend');
        } catch (error) {
          console.error('Erro ao chamar backend para obter contas:', error);
          
          // Em caso de erro no backend, usar dados simulados como fallback
          console.log('Usando dados simulados como fallback após erro no backend');
          // Continua para o código de dados simulados abaixo
        }
      }
      
      // Retornar um array vazio em vez de dados simulados
      console.log('Retornando array vazio de contas');
      return [];
    } catch (error) {
      console.error('Error getting accounts:', error);
      // Retornar um array vazio em caso de erro
      console.log('Retornando array vazio de contas após erro');
      return [];
    }
  }

  // Get user transactions
  public async getTransactions(_filter?: string): Promise<BasiqTransaction[]> {
    try {
      console.log('Obtendo transações do usuário');
      console.log('Ambiente de produção?', IS_PRODUCTION);
      console.log('Usando backend?', USE_BACKEND);
      
      // Verificar se estamos usando o backend (produção) ou dados simulados (desenvolvimento)
      if (USE_BACKEND) {
        console.log('Usando backend para obter transações do usuário');
        
        try {
          // Chamar a função Netlify para obter transações do usuário
          // Nota: Esta função ainda não foi implementada no backend
          console.log('Função de obtenção de transações ainda não implementada no backend');
          throw new Error('Função não implementada no backend');
        } catch (error) {
          console.error('Erro ao chamar backend para obter transações:', error);
          
          // Em caso de erro no backend, usar dados simulados como fallback
          console.log('Usando dados simulados como fallback após erro no backend');
          // Continua para o código de dados simulados abaixo
        }
      }
      
      // Retornar um array vazio em vez de dados simulados
      console.log('Retornando array vazio de transações');
      return [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      // Retornar um array vazio em caso de erro
      console.log('Retornando array vazio de transações após erro');
      return [];
    }
  }

  // Test connection to Basiq API
  public async testConnection(): Promise<boolean> {
    try {
      console.log('Testando conexão com a API Basiq');
      console.log('Ambiente de produção?', IS_PRODUCTION);
      console.log('Usando backend?', USE_BACKEND);
      
      // Verificar se estamos usando o backend (produção) ou dados simulados (desenvolvimento)
      if (USE_BACKEND) {
        console.log('Usando backend para testar conexão');
        
        try {
          // Chamar a função Netlify para obter lista de bancos como teste de conexão
          const response = await fetch(API_ENDPOINTS.GET_BANKS, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            console.error('Erro ao testar conexão via backend:', response.status, response.statusText);
            return false;
          }
          
          console.log('Conexão com backend bem-sucedida');
          return true;
        } catch (error) {
          console.error('Erro ao chamar backend para testar conexão:', error);
          return false;
        }
      }
      
      // Em desenvolvimento, apenas retorna sucesso
      console.log('Ambiente de desenvolvimento - simulando teste bem-sucedido');
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
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
      console.log('Criando usuário no Basiq e obtendo link de conexão');
      console.log('Ambiente de produção?', IS_PRODUCTION);
      console.log('Usando backend?', USE_BACKEND);
      
      // Verificar se estamos usando o backend (produção) ou dados simulados (desenvolvimento)
      if (USE_BACKEND) {
        console.log('Usando backend para integração com a API Basiq');
        
        try {
          // Chamar a função Netlify para criar usuário e obter link de conexão
          const response = await fetch(API_ENDPOINTS.CONNECTION_LINK, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email,
              firstName,
              lastName,
              mobile: mobile || undefined,
              institutionId: 'AU00001' // ANZ Bank como padrão
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro ao criar conexão via backend:', errorData);
            throw new Error(`Falha ao criar conexão: ${response.status} ${response.statusText}`);
          }
          
          const result = await response.json();
          console.log('Conexão criada com sucesso via backend:', result);
          
          // Armazenar ID do usuário para uso futuro
          if (result.userId) {
            localStorage.setItem('basiq_user_id', result.userId);
          }
          
          return result;
        } catch (error) {
          console.error('Erro ao chamar backend:', error);
          
          // Em caso de erro no backend, usar dados simulados como fallback
          console.log('Usando dados simulados como fallback após erro no backend');
          // Continua para o código de dados simulados abaixo
        }
      }
      
      // Código para dados simulados (desenvolvimento ou fallback)
      console.log('Usando dados simulados para desenvolvimento');
      
      // Verificar se já existe um usuário armazenado localmente
      let userId: string | null = localStorage.getItem('basiq_user_id');
      
      if (userId) {
        // Verificar se o ID existente tem formato antigo e gerar um novo se necessário
        if (userId.startsWith('mock-user-id-') || !userId.startsWith('user-')) {
          console.log('Substituindo ID antigo por um ID no formato correto');
          userId = 'user-' + Date.now();
          localStorage.setItem('basiq_user_id', userId);
        } else {
          console.log('Usando usuário existente com ID:', userId);
        }
      } else {
        // Criar um ID de usuário com um prefixo normal
        userId = 'user-' + Date.now();
        localStorage.setItem('basiq_user_id', userId);
        console.log('Novo usuário criado com ID:', userId);
      }
      
      // Garantir que userId seja uma string válida
      const userIdString = userId as string;
      
      // Construir a URL de conexão com os parâmetros necessários
      const connectionUrl = `https://connect.basiq.io/consent?institution_id=AU00001&user_id=${encodeURIComponent(userIdString)}&email=${encodeURIComponent(email)}`;
      
      console.log('URL de conexão gerada:', connectionUrl);
      
      return {
        userId: userIdString,
        connectionData: {
          id: 'connection-' + Date.now(),
          institution: {
            id: 'AU00001',
            name: 'ANZ Bank',
            logo: 'https://cdn.basiq.io/institutions/logos/color/AU00001.svg'
          },
          status: 'pending',
          steps: [
            {
              title: 'Consent',
              status: 'pending',
              action: {
                type: 'external',
                url: connectionUrl
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

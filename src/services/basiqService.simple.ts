import { getBasiqApiKey } from '../utils/basiqUtils';

// Versão simplificada do serviço Basiq para testes
class BasiqService {
  // Testar conexão com a API Basiq
  public async testConnection(): Promise<boolean> {
    try {
      const apiKey = getBasiqApiKey();
      if (!apiKey) {
        console.log('No API key found');
        return false;
      }
      
      console.log('Testing connection with API key length:', apiKey.length);
      
      // Simulando uma conexão bem-sucedida para testes
      return true;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  }

  // Teste direto da API (para debugging)
  public async directApiTest(): Promise<any> {
    try {
      // Simulando uma resposta bem-sucedida para testes
      return {
        status: 200,
        statusText: 'OK',
        body: JSON.stringify({ message: 'Mock successful response' })
      };
    } catch (error) {
      console.error('Error in direct API test:', error);
      return {
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  // Criar usuário e obter link de conexão
  public async createUserAndGetConnectionLink(
    email: string,
    firstName: string,
    lastName: string,
    mobile: string = ''
  ): Promise<any> {
    try {
      console.log('Using mock connection data');
      
      // Retornar dados simulados
      return {
        userId: 'mock-user-id',
        connectionData: {
          id: 'mock-connection-id',
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
                url: 'https://connect.basiq.io/consent?mock=true'
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

// Exportar uma instância singleton
const basiqService = new BasiqService();
export default basiqService;

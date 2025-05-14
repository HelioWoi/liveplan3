// Função Netlify para criar usuário e obter link de conexão bancária
// Usando página de consentimento simulada local

// Constantes
const BASIQ_API_URL = 'https://au-api.basiq.io';

/**
 * Função auxiliar para obter o nome da instituição a partir do ID
 * @param {string} institutionId - ID da instituição bancária
 * @returns {string} - Nome da instituição
 */
function getInstitutionName(institutionId) {
  const institutions = {
    'AU00001': 'ANZ Bank',
    'AU00002': 'Commonwealth Bank',
    'AU00003': 'National Australia Bank',
    'AU00004': 'Westpac Bank',
    // Adicionar mais instituições conforme necessário
  };
  
  return institutions[institutionId] || 'Banco Desconhecido';
}

/**
 * Função para obter token de autenticação
 * @returns {Promise<string>} Token de acesso
 */
async function getToken() {
  try {
    // Usar a chave da API codificada em Base64
    // Formato: API_KEY:API_KEY_PASSWORD
    const base64Key = "MDkxYTI3YjktYjk5Yi00YTMzLWFmMTQtNWVlZmQ4NDNkM2VjOjk4MDM0YWZmLTNmNGEtNGYzOS1hZDA4LTU1YjcwNDI5MzU1Nw==";
    
    // Criar o header de autorização
    const authHeader = `Basic ${base64Key}`;
    
    // Fazer requisição para obter token
    const response = await fetch(`${BASIQ_API_URL}/token`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'basiq-version': '3.0'
      },
      body: 'scope=SERVER_ACCESS'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao obter token:', errorData);
      throw new Error(`Falha ao obter token: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Token obtido com sucesso');
    return data.access_token;
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error);
    throw error;
  }
}

exports.handler = async function(event, context) {
  console.log('Função basiq-connection-link iniciada');
  console.log('Variáveis de ambiente:', {
    VITE_BASIQ_API_KEY: process.env.VITE_BASIQ_API_KEY ? 'Definida' : 'Não definida',
    BASIQ_API_KEY: process.env.BASIQ_API_KEY ? 'Definida' : 'Não definida',
    VITE_APP_ENV: process.env.VITE_APP_ENV || 'não definido'
  });
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Verificar se é uma requisição OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verificar se o método é POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método não permitido' })
      };
    }

    // Extrair dados da requisição
    const requestData = JSON.parse(event.body);
    const { email, firstName, lastName, mobile, institutionId } = requestData;

    // Validar dados obrigatórios
    if (!email || !firstName || !lastName || !institutionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados incompletos. Email, firstName, lastName e institutionId são obrigatórios.' })
      };
    }

    console.log(`📱 Iniciando processo para ${email} no banco ${institutionId}`);

    try {
      // Tentar obter token apenas para validar a API
      console.log('📱 Obtendo token de autenticação');
      const token = await getToken();
      console.log('✅ Token obtido');
      
      // Usar nossa página de consentimento simulada local
      console.log('[INFO] Usando página de consentimento simulada local');
      
      // Gerar IDs simulados
      const mockUserId = `user-${Date.now()}`;
      const mockConnectionId = `conn-${Math.floor(Math.random() * 100000)}`;
      
      // Obter a URL base do servidor
      const host = event.headers.host || 'localhost:8888';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;
      
      // Criar URL para nossa página de consentimento simulada
      const consentUrl = `${baseUrl}/consent.html?institution_id=${institutionId}&user_id=${mockUserId}&email=${encodeURIComponent(email)}`;
      
      console.log('[INFO] Usando página de consentimento simulada:', consentUrl);
      
      // Formatar resposta para o frontend
      const response = {
        userId: mockUserId,
        connectionData: {
          id: mockConnectionId,
          institution: {
            id: institutionId,
            name: getInstitutionName(institutionId),
            logo: `https://cdn.basiq.io/institutions/logos/color/${institutionId}.svg`
          },
          status: 'pending',
          steps: [
            {
              title: 'Consent',
              status: 'pending',
              action: {
                type: 'external',
                url: consentUrl
              }
            }
          ]
        }
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response)
      };
    } catch (apiError) {
      console.error('Erro na API Basiq:', apiError);
      
      // Usar nossa página de consentimento simulada local mesmo em caso de erro
      console.log('[INFO] Usando página de consentimento simulada local após erro na API');
      
      // Gerar IDs simulados
      const mockUserId = `user-${Date.now()}`;
      const mockConnectionId = `conn-${Math.floor(Math.random() * 100000)}`;
      
      // Obter a URL base do servidor
      const host = event.headers.host || 'localhost:8888';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;
      
      // Criar URL para nossa página de consentimento simulada
      const consentUrl = `${baseUrl}/consent.html?institution_id=${institutionId}&user_id=${mockUserId}&email=${encodeURIComponent(email)}`;
      
      console.log('[INFO] Usando página de consentimento simulada:', consentUrl);
      
      // Resposta simulada
      const mockResponse = {
        userId: mockUserId,
        connectionData: {
          id: mockConnectionId,
          institution: {
            id: institutionId,
            name: getInstitutionName(institutionId),
            logo: `https://cdn.basiq.io/institutions/logos/color/${institutionId}.svg`
          },
          status: 'pending',
          steps: [
            {
              title: 'Consent',
              status: 'pending',
              action: {
                type: 'external',
                url: consentUrl
              }
            }
          ]
        }
      };
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(mockResponse)
      };
    }
  } catch (error) {
    console.error('Erro na função basiq-connection-link:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro ao processar a requisição',
        message: error.message
      })
    };
  }
};

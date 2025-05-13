// Função Netlify para criar conexões bancárias na API Basiq
// Importar node-fetch versão 2 (compatível com CommonJS)
const fetch = require('node-fetch');

// Constantes
const BASIQ_API_URL = 'https://au-api.basiq.io';

// Função auxiliar para obter token
async function getToken() {
  const BASIQ_API_KEY = process.env.BASIQ_API_KEY;
  
  if (!BASIQ_API_KEY) {
    throw new Error('BASIQ_API_KEY não está definida nas variáveis de ambiente');
  }
  
  const response = await fetch(`${BASIQ_API_URL}/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${BASIQ_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '3.0'
    },
    body: 'scope=SERVER_ACCESS'
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Erro ao obter token:', errorData);
    throw new Error(`Falha ao obter token: ${response.status} ${response.statusText}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

exports.handler = async function(event, context) {
  // Configurar cabeçalhos CORS
  const headers = {
    'Access-Control-Allow-Origin': '*', // Em produção, restrinja para seu domínio
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Lidar com solicitações OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  // Verificar se é uma solicitação POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido. Use POST.' })
    };
  }

  try {
    // Analisar os dados do corpo da solicitação
    const requestData = JSON.parse(event.body);
    const { userId, institutionId } = requestData;
    
    // Validar dados obrigatórios
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID do usuário não fornecido.' })
      };
    }

    // Usar ID da instituição padrão se não for fornecido
    const bankId = institutionId || 'AU00001'; // ANZ Bank como padrão

    console.log('Criando conexão bancária na API Basiq...');
    console.log('Dados da conexão:', { userId, institutionId: bankId });
    
    // Obter token de acesso
    const token = await getToken();
    
    // Criar conexão na API Basiq
    const createConnectionResponse = await fetch(`${BASIQ_API_URL}/users/${userId}/connections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'basiq-version': '3.0'
      },
      body: JSON.stringify({
        institution: {
          id: bankId
        }
      })
    });

    if (!createConnectionResponse.ok) {
      const errorData = await createConnectionResponse.json();
      console.error('Erro ao criar conexão:', errorData);
      return {
        statusCode: createConnectionResponse.status,
        headers,
        body: JSON.stringify({ 
          error: 'Falha ao criar conexão bancária na API Basiq',
          details: errorData
        })
      };
    }

    const connectionData = await createConnectionResponse.json();
    console.log('Conexão criada com sucesso:', connectionData.id);

    // Retornar os dados da conexão para o frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(connectionData)
    };
  } catch (error) {
    console.error('Erro na função basiq-create-connection:', error);
    
    // Retornar erro para o frontend
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao criar conexão bancária na API Basiq',
        message: error.message
      })
    };
  }
};

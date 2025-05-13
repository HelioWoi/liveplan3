// Função Netlify para criar usuário e obter link de conexão bancária
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

// Função para criar ou recuperar usuário
async function createOrGetUser(token, userData) {
  const { email, firstName, lastName, mobile } = userData;
  
  // Tentar encontrar usuário existente por email
  try {
    // Implementação simplificada - em produção, você deve buscar por email
    // Aqui estamos apenas criando um novo usuário
    const createUserResponse = await fetch(`${BASIQ_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'basiq-version': '3.0'
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        mobile: mobile || undefined
      })
    });

    // Se o usuário já existe, a API retornará um erro
    if (createUserResponse.status === 409) {
      // Usuário já existe, buscar por email (simplificado)
      console.log('Usuário já existe, buscando por email...');
      
      // Em uma implementação real, você buscaria o usuário por email
      // Aqui estamos retornando um erro para simplificar
      throw new Error('Usuário já existe. Implemente a busca por email.');
    }

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json();
      console.error('Erro ao criar usuário:', errorData);
      throw new Error(`Falha ao criar usuário: ${createUserResponse.status} ${createUserResponse.statusText}`);
    }

    const userData = await createUserResponse.json();
    console.log('Usuário criado com sucesso:', userData.id);
    return userData;
  } catch (error) {
    console.error('Erro ao criar ou recuperar usuário:', error);
    throw error;
  }
}

// Função para criar conexão bancária
async function createConnection(token, userId, institutionId) {
  const createConnectionResponse = await fetch(`${BASIQ_API_URL}/users/${userId}/connections`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'basiq-version': '3.0'
    },
    body: JSON.stringify({
      institution: {
        id: institutionId
      }
    })
  });

  if (!createConnectionResponse.ok) {
    const errorData = await createConnectionResponse.json();
    console.error('Erro ao criar conexão:', errorData);
    throw new Error(`Falha ao criar conexão: ${createConnectionResponse.status} ${createConnectionResponse.statusText}`);
  }

  const connectionData = await createConnectionResponse.json();
  console.log('Conexão criada com sucesso:', connectionData.id);
  return connectionData;
}

exports.handler = async function(event, context) {
  // Configurar cabeçalhos CORS
  const headers = {
    'Access-Control-Allow-Origin': '*', // Em produção, restrinja para seu domínio
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const { email, firstName, lastName, mobile, institutionId } = requestData;
    
    // Validar dados obrigatórios
    if (!email || !firstName || !lastName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados incompletos. Email, firstName e lastName são obrigatórios.' })
      };
    }

    // Usar ID da instituição padrão se não for fornecido
    const bankId = institutionId || 'AU00001'; // ANZ Bank como padrão

    console.log('Iniciando fluxo de conexão bancária...');
    console.log('Dados do usuário:', { email, firstName, lastName, mobile: mobile || 'Não fornecido' });
    console.log('Banco selecionado:', bankId);
    
    // 1. Obter token de acesso
    const token = await getToken();
    
    // 2. Criar ou recuperar usuário
    const user = await createOrGetUser(token, { email, firstName, lastName, mobile });
    
    // 3. Criar conexão bancária
    const connection = await createConnection(token, user.id, bankId);
    
    // 4. Retornar os dados para o frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        userId: user.id,
        connectionData: connection
      })
    };
  } catch (error) {
    console.error('Erro na função basiq-connection-link:', error);
    
    // Retornar erro para o frontend
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao criar link de conexão bancária',
        message: error.message
      })
    };
  }
};

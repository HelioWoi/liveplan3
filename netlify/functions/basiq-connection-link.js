// Função Netlify para criar usuário e obter link de conexão bancária
// Usando a API fetch nativa do Node.js 18+
// Se estiver usando Node.js < 18, descomente a linha abaixo
// const fetch = require('node-fetch');

// Constantes
const BASIQ_API_URL = 'https://au-api.basiq.io';

// Função auxiliar para obter token
async function getToken() {
  // Tentar usar VITE_BASIQ_API_KEY primeiro, depois BASIQ_API_KEY como fallback
  const BASIQ_API_KEY = process.env.VITE_BASIQ_API_KEY || process.env.BASIQ_API_KEY;
  
  if (!BASIQ_API_KEY) {
    throw new Error('Nenhuma chave de API Basiq encontrada nas variáveis de ambiente (VITE_BASIQ_API_KEY ou BASIQ_API_KEY)');
  }
  
  console.log('Obtendo token com a chave de API Basiq');
  
  // Verificar se a chave já está codificada em Base64
  // A chave da API Basiq deve ser codificada em Base64 no formato "chave:" (com dois pontos no final)
  let authHeader;
  if (BASIQ_API_KEY.startsWith('Basic ')) {
    // Já tem o prefixo 'Basic ', usar como está
    authHeader = BASIQ_API_KEY;
  } else {
    // Codificar a chave em Base64 com o formato correto (chave:)
    const keyWithColon = BASIQ_API_KEY.includes(':') ? BASIQ_API_KEY : `${BASIQ_API_KEY}:`;
    const base64Key = Buffer.from(keyWithColon).toString('base64');
    authHeader = `Basic ${base64Key}`;
  }
  
  console.log('Usando header de autorização para obter token');
  
  const response = await fetch(`${BASIQ_API_URL}/token`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '3.0'
    },
    body: 'scope=SERVER_ACCESS'
  });
  
  console.log('Resposta da API Basiq (status):', response.status);

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
  // Preparar o corpo da requisição com os parâmetros necessários
  const requestBody = {
    institution: {
      id: institutionId
    }
  };
  
  console.log('Corpo da requisição para criar conexão:', JSON.stringify(requestBody));
  
  const createConnectionResponse = await fetch(`${BASIQ_API_URL}/users/${userId}/connections`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'basiq-version': '3.0'
    },
    body: JSON.stringify(requestBody)
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
  console.log('Função basiq-connection-link iniciada');
  console.log('Variáveis de ambiente disponíveis:', {
    VITE_BASIQ_API_KEY: process.env.VITE_BASIQ_API_KEY ? 'Definida' : 'Não definida',
    BASIQ_API_KEY: process.env.BASIQ_API_KEY ? 'Definida' : 'Não definida',
    VITE_APP_ENV: process.env.VITE_APP_ENV || 'não definido'
  });
  
  // Se VITE_APP_ENV não estiver definido, assumir que não estamos em produção
  if (!process.env.VITE_APP_ENV) {
    process.env.VITE_APP_ENV = 'development';
    console.log('VITE_APP_ENV não definido, assumindo "development"');
  }
  
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

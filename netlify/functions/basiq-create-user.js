// Função Netlify para criar usuários na API Basiq
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
    const { email, firstName, lastName, mobile } = requestData;
    
    // Validar dados obrigatórios
    if (!email || !firstName || !lastName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados incompletos. Email, firstName e lastName são obrigatórios.' })
      };
    }

    console.log('Criando usuário na API Basiq...');
    console.log('Dados do usuário:', { email, firstName, lastName, mobile: mobile || 'Não fornecido' });
    
    // Obter token de acesso
    const token = await getToken();
    
    // Criar usuário na API Basiq
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

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json();
      console.error('Erro ao criar usuário:', errorData);
      return {
        statusCode: createUserResponse.status,
        headers,
        body: JSON.stringify({ 
          error: 'Falha ao criar usuário na API Basiq',
          details: errorData
        })
      };
    }

    const userData = await createUserResponse.json();
    console.log('Usuário criado com sucesso:', userData.id);

    // Retornar os dados do usuário para o frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(userData)
    };
  } catch (error) {
    console.error('Erro na função basiq-create-user:', error);
    
    // Retornar erro para o frontend
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao criar usuário na API Basiq',
        message: error.message
      })
    };
  }
};

// Função Netlify para criar usuários na API Basiq
// Usando a API fetch nativa do Node.js 18+
// Se estiver usando Node.js < 18, descomente a linha abaixo
// const fetch = require('node-fetch');

// Constantes
const BASIQ_API_URL = 'https://au-api.basiq.io';

// Função auxiliar para obter token
async function getToken() {
  // Tentar usar VITE_BASIQ_API_KEY primeiro, depois BASIQ_API_KEY como fallback
  const BASIQ_API_KEY = process.env.VITE_BASIQ_API_KEY || process.env.BASIQ_API_KEY;
  
  console.log('Variáveis de ambiente disponíveis:', {
    VITE_BASIQ_API_KEY: process.env.VITE_BASIQ_API_KEY ? 'Definida' : 'Não definida',
    BASIQ_API_KEY: process.env.BASIQ_API_KEY ? 'Definida' : 'Não definida'
  });
  
  if (!BASIQ_API_KEY) {
    throw new Error('Nenhuma chave de API Basiq encontrada nas variáveis de ambiente (VITE_BASIQ_API_KEY ou BASIQ_API_KEY)');
  }
  
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

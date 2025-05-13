// Função Netlify para obter a lista de bancos disponíveis na API Basiq
// Usando a API fetch nativa do Node.js 18+
// Se estiver usando Node.js < 18, descomente a linha abaixo
// const fetch = require('node-fetch');

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Lidar com solicitações OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  // Verificar se é uma solicitação GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido. Use GET.' })
    };
  }

  try {
    console.log('Obtendo lista de bancos da API Basiq...');
    
    // Obter token de acesso
    const token = await getToken();
    
    // Obter lista de bancos da API Basiq
    const getBanksResponse = await fetch(`${BASIQ_API_URL}/institutions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'basiq-version': '3.0'
      }
    });

    if (!getBanksResponse.ok) {
      const errorData = await getBanksResponse.json();
      console.error('Erro ao obter bancos:', errorData);
      return {
        statusCode: getBanksResponse.status,
        headers,
        body: JSON.stringify({ 
          error: 'Falha ao obter lista de bancos da API Basiq',
          details: errorData
        })
      };
    }

    const banksData = await getBanksResponse.json();
    console.log(`Bancos obtidos com sucesso: ${banksData.data?.length || 0} bancos encontrados`);

    // Retornar a lista de bancos para o frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(banksData)
    };
  } catch (error) {
    console.error('Erro na função basiq-get-banks:', error);
    
    // Retornar erro para o frontend
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao obter lista de bancos da API Basiq',
        message: error.message
      })
    };
  }
};

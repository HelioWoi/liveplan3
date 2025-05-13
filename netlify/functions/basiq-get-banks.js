// Função Netlify para obter a lista de bancos disponíveis na API Basiq
// Usando a API fetch nativa do Node.js 18+
// Se estiver usando Node.js < 18, descomente a linha abaixo
// const fetch = require('node-fetch');

// Constantes
const BASIQ_API_URL = 'https://au-api.basiq.io';

// Função auxiliar para obter token
async function getToken() {
  // Tentar obter a chave da API de ambas as variáveis de ambiente
  const BASIQ_API_KEY = process.env.BASIQ_API_KEY || process.env.VITE_BASIQ_API_KEY;
  
  console.log('Variáveis de ambiente disponíveis:', {
    VITE_BASIQ_API_KEY: process.env.VITE_BASIQ_API_KEY ? 'Definida' : 'Não definida',
    BASIQ_API_KEY: process.env.BASIQ_API_KEY ? 'Definida' : 'Não definida'
  });
  
  if (!BASIQ_API_KEY) {
    throw new Error('Chave da API Basiq não está definida nas variáveis de ambiente (BASIQ_API_KEY ou VITE_BASIQ_API_KEY)');
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
    console.log('Chamando API Basiq para obter instituições...');
    const getBanksResponse = await fetch(`${BASIQ_API_URL}/institutions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'basiq-version': '3.0'
      }
    });

    console.log('Resposta recebida da API Basiq:', getBanksResponse.status, getBanksResponse.statusText);

    if (!getBanksResponse.ok) {
      try {
        const errorText = await getBanksResponse.text();
        console.error('Erro ao obter bancos - Resposta:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || 'Resposta não é JSON válido' };
        }
        
        return {
          statusCode: getBanksResponse.status,
          headers,
          body: JSON.stringify({ 
            error: 'Falha ao obter lista de bancos da API Basiq',
            details: errorData
          })
        };
      } catch (error) {
        console.error('Erro ao processar resposta de erro:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Falha ao processar resposta de erro da API Basiq',
            message: error.message
          })
        };
      }
    }

    try {
      const responseText = await getBanksResponse.text();
      console.log('Tamanho da resposta:', responseText.length);
      
      if (!responseText || responseText.trim() === '') {
        console.error('Resposta vazia recebida da API Basiq');
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Resposta vazia recebida da API Basiq'
          })
        };
      }
      
      const banksData = JSON.parse(responseText);
      console.log(`Bancos obtidos com sucesso: ${banksData.data?.length || 0} bancos encontrados`);

      // Retornar a lista de bancos para o frontend
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(banksData)
      };
    } catch (error) {
      console.error('Erro ao processar resposta JSON:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Falha ao processar resposta JSON da API Basiq',
          message: error.message
        })
      };
    }
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

// Função Netlify para obter token de autenticação da API Basiq
const fetch = require('node-fetch');

// Constantes
const BASIQ_API_URL = 'https://au-api.basiq.io';

exports.handler = async function(event, context) {
  // Configurar cabeçalhos CORS para permitir acesso do frontend
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

  try {
    // Obter a chave API do Basiq das variáveis de ambiente
    const BASIQ_API_KEY = process.env.BASIQ_API_KEY;
    
    if (!BASIQ_API_KEY) {
      throw new Error('BASIQ_API_KEY não está definida nas variáveis de ambiente');
    }

    console.log('Obtendo token da API Basiq...');
    
    // Fazer solicitação para obter token
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
    console.log('Token obtido com sucesso');

    // Retornar o token para o frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: tokenData.access_token,
        expires_in: tokenData.expires_in
      })
    };
  } catch (error) {
    console.error('Erro na função basiq-token:', error);
    
    // Retornar erro para o frontend
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao obter token da API Basiq',
        message: error.message
      })
    };
  }
};

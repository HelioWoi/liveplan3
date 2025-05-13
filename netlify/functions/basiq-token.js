// Função Netlify para obter token de autenticação da API Basiq
// Usando a API fetch nativa do Node.js 18+
// Se estiver usando Node.js < 18, descomente a linha abaixo
// const fetch = require('node-fetch');

// Logs para depuração
console.log('Módulo basiq-token carregado');

// Constantes
const BASIQ_API_URL = 'https://au-api.basiq.io';

exports.handler = async function(event, context) {
  console.log('Função basiq-token iniciada');
  console.log('Variáveis de ambiente disponíveis:', {
    VITE_BASIQ_API_KEY: process.env.VITE_BASIQ_API_KEY ? 'Definida' : 'Não definida',
    BASIQ_API_KEY: process.env.BASIQ_API_KEY ? 'Definida' : 'Não definida'
  });
  
  // Configurar cabeçalhos CORS para permitir acesso do frontend
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

  try {
    // Obter a chave API do Basiq das variáveis de ambiente
    // Tentar usar VITE_BASIQ_API_KEY primeiro, depois BASIQ_API_KEY como fallback
    const BASIQ_API_KEY = process.env.VITE_BASIQ_API_KEY || process.env.BASIQ_API_KEY;
    
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

    console.log('Obtendo token da API Basiq...');
    
    // Fazer solicitação para obter token
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

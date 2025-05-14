// Função Netlify para obter a lista de bancos disponíveis na API Basiq

const BASIQ_API_URL = 'https://au-api.basiq.io';

// Função auxiliar para obter token
async function getToken() {
  // Usar variável correta vinda do Netlify
  const BASIQ_API_KEY = process.env.VITE_BASIQ_API_KEY;

  if (!BASIQ_API_KEY) {
    throw new Error('Variável VITE_BASIQ_API_KEY não está definida.');
  }

  // Não reencode se a chave já estiver em Base64
  const authHeader = BASIQ_API_KEY.includes(':')
    ? `Basic ${Buffer.from(`${BASIQ_API_KEY}:`).toString('base64')}`
    : `Basic ${BASIQ_API_KEY}`;

  const response = await fetch(`${BASIQ_API_URL}/token`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '3.0',
    },
    body: 'scope=SERVER_ACCESS',
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Erro ao obter token: ${response.status} ${err}`);
  }

  const { access_token } = await response.json();
  return access_token;
}

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido. Use GET.' }),
    };
  }

  try {
    const token = await getToken();

    const res = await fetch(`${BASIQ_API_URL}/institutions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
        'basiq-version': '3.0',
      },
    });

    if (!res.ok) {
      const msg = await res.text();
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: 'Erro ao obter bancos', details: msg }),
      };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno', message: err.message }),
    };
  }
};

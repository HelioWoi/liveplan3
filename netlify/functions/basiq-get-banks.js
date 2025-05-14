const BASIQ_API_URL = 'https://au-api.basiq.io';

async function getToken() {
  const BASIQ_API_KEY = process.env.VITE_BASIQ_API_KEY;

  console.log("🔍 Chave recebida:", BASIQ_API_KEY ? "[DEFINIDA]" : "[NÃO DEFINIDA]");

  if (!BASIQ_API_KEY) {
    throw new Error('Variável VITE_BASIQ_API_KEY não está definida.');
  }

  const authHeader = BASIQ_API_KEY.includes(':')
    ? `Basic ${Buffer.from(`${BASIQ_API_KEY}:`).toString('base64')}`
    : `Basic ${BASIQ_API_KEY}`;

  console.log("🔐 Header de autorização final:", authHeader.slice(0, 30) + "...");

  const response = await fetch(`${BASIQ_API_URL}/token`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '3.0',
    },
    body: 'scope=SERVER_ACCESS',
  });

  console.log("📡 Requisição feita para /token");

  if (!response.ok) {
    const err = await response.text();
    console.error("❌ Falha ao obter token:", err);
    throw new Error(`Erro ao obter token: ${response.status} ${err}`);
  }

  const { access_token } = await response.json();
  console.log("✅ Token obtido com sucesso");

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
    console.log("🌐 Iniciando handler /banks");
    const token = await getToken();

    const res = await fetch(`${BASIQ_API_URL}/institutions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
        'basiq-version': '3.0',
      },
    });

    console.log("🏦 Requisição enviada para /institutions");

    if (!res.ok) {
      const msg = await res.text();
      console.error("❌ Erro ao buscar instituições:", msg);
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: 'Erro ao obter bancos', details: msg }),
      };
    }

    const data = await res.json();
    console.log("✅ Lista de bancos recebida com sucesso");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("💥 Erro no handler:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno', message: err.message }),
    };
  }
};

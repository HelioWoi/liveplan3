// Função Netlify para criar conexões bancárias na API Basiq
// Usando a API fetch nativa do Node.js 18+
// Se estiver usando Node.js < 18, descomente a linha abaixo
// const fetch = require('node-fetch');

// Constantes
const BASIQ_API_URL = 'https://au-api.basiq.io';

// Função auxiliar para obter token
async function getToken() {
  try {
    // Usar a chave da API fornecida diretamente
    // Esta chave já está codificada em Base64
    const base64Key = "MDkxYTI3YjktYjk5Yi00YTMzLWFmMTQtNWVlZmQ4NDNkM2VjOjk4MDM0YWZmLTNmNGEtNGYzOS1hZDA4LTU1YjcwNDI5MzU1Nw==";
    
    // Criar o header de autorização no formato correto
    const authHeader = `Basic ${base64Key}`;
    
    console.log("🔐 Usando chave da API fixa codificada em Base64");
    console.log("🔐 Header de autorização criado: Basic ***...");
    console.log('📱 Fazendo requisição para obter token');
    
    const response = await fetch(`${BASIQ_API_URL}/token`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'basiq-version': '3.0'
      },
      body: 'scope=SERVER_ACCESS'
    });

    console.log('📱 Resposta da API Basiq (status):', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao obter token:', errorText);
      throw new Error(`Falha ao obter token: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    console.log('✅ Token obtido com sucesso');
    return tokenData.access_token;
    
  } catch (error) {
    console.error('💥 Erro na função getToken:', error.message);
    throw error;
  }
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
    const { userId, institutionId } = requestData;
    
    // Validar dados obrigatórios
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID do usuário não fornecido.' })
      };
    }

    // Usar ID da instituição padrão se não for fornecido
    const bankId = institutionId || 'AU00001'; // ANZ Bank como padrão

    console.log('Criando conexão bancária na API Basiq...');
    console.log('Dados da conexão:', { userId, institutionId: bankId });
    
    // Obter token de acesso
    const token = await getToken();
    
    // Criar conexão na API Basiq
    const createConnectionResponse = await fetch(`${BASIQ_API_URL}/users/${userId}/connections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'basiq-version': '3.0'
      },
      body: JSON.stringify({
        institution: {
          id: bankId
        }
      })
    });

    if (!createConnectionResponse.ok) {
      const errorData = await createConnectionResponse.json();
      console.error('Erro ao criar conexão:', errorData);
      return {
        statusCode: createConnectionResponse.status,
        headers,
        body: JSON.stringify({ 
          error: 'Falha ao criar conexão bancária na API Basiq',
          details: errorData
        })
      };
    }

    const connectionData = await createConnectionResponse.json();
    console.log('Conexão criada com sucesso:', connectionData.id);

    // Retornar os dados da conexão para o frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(connectionData)
    };
  } catch (error) {
    console.error('Erro na função basiq-create-connection:', error);
    
    // Retornar erro para o frontend
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao criar conexão bancária na API Basiq',
        message: error.message
      })
    };
  }
};

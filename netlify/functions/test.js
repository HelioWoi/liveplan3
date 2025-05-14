exports.handler = async function(event, context) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: '🚀 A função Netlify está funcionando corretamente!',
        timestamp: new Date().toISOString()
      })
    };
  };
  
// Função Netlify para obter a lista de bancos disponíveis na API Basiq
// Este arquivo serve como um alias para basiq-get-banks.js
// Responde à rota /api/banks

// Importar o handler da função basiq-get-banks
const basiqGetBanks = require('./basiq-get-banks');

// Exportar o mesmo handler
exports.handler = basiqGetBanks.handler;

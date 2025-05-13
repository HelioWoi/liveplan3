// Script para limpar a chave da API Basiq do localStorage
// Execute este script no navegador para limpar a chave

// Limpar a chave da API Basiq
localStorage.removeItem('basiq_api_key_secure');

// Verificar se a chave foi removida
console.log('Chave da API Basiq no localStorage:', localStorage.getItem('basiq_api_key_secure'));

// Limpar outras possíveis chaves relacionadas
localStorage.removeItem('basiq_user_id');
localStorage.removeItem('basiq_token');

console.log('Limpeza do localStorage concluída');

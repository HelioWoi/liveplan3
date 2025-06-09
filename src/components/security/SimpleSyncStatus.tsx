import React from 'react';

/**
 * Componente simplificado para mostrar o status de sincronização
 * Não depende de serviços complexos para evitar problemas de compatibilidade
 */
const SimpleSyncStatus: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-3 w-3 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        Sincronizado
      </div>
    </div>
  );
};

export default SimpleSyncStatus;

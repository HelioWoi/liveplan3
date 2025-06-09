import React from 'react';

interface SimplePrivacyDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  securityLevel?: 'high' | 'medium' | 'low';
  setSecurityLevel?: (level: 'high' | 'medium' | 'low') => void;
  dataProtectionEnabled?: boolean;
  setDataProtectionEnabled?: (enabled: boolean) => void;
}

/**
 * Componente simplificado para o painel de privacidade
 * Não depende de serviços complexos para evitar problemas de compatibilidade
 */
const SimplePrivacyDashboard: React.FC<SimplePrivacyDashboardProps> = ({
  isOpen,
  onClose,
  securityLevel = 'medium',
  setSecurityLevel = () => {},
  dataProtectionEnabled = true,
  setDataProtectionEnabled = () => {}
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Configurações de Privacidade</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Nível de Segurança */}
          <div>
            <h3 className="font-medium mb-2">Nível de Segurança</h3>
            <div className="flex space-x-2">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSecurityLevel(level as 'high' | 'medium' | 'low')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    securityLevel === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {level === 'low' && 'Baixo'}
                  {level === 'medium' && 'Médio'}
                  {level === 'high' && 'Alto'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Define o nível de proteção para seus dados financeiros
            </p>
          </div>
          
          {/* Proteção de Dados */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Proteção de Dados</h3>
              <p className="text-xs text-gray-500">
                Ativa a criptografia para dados sensíveis
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dataProtectionEnabled}
                onChange={(e) => setDataProtectionEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                dataProtectionEnabled ? 'bg-blue-500' : ''
              }`}></div>
            </label>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePrivacyDashboard;

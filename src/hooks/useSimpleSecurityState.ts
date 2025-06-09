import { useState, useEffect } from 'react';

/**
 * Versão simplificada do hook useSecurityState para evitar problemas de compatibilidade
 * Fornece funcionalidades básicas de segurança sem dependências complexas
 */
export const useSimpleSecurityState = () => {
  const [showPrivacyDashboard, setShowPrivacyDashboard] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [dataProtectionEnabled, setDataProtectionEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Inicializa configurações de segurança a partir do localStorage
  useEffect(() => {
    try {
      // Carrega preferências de segurança do localStorage
      const storedSecurityLevel = localStorage.getItem('securityLevel');
      if (storedSecurityLevel && ['high', 'medium', 'low'].includes(storedSecurityLevel)) {
        setSecurityLevel(storedSecurityLevel as 'high' | 'medium' | 'low');
      }

      const storedDataProtection = localStorage.getItem('dataProtectionEnabled');
      if (storedDataProtection) {
        setDataProtectionEnabled(storedDataProtection === 'true');
      }
      
      // Simula uma sincronização inicial
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Falha ao carregar configurações de segurança:', error);
    }
  }, []);

  // Salva configurações de segurança quando elas mudam
  useEffect(() => {
    try {
      localStorage.setItem('securityLevel', securityLevel);
      localStorage.setItem('dataProtectionEnabled', String(dataProtectionEnabled));
    } catch (error) {
      console.error('Falha ao salvar configurações de segurança:', error);
    }
  }, [securityLevel, dataProtectionEnabled]);

  // Simula uma atualização periódica do tempo de sincronização
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSyncTime(new Date());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  return {
    showPrivacyDashboard,
    setShowPrivacyDashboard,
    securityLevel,
    setSecurityLevel,
    dataProtectionEnabled,
    setDataProtectionEnabled,
    lastSyncTime
  };
};

export default useSimpleSecurityState;

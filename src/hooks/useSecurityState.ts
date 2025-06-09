import { useState, useEffect } from 'react';
import { securityService } from '../services/securityService';
import { syncService } from '../services/syncService';
import { calculationService } from '../services/calculationService';

/**
 * Custom hook for managing security and privacy state
 */
export const useSecurityState = () => {
  const [showPrivacyDashboard, setShowPrivacyDashboard] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [dataProtectionEnabled, setDataProtectionEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [calculationVerificationEnabled, setCalculationVerificationEnabled] = useState(true);

  // Initialize security settings
  useEffect(() => {
    // Load security preferences from localStorage
    try {
      const storedSecurityLevel = localStorage.getItem('securityLevel');
      if (storedSecurityLevel && ['high', 'medium', 'low'].includes(storedSecurityLevel)) {
        setSecurityLevel(storedSecurityLevel as 'high' | 'medium' | 'low');
      }

      const storedDataProtection = localStorage.getItem('dataProtectionEnabled');
      if (storedDataProtection) {
        setDataProtectionEnabled(storedDataProtection === 'true');
      }

      const storedVerification = localStorage.getItem('calculationVerificationEnabled');
      if (storedVerification) {
        setCalculationVerificationEnabled(storedVerification === 'true');
      }

      // Initialize sync service
      syncService.initialize();
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  }, []);

  // Save security settings when they change
  useEffect(() => {
    try {
      localStorage.setItem('securityLevel', securityLevel);
      localStorage.setItem('dataProtectionEnabled', String(dataProtectionEnabled));
      localStorage.setItem('calculationVerificationEnabled', String(calculationVerificationEnabled));
    } catch (error) {
      console.error('Failed to save security settings:', error);
    }
  }, [securityLevel, dataProtectionEnabled, calculationVerificationEnabled]);

  // Update last sync time when sync status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const syncStatus = syncService.getSyncStatus();
      if (syncStatus.syncing === 0 && syncStatus.pending === 0) {
        setLastSyncTime(new Date());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Secure calculation wrapper
  const secureCalculate = (
    operation: string,
    callback: Function,
    ...args: any[]
  ): any => {
    try {
      // Create audit record before calculation
      const auditRecord = calculationService.createAuditRecord(
        operation,
        args,
        'pending'
      ) as Record<string, any>;

      // Perform calculation
      const result = callback(...args);

      // Update audit record with result
      auditRecord.result = result;

      // In a real app, we would store this audit record
      console.log('Calculation audit:', auditRecord);

      return result;
    } catch (error) {
      console.error(`Secure calculation failed for ${operation}:`, error);
      throw error;
    }
  };

  // Encrypt sensitive data
  const encryptSensitiveData = (data: any): string => {
    if (!dataProtectionEnabled) return JSON.stringify(data);
    return securityService.encryptData(data);
  };

  // Decrypt sensitive data
  const decryptSensitiveData = (encryptedData: string): any => {
    if (!dataProtectionEnabled) return JSON.parse(encryptedData);
    return securityService.decryptData(encryptedData);
  };

  return {
    showPrivacyDashboard,
    setShowPrivacyDashboard,
    securityLevel,
    setSecurityLevel,
    dataProtectionEnabled,
    setDataProtectionEnabled,
    calculationVerificationEnabled,
    setCalculationVerificationEnabled,
    lastSyncTime,
    secureCalculate,
    encryptSensitiveData,
    decryptSensitiveData
  };
};

export default useSecurityState;

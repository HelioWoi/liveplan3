/**
 * Security Service - Responsible for data encryption, authentication, and security features
 */
import CryptoJS from 'crypto-js';

// Secret key - In a real application, this would be stored in a secure environment variable
// and not hardcoded in the source code
const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-secure-key-for-development';

/**
 * Service for handling data encryption and security features
 */
export const securityService = {
  /**
   * Encrypts sensitive data
   * @param data - Data to encrypt
   * @returns Encrypted data string
   */
  encryptData: (data: any): string => {
    if (!data) return '';
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
  },

  /**
   * Decrypts encrypted data
   * @param encryptedData - Encrypted data string
   * @returns Decrypted data (parsed as JSON if possible)
   */
  decryptData: (encryptedData: string): any => {
    if (!encryptedData) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      // Try to parse as JSON, return as string if not valid JSON
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  },

  /**
   * Masks sensitive information like account numbers
   * @param value - Value to mask
   * @param visibleChars - Number of characters to leave visible at the end
   * @returns Masked string
   */
  maskSensitiveData: (value: string, visibleChars = 4): string => {
    if (!value || value.length <= visibleChars) return value;
    
    const visible = value.slice(-visibleChars);
    const masked = '•'.repeat(value.length - visibleChars);
    
    return masked + visible;
  },

  /**
   * Validates password strength
   * @param password - Password to validate
   * @returns Object containing validation result and feedback
   */
  validatePasswordStrength: (password: string): { isStrong: boolean; feedback: string } => {
    if (!password) {
      return { isStrong: false, feedback: 'Password is required' };
    }

    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    const isStrong = hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
    
    let feedback = '';
    if (!hasMinLength) feedback += 'Password must be at least 8 characters long. ';
    if (!hasUpperCase) feedback += 'Include at least one uppercase letter. ';
    if (!hasLowerCase) feedback += 'Include at least one lowercase letter. ';
    if (!hasNumbers) feedback += 'Include at least one number. ';
    if (!hasSpecialChars) feedback += 'Include at least one special character. ';
    
    if (isStrong) {
      feedback = 'Strong password';
    }
    
    return { isStrong, feedback };
  },

  /**
   * Generates a secure session token
   * @returns Secure random token
   */
  generateSessionToken: (): string => {
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    return randomBytes.toString(CryptoJS.enc.Hex);
  }
};

export default securityService;

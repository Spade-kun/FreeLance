import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment or generate one
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(KEY_LENGTH).toString('hex');

if (!process.env.ENCRYPTION_KEY) {
  console.warn('⚠️  WARNING: ENCRYPTION_KEY not set in .env file. Using temporary key. Data will not be decryptable after restart!');
  console.warn('⚠️  Add this to your .env file:');
  console.warn(`ENCRYPTION_KEY=${ENCRYPTION_KEY}`);
} else {
  console.log('✅ Encryption key loaded from .env file');
}

/**
 * Derives a key from the encryption key and salt
 */
function deriveKey(salt) {
  return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Encrypts a string value
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: salt:iv:encrypted:tag
 */
export function encrypt(text) {
  if (!text) return text;
  
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from salt
    const key = deriveKey(salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Return salt:iv:encrypted:tag format
    return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts an encrypted string
 * @param {string} encryptedText - Encrypted text in format: salt:iv:encrypted:tag
 * @returns {string} - Decrypted plain text
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;
  
  try {
    // Check if the text is in encrypted format
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      // Not encrypted, return as is (for backward compatibility)
      return encryptedText;
    }
    
    const [saltHex, ivHex, encrypted, tagHex] = parts;
    
    // Convert hex strings back to buffers
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    // Derive key from salt
    const key = deriveKey(salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return original text if decryption fails (for backward compatibility)
    return encryptedText;
  }
}

/**
 * Encrypts sensitive payment fields
 * @param {Object} paymentData - Payment data object
 * @returns {Object} - Payment data with encrypted fields
 */
export function encryptPaymentData(paymentData) {
  const encrypted = { ...paymentData };
  
  // Encrypt sensitive fields
  if (encrypted.transactionId) {
    encrypted.transactionId = encrypt(encrypted.transactionId);
  }
  if (encrypted.paypalOrderId) {
    encrypted.paypalOrderId = encrypt(encrypted.paypalOrderId);
  }
  if (encrypted.payerEmail) {
    encrypted.payerEmail = encrypt(encrypted.payerEmail);
  }
  if (encrypted.studentEmail) {
    encrypted.studentEmail = encrypt(encrypted.studentEmail);
  }
  
  return encrypted;
}

/**
 * Decrypts sensitive payment fields
 * @param {Object} paymentData - Encrypted payment data object
 * @returns {Object} - Payment data with decrypted fields
 */
export function decryptPaymentData(paymentData) {
  const decrypted = { ...paymentData };
  
  // Decrypt sensitive fields
  if (decrypted.transactionId) {
    decrypted.transactionId = decrypt(decrypted.transactionId);
  }
  if (decrypted.paypalOrderId) {
    decrypted.paypalOrderId = decrypt(decrypted.paypalOrderId);
  }
  if (decrypted.payerEmail) {
    decrypted.payerEmail = decrypt(decrypted.payerEmail);
  }
  if (decrypted.studentEmail) {
    decrypted.studentEmail = decrypt(decrypted.studentEmail);
  }
  
  return decrypted;
}

/**
 * Decrypts an array of payment objects
 * @param {Array} payments - Array of encrypted payment objects
 * @returns {Array} - Array of decrypted payment objects
 */
export function decryptPaymentArray(payments) {
  return payments.map(payment => {
    // Convert Mongoose document to plain object if needed
    const paymentObj = payment.toObject ? payment.toObject() : payment;
    
    console.log('🔓 Decrypting payment:', {
      id: paymentObj._id,
      transactionId: paymentObj.transactionId?.substring(0, 50) + '...',
      isEncrypted: paymentObj.transactionId?.includes(':')
    });
    
    // Decrypt the payment data
    const decrypted = decryptPaymentData(paymentObj);
    
    console.log('🔓 Decrypted payment:', {
      id: decrypted._id,
      transactionId: decrypted.transactionId?.substring(0, 50),
      wasDecrypted: paymentObj.transactionId !== decrypted.transactionId
    });
    
    return decrypted;
  });
}

export default {
  encrypt,
  decrypt,
  encryptPaymentData,
  decryptPaymentData,
  decryptPaymentArray
};

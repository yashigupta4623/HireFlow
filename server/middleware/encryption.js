const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data
 */
function encrypt(text) {
  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 */
function decrypt(encryptedData) {
  try {
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way)
 */
function hash(text) {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
}

/**
 * Generate secure random token
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt sensitive fields in request
 */
function encryptSensitiveFields(sensitiveFields = []) {
  return (req, res, next) => {
    if (req.body) {
      for (const field of sensitiveFields) {
        if (req.body[field]) {
          req.body[field] = encrypt(req.body[field]);
        }
      }
    }
    next();
  };
}

/**
 * Mask sensitive data in responses
 */
function maskSensitiveData(data, fieldsToMask = ['email', 'phone']) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const masked = Array.isArray(data) ? [] : {};

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (fieldsToMask.includes(key) && typeof data[key] === 'string') {
        // Mask email: a***@example.com
        if (key === 'email') {
          const [local, domain] = data[key].split('@');
          masked[key] = `${local[0]}***@${domain}`;
        }
        // Mask phone: ***-***-1234
        else if (key === 'phone') {
          masked[key] = `***-***-${data[key].slice(-4)}`;
        }
        else {
          masked[key] = '***';
        }
      } else if (typeof data[key] === 'object') {
        masked[key] = maskSensitiveData(data[key], fieldsToMask);
      } else {
        masked[key] = data[key];
      }
    }
  }

  return masked;
}

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateSecureToken,
  encryptSensitiveFields,
  maskSensitiveData
};

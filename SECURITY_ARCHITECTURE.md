# 🔐 Security Architecture

## Overview

TalentVoice implements enterprise-grade security with multiple layers of protection to ensure data privacy, prevent unauthorized access, and maintain system integrity.

---

## Security Layers

### 1. **Authentication & Authorization**

#### JWT Token-Based Authentication
- **Implementation**: `server/middleware/auth.js`
- **Token Expiry**: 24 hours
- **Algorithm**: HS256
- **Storage**: Client-side (localStorage/sessionStorage)

**Features**:
- Secure token generation with user claims
- Token verification middleware
- Role-based access control (RBAC)
- API key validation for public endpoints

**Usage**:
```javascript
// Generate token
const token = generateToken({ id: user.id, email: user.email, role: 'recruiter' });

// Protect routes
app.get('/api/protected', verifyToken, (req, res) => {
  // req.user contains decoded token
});

// Role-based protection
app.post('/api/admin', verifyToken, requireRole('admin'), (req, res) => {
  // Only admins can access
});
```

---

### 2. **Rate Limiting**

#### DDoS Protection
- **Implementation**: `server/middleware/rateLimiter.js`
- **Default Limit**: 100 requests per 15 minutes
- **Strict Limit**: 10 requests per 15 minutes (sensitive endpoints)
- **API Limit**: 60 requests per minute

**Features**:
- In-memory rate limiting (Redis recommended for production)
- Automatic cleanup of expired entries
- Rate limit headers in responses
- Configurable windows and limits

**Usage**:
```javascript
// Standard rate limiting
app.use('/api/', apiRateLimit());

// Strict rate limiting for auth endpoints
app.post('/api/login', strictRateLimit(), loginHandler);
```

---

### 3. **Input Validation & Sanitization**

#### XSS Prevention
- **Implementation**: `server/middleware/security.js`
- **Sanitizes**: Request body, query params, URL params
- **Removes**: HTML tags, JavaScript protocols, event handlers

#### SQL Injection Prevention
- **Pattern Detection**: Blocks SQL keywords and special characters
- **Validation**: Checks all input fields recursively

**Features**:
- Automatic input sanitization
- SQL injection pattern detection
- File upload validation
- MIME type checking
- File size limits (10MB max)

---

### 4. **Data Encryption**

#### At-Rest Encryption
- **Implementation**: `server/middleware/encryption.js`
- **Algorithm**: AES-256-GCM
- **Key Management**: Environment variable (rotate regularly)

**Features**:
- Encrypt sensitive fields (passwords, API keys)
- Decrypt on authorized access
- One-way hashing for passwords
- Secure token generation

**Usage**:
```javascript
// Encrypt sensitive data
const encrypted = encrypt('sensitive-data');

// Decrypt when needed
const decrypted = decrypt(encrypted);

// Hash passwords (one-way)
const hashed = hash('password123');
```

#### In-Transit Encryption
- **HTTPS**: Required in production
- **TLS 1.2+**: Minimum version
- **Certificate**: Let's Encrypt or commercial CA

---

### 5. **Security Headers**

#### HTTP Security Headers
- **X-Frame-Options**: DENY (prevent clickjacking)
- **X-Content-Type-Options**: nosniff (prevent MIME sniffing)
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: HTTPS enforcement
- **Content-Security-Policy**: Restrict resource loading
- **Referrer-Policy**: Control referrer information
- **Permissions-Policy**: Control browser features

---

### 6. **CORS Configuration**

#### Cross-Origin Resource Sharing
- **Allowed Origins**: Configurable whitelist
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Credentials**: Supported
- **Preflight**: Automatic handling

**Configuration**:
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

---

### 7. **File Upload Security**

#### Validation Rules
- **Allowed Types**: PDF, DOCX, TXT only
- **Max Size**: 10MB
- **Filename**: Sanitized and randomized
- **Storage**: Isolated directory with restricted permissions

**Features**:
- MIME type validation
- File size checking
- Secure filename generation
- Virus scanning (recommended for production)

---

### 8. **Audit Logging**

#### Activity Tracking
- **Logs**: All API requests
- **Data**: Timestamp, method, path, IP, user agent, user
- **Storage**: Console (use database/log service in production)

**Log Format**:
```json
{
  "timestamp": "2025-11-14T22:30:00.000Z",
  "method": "POST",
  "path": "/api/upload",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "user": "recruiter@example.com"
}
```

---

## Implementation Guide

### Step 1: Install Dependencies

```bash
npm install jsonwebtoken bcrypt helmet express-rate-limit
```

### Step 2: Configure Environment Variables

```env
# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
ENCRYPTION_KEY=your-32-byte-encryption-key-in-hex
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3003
VALID_API_KEYS=key1,key2,key3

# Production Settings
NODE_ENV=production
HTTPS_ENABLED=true
```

### Step 3: Apply Middleware

```javascript
const { verifyToken, requireRole } = require('./middleware/auth');
const { apiRateLimit, strictRateLimit } = require('./middleware/rateLimiter');
const { 
  sanitizeInput, 
  securityHeaders, 
  configureCORS,
  validateFileUpload,
  preventSQLInjection,
  auditLog
} = require('./middleware/security');

// Apply global middleware
app.use(configureCORS);
app.use(securityHeaders);
app.use(sanitizeInput);
app.use(preventSQLInjection);
app.use(auditLog);
app.use(apiRateLimit());

// Protect specific routes
app.post('/api/upload', 
  verifyToken, 
  validateFileUpload, 
  uploadHandler
);

app.get('/api/admin/users', 
  verifyToken, 
  requireRole('admin'), 
  getUsersHandler
);

app.post('/api/login', 
  strictRateLimit(), 
  loginHandler
);
```

---

## Security Best Practices

### 1. **Environment Variables**
- ✅ Never commit `.env` to version control
- ✅ Use different keys for dev/staging/production
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use secret management services (AWS Secrets Manager, HashiCorp Vault)

### 2. **Password Security**
- ✅ Minimum 8 characters
- ✅ Require uppercase, lowercase, numbers, special chars
- ✅ Hash with bcrypt (cost factor 10+)
- ✅ Never store plain text passwords
- ✅ Implement password reset with time-limited tokens

### 3. **API Security**
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use API versioning
- ✅ Document security requirements

### 4. **Data Protection**
- ✅ Encrypt sensitive data at rest
- ✅ Use TLS for data in transit
- ✅ Implement data retention policies
- ✅ Regular security audits
- ✅ GDPR/CCPA compliance

### 5. **Monitoring & Alerts**
- ✅ Log all security events
- ✅ Monitor for suspicious activity
- ✅ Set up alerts for failed auth attempts
- ✅ Regular security scans
- ✅ Incident response plan

---

## Compliance

### GDPR Compliance
- ✅ Data encryption
- ✅ Right to be forgotten (data deletion)
- ✅ Data portability
- ✅ Consent management
- ✅ Privacy policy

### SOC 2 Compliance
- ✅ Access controls
- ✅ Audit logging
- ✅ Data encryption
- ✅ Incident response
- ✅ Regular security assessments

---

## Security Checklist

### Development
- [ ] All secrets in environment variables
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting implemented
- [ ] Authentication required for sensitive endpoints
- [ ] Role-based access control

### Production
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Audit logging enabled
- [ ] Error messages don't leak sensitive info
- [ ] Database credentials secured
- [ ] Regular security updates
- [ ] Backup and disaster recovery plan
- [ ] Penetration testing completed
- [ ] Security monitoring active

---

## Incident Response

### In Case of Security Breach

1. **Immediate Actions**
   - Isolate affected systems
   - Revoke compromised credentials
   - Enable additional logging
   - Notify security team

2. **Investigation**
   - Review audit logs
   - Identify attack vector
   - Assess data exposure
   - Document findings

3. **Remediation**
   - Patch vulnerabilities
   - Reset all credentials
   - Update security policies
   - Notify affected users (if required)

4. **Post-Incident**
   - Conduct post-mortem
   - Update security procedures
   - Implement additional controls
   - Train team on lessons learned

---

## Contact

For security concerns or to report vulnerabilities:
- Email: security@talenvoice.com
- Bug Bounty: [Link to program]

---

## Updates

- **v1.0** - Initial security implementation
- **v1.1** - Added encryption layer
- **v1.2** - Enhanced rate limiting
- **v1.3** - GDPR compliance features

---

**Last Updated**: November 2025  
**Next Review**: February 2026

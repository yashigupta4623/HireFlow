/**
 * Rate Limiting Middleware
 * Prevents abuse and DDoS attacks
 */

const rateLimitStore = new Map();

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */
function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later.'
  } = options;

  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Get or create rate limit entry
    let limitData = rateLimitStore.get(identifier);
    
    if (!limitData) {
      limitData = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(identifier, limitData);
    }

    // Reset if window expired
    if (now > limitData.resetTime) {
      limitData.count = 0;
      limitData.resetTime = now + windowMs;
    }

    // Increment request count
    limitData.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - limitData.count));
    res.setHeader('X-RateLimit-Reset', new Date(limitData.resetTime).toISOString());

    // Check if limit exceeded
    if (limitData.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((limitData.resetTime - now) / 1000)
      });
    }

    next();
  };
}

/**
 * Strict rate limiter for sensitive endpoints
 */
function strictRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Too many attempts. Please try again in 15 minutes.'
  });
}

/**
 * API rate limiter
 */
function apiRateLimit() {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'API rate limit exceeded. Maximum 60 requests per minute.'
  });
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime + 3600000) { // 1 hour after reset
      rateLimitStore.delete(key);
    }
  }
}, 3600000);

module.exports = {
  rateLimit,
  strictRateLimit,
  apiRateLimit
};

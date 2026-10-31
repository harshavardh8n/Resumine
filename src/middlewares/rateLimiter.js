const rateLimit = require('express-rate-limit');

// General API Rate Limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict AI Endpoints Rate Limiter: 25 calls per 15 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    success: false,
    statusCode: 429,
    message: 'AI rate limit exceeded. Please wait a few minutes before analyzing more resumes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth Rate Limiter (Prevent brute-force): 15 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  aiLimiter,
  authLimiter,
};


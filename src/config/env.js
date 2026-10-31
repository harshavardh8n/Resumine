const dotenv = require('dotenv');
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.REACT_APP_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/resumine',
  JWT_SECRET: process.env.JWT_SECRET || 'resumine_super_secret_jwt_key_2025',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MAX_FILE_SIZE_MB: 5,
};

module.exports = { env };

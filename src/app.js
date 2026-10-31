const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { env } = require('./config/env');
const { errorHandler } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');
const { authRouter } = require('./routes/auth.routes');
const { resumeRouter } = require('./routes/resume.routes');
const { upload } = require('./middlewares/upload');
const { ResumeController } = require('./controllers/resume.controller');
const { optionalAuth } = require('./middlewares/auth');

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, can restrict in strict prod
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiter
app.use('/api/', generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.send('ResuMine API is running. Check /health for status.');
});

// Primary API Routes
app.use('/api/auth', authRouter);
app.use('/api/resume', resumeRouter);

// Backward Compatibility Aliases for Legacy Frontend Calls
app.post('/api/analyse', optionalAuth, upload.single('resume'), (req, res, next) => {
  // If legacy frontend expects raw text or JSON, ResumeController handles it cleanly
  ResumeController.analyze(req, res, next);
});

app.post('/api/compare', upload.fields([{ name: 'resume1' }, { name: 'resume2' }]), ResumeController.compare);
app.post('/create', ResumeController.create);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = { app };

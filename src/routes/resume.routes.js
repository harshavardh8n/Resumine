const express = require('express');
const router = express.Router();
const { ResumeController } = require('../controllers/resume.controller');
const { upload } = require('../middlewares/upload');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { aiLimiter } = require('../middlewares/rateLimiter');

// Single resume analysis (Supports File upload or Image/Doc URL)
router.post(
  '/analyze',
  aiLimiter,
  optionalAuth,
  upload.single('resume'),
  ResumeController.analyze
);

// Compare two resumes (Supports two file uploads or URLs)
router.post(
  '/compare',
  aiLimiter,
  upload.fields([
    { name: 'resume1', maxCount: 1 },
    { name: 'resume2', maxCount: 1 },
  ]),
  ResumeController.compare
);

// Generate resume content
router.post('/create', aiLimiter, ResumeController.create);

// History & single analysis lookup
router.get('/history', authenticate, ResumeController.getHistory);
router.get('/:id', optionalAuth, ResumeController.getById);

module.exports = { resumeRouter: router };


const express = require('express');
const router = express.Router();
const { AuthController } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.get('/me', authenticate, AuthController.getMe);

module.exports = { authRouter: router };

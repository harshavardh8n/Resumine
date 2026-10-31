const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { ApiError } = require('../utils/apiError');
const { User } = require('../models/User');
const { getIsConnected } = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (getIsConnected()) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        throw ApiError.unauthorized('User not found or account deactivated');
      }
      req.user = user;
    } else {
      req.user = { _id: decoded.id, email: decoded.email, name: decoded.name };
    }

    next();
  } catch (error) {
    next(error);
  }
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);
      if (getIsConnected()) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) req.user = user;
      } else {
        req.user = { _id: decoded.id, email: decoded.email, name: decoded.name };
      }
    }
  } catch (err) {
    // Optional auth silently continues as guest if token is invalid or expired
    req.user = null;
  }
  next();
}

module.exports = {
  authenticate,
  optionalAuth,
};


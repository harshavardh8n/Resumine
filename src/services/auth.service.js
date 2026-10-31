const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { env } = require('../config/env');
const { ApiError } = require('../utils/apiError');
const { getIsConnected } = require('../config/db');

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

class AuthService {
  static async register({ name, email, password }) {
    if (!getIsConnected()) {
      // Memory fallback for development when MongoDB is not running locally
      const mockUser = {
        _id: 'dev_mock_id_' + Date.now(),
        name,
        email,
      };
      const token = generateToken(mockUser);
      return { user: mockUser, token };
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.badRequest('An account with this email already exists');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async login({ email, password }) {
    if (!getIsConnected()) {
      // Mock dev login
      const mockUser = {
        _id: 'dev_mock_id_1',
        name: 'Developer User',
        email,
      };
      const token = generateToken(mockUser);
      return { user: mockUser, token };
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = generateToken(user);
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }
}

module.exports = { AuthService };

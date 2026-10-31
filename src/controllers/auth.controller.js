const { AuthService } = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validators/schemas');
const { ApiResponse } = require('../utils/apiResponse');

class AuthController {
  static async register(req, res, next) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.register(validated);
      return ApiResponse.success(res, result, 'Account registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated);
      return ApiResponse.success(res, result, 'Logged in successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      return ApiResponse.success(res, req.user, 'Current user profile');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController };

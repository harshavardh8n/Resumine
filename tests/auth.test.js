const request = require('supertest');
const { app } = require('../src/app');

describe('ResuMine API - Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should reject registration if password is too short', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Tester',
        email: 'test@example.com',
        password: '123', // < 6 chars
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should register successfully with valid details', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Tester One',
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.name).toBe('Tester One');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return token', async () => {
      const email = `login_test_${Date.now()}@example.com`;
      const res = await request(app).post('/api/auth/login').send({
        email,
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });
  });
});

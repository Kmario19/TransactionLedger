import request from 'supertest';
import { app } from './index';

describe('Express Server', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('GET /', () => {
    it('should return 200 and Hello World message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello, world!');
    });
  });

  describe('Server Configuration', () => {
    it('should use default port 3000 when PORT env is not set', () => {
      process.env.PORT = undefined;
      const { app: testApp } = require('./index');
      expect(testApp.get('port')).toBe(3000);
    });

    it('should use PORT from environment variable when set', () => {
      process.env.PORT = '4000';
      const { app: testApp } = require('./index');
      expect(testApp.get('port')).toBe(4000);
    });
  });
});

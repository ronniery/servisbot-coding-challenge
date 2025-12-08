import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Environment, getEnvironment } from '../../src/configuration/environment';

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
  },
}));

describe('environment', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should parse API_PORT as number', () => {
      const env = new Environment({ API_PORT: '3000', HEALTH_CHECK_PORT: '3001' });

      expect(env.API_PORT).toBe(3000);
      expect(typeof env.API_PORT).toBe('number');
    });

    it('should parse HEALTH_CHECK_PORT as number', () => {
      const env = new Environment({ API_PORT: '3000', HEALTH_CHECK_PORT: '3001' });

      expect(env.HEALTH_CHECK_PORT).toBe(3001);
      expect(typeof env.HEALTH_CHECK_PORT).toBe('number');
    });

    it('should handle numeric values', () => {
      const env = new Environment({ API_PORT: 4000, HEALTH_CHECK_PORT: 4001 });

      expect(env.API_PORT).toBe(4000);
      expect(env.HEALTH_CHECK_PORT).toBe(4001);
    });
  });

  describe('validate', () => {
    it('should pass validation with valid values', () => {
      const env = new Environment({ API_PORT: '3000', HEALTH_CHECK_PORT: '3001' });

      expect(() => env.validate()).not.toThrow();
    });

    it('should return this for method chaining', () => {
      const env = new Environment({ API_PORT: '3000', HEALTH_CHECK_PORT: '3001' });
      const result = env.validate();

      expect(result).toBe(env);
    });

    it('should throw error when API_PORT is missing', () => {
      const env = new Environment({ HEALTH_CHECK_PORT: '3001' });

      expect(() => env.validate()).toThrow();
    });

    it('should throw error when HEALTH_CHECK_PORT is missing', () => {
      const env = new Environment({ API_PORT: '3000' });

      expect(() => env.validate()).toThrow();
    });

    it('should throw error when API_PORT is not a number', () => {
      const env = new Environment({ API_PORT: 'not-a-number', HEALTH_CHECK_PORT: '3001' });

      expect(() => env.validate()).toThrow();
    });

    it('should throw error when HEALTH_CHECK_PORT is not a number', () => {
      const env = new Environment({ API_PORT: '3000', HEALTH_CHECK_PORT: 'not-a-number' });

      expect(() => env.validate()).toThrow();
    });

    it('should throw error when both ports are missing', () => {
      const env = new Environment({});

      expect(() => env.validate()).toThrow();
    });

    it('should accept zero as valid port', () => {
      const env = new Environment({ API_PORT: '0', HEALTH_CHECK_PORT: '0' });

      expect(() => env.validate()).not.toThrow();
      expect(env.API_PORT).toBe(0);
      expect(env.HEALTH_CHECK_PORT).toBe(0);
    });
  });

  describe('getEnvironment', () => {
    it('should load environment from process.env', () => {
      process.env.API_PORT = '5000';
      process.env.HEALTH_CHECK_PORT = '5001';

      const env = getEnvironment();

      expect(env.API_PORT).toBe(5000);
      expect(env.HEALTH_CHECK_PORT).toBe(5001);
    });

    it('should validate loaded environment', () => {
      process.env.API_PORT = '6000';
      process.env.HEALTH_CHECK_PORT = '6001';

      expect(() => getEnvironment()).not.toThrow();
    });

    it('should throw error when process.env is invalid', () => {
      delete process.env.API_PORT;
      delete process.env.HEALTH_CHECK_PORT;

      expect(() => getEnvironment()).toThrow();
    });

    it('should return Environment instance', () => {
      process.env.API_PORT = '7000';
      process.env.HEALTH_CHECK_PORT = '7001';

      const env = getEnvironment();

      expect(env).toBeInstanceOf(Environment);
    });

    it('should handle string port values from process.env', () => {
      process.env.API_PORT = '8080';
      process.env.HEALTH_CHECK_PORT = '8081';

      const env = getEnvironment();

      expect(env.API_PORT).toBe(8080);
      expect(env.HEALTH_CHECK_PORT).toBe(8081);
    });
  });
});

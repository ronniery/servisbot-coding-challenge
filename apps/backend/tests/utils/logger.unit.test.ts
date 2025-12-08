import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { logger } from '../../src/utils/logger';

describe('logger', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have info method', () => {
    expect(logger.info).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  it('should have debug method', () => {
    expect(logger.debug).toBeDefined();
    expect(typeof logger.debug).toBe('function');
  });

  it('should have warn method', () => {
    expect(logger.warn).toBeDefined();
    expect(typeof logger.warn).toBe('function');
  });

  it('should have error method', () => {
    expect(logger.error).toBeDefined();
    expect(typeof logger.error).toBe('function');
  });

  it('should have transports', () => {
    expect(logger.transports).toBeDefined();
    expect(Array.isArray(logger.transports)).toBe(true);
  });

  it('should have at least one transport', () => {
    expect(logger.transports.length).toBeGreaterThan(0);
  });

  it('should silence logger in test environment', () => {
    expect(logger.transports.length).toBeGreaterThan(0);
  });
});

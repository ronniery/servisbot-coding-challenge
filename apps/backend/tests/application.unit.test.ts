import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

import type { Environment } from '../src/configuration';
import type { DataStore } from '../src/utils';
import type { BotController } from '../src/controllers';

import { Application } from '../src/application';
import { logger } from '../src/utils';

vi.mock('../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));


describe('application.unit', () => {
  let mockEnv: Environment;
  let mockDataStore: DataStore;
  let mockController: BotController;
  let app: Application;
  let processExitSpy: Mock<typeof process.exit> ;
  let processOnSpy: Mock<typeof process.on>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock process.exit to prevent tests from actually exiting
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => { }) as any);
    processOnSpy = vi.spyOn(process, 'on');

    mockEnv = {
      API_PORT: 9999,
      HEALTH_CHECK_PORT: 10000,
      validate: vi.fn().mockReturnThis(),
    } as any;

    mockDataStore = {} as any;

    mockController = {
      getRouter: vi.fn().mockReturnValue({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      }),
    } as any;

    app = new Application({
      env: mockEnv,
      datastore: mockDataStore,
      botController: mockController,
      docsController: {} as any, // We don't care about the docs controller
    });
  });

  afterEach(() => {
    processExitSpy.mockRestore();
    processOnSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should create an Application instance', () => {
      expect(app).toBeDefined();
      expect(app).toBeInstanceOf(Application);
    });

    it('should setup graceful shutdown handlers', () => {
      // Verify that process event handlers were registered
      expect(processOnSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    });
  });

  describe('error handlers', () => {
    it('should handle uncaughtException', async () => {


      // Get the uncaughtException handler
      const [, uncaughtExceptionHandler] = processOnSpy.mock.calls.find(
        (call) => call[0] === 'uncaughtException',
      ) ?? [];

      expect(uncaughtExceptionHandler).toBeDefined();

      const testError = new Error('Test uncaught exception');

      // Call the handler
      uncaughtExceptionHandler?.(testError);

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith(
        `Uncaught exception: ${testError.message}`,
        { stack: testError.stack },
      );
    });

    it('should handle unhandledRejection', async () => {


      // Get the unhandledRejection handler
      const [, unhandledRejectionHandler] = processOnSpy.mock.calls.find(
        (call) => call[0] === 'unhandledRejection',
      ) ?? [];

      expect(unhandledRejectionHandler).toBeDefined();

      const testReason = 'Test unhandled rejection';

      // Call the handler
      unhandledRejectionHandler?.(testReason);

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith(`Unhandled rejection: ${testReason}`);
    });
  });

  describe('signal handlers', () => {
    it('should register SIGTERM handler', () => {
      const [, sigtermHandler] = processOnSpy.mock.calls.find((call) => call[0] === 'SIGTERM') ?? [];

      expect(sigtermHandler).toBeDefined();
      expect(typeof sigtermHandler).toBe('function');
    });

    it('should register SIGINT handler', () => {
      const [, sigintHandler] = processOnSpy.mock.calls.find((call) => call[0] === 'SIGINT') ?? [];

      expect(sigintHandler).toBeDefined();
      expect(typeof sigintHandler).toBe('function');
    });

    it('should handle SIGTERM signal', async () => {


      const [, sigtermHandler] = processOnSpy.mock.calls.find((call) => call[0] === 'SIGTERM') ?? [];

      // Call the handler
      sigtermHandler?.();

      // Verify logger was called
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('SIGTERM'));
    });

    it('should handle SIGINT signal', async () => {


      const [, sigintHandler] = processOnSpy.mock.calls.find((call) => call[0] === 'SIGINT') ?? [];

      // Call the handler
      sigintHandler?.();

      // Verify logger was called
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('SIGINT'));
    });

    it('should force shutdown on second signal', async () => {


      const [, sigtermHandler] = processOnSpy.mock.calls.find((call) => call[0] === 'SIGTERM') ?? [];

      // Call the handler twice
      sigtermHandler?.();
      sigtermHandler?.();

      // Verify warning was logged
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('received again'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('start', () => {
    it('should have a start method', () => {
      expect(app.start).toBeDefined();
      expect(typeof app.start).toBe('function');
    });
  });
});

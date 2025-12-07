import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

import { generalErrors, notFound } from '../../src/middlewares';

// Mocks
vi.mock('../../src/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('error.middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn<Response['json']>>;
  let statusMock: ReturnType<typeof vi.fn<Response['status']>>;

  beforeEach(() => {
    vi.clearAllMocks();

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      method: 'GET',
      path: '/test',
      params: {},
      query: {},
    };

    mockResponse = {
      json: jsonMock,
      status: statusMock,
      headersSent: false,
    };

    mockNext = vi.fn();
  });

  describe('generalErrors', () => {
    it('should return 500 status with error details', () => {
      const error = new Error('Test error message');

      generalErrors(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Test error message',
        path: '/test',
      });
    });

    it('should call next if headers already sent', () => {
      const error = new Error('Test error');
      mockResponse.headersSent = true;

      generalErrors(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should include request details in error response', () => {
      const error = new Error('Database error');

      Object.assign(mockRequest, {
        method: 'POST',
        path: '/api/bots',
        params: { id: '123' },
        query: { page: '1' },
      });

      generalErrors(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Database error',
        path: '/api/bots',
      });
    });

    it('should handle errors with stack traces', () => {
      const error = new Error('Stack trace test');
      error.stack = 'Error: Stack trace test\n    at test.js:1:1';

      generalErrors(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should not call next when headers not sent', () => {
      const error = new Error('Test error');
      mockResponse.headersSent = false;

      generalErrors(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('notFound', () => {
    it('should return 404 status with route info', () => {
      notFound(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Route GET /test not found',
        path: '/test',
      });
    });

    it('should include correct method in message', () => {
      Object.assign(mockRequest, {
        method: 'POST',
        path: '/api/unknown',
      });

      notFound(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Route POST /api/unknown not found',
        path: '/api/unknown',
      });
    });

    it('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach((method) => {
        vi.clearAllMocks();

        Object.assign(mockRequest, {
          method,
          path: '/test-path',
        });

        notFound(mockRequest as Request, mockResponse as Response);

        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Not Found',
          message: `Route ${method} /test-path not found`,
          path: '/test-path',
        });
      });
    });

    it('should handle root path', () => {
      Object.assign(mockRequest, {
        path: '/',
      });

      notFound(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Route GET / not found',
        path: '/',
      });
    });
  });
});

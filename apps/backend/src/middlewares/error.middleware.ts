import type { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger';

export const generalErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error(`Error processing ${req.method} ${req.path}: ${err.message}`, {
    stack: err.stack,
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    path: req.path,
  });
};

export const notFound = (req: Request, res: Response): void => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);

  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path,
  });
};

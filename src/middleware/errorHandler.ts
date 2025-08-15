import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { PrismaErrorHandler } from '../errors/PrismaErrorHandler';
import { ApiResponse } from '../types/common';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle operational errors (our custom errors)
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if ((err as any).code && (err as any).code.startsWith('P')) {
    const appError = PrismaErrorHandler.handle(err);
    const response: ApiResponse = {
      success: false,
      error: appError.message,
      code: appError.code,
      ...(appError.details && { details: appError.details }),
    };

    res.status(appError.statusCode).json(response);
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid JSON format',
      code: 'INVALID_JSON',
    };

    res.status(400).json(response);
    return;
  }

  // Handle validation errors from express-validator or other libraries
  if (err.name === 'ValidationError') {
    const response: ApiResponse = {
      success: false,
      error: err.message,
      code: 'VALIDATION_ERROR',
    };

    res.status(400).json(response);
    return;
  }

  // Handle unexpected errors
  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    code: 'INTERNAL_SERVER_ERROR',
  };

  res.status(500).json(response);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
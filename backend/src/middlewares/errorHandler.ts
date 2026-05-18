import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: number; // MongoDB error codes
  keyValue?: Record<string, any>;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors: any[] = [];

  console.error('❌ Error caught by global handler:', err);

  // MongoDB Duplicate Key Error (e.g. registration email duplicate)
  if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    const duplicatedField = Object.keys(err.keyValue)[0];
    message = `A record with this ${duplicatedField} already exists.`;
    errors = [{
      field: duplicatedField,
      message: `${duplicatedField} is already registered.`
    }];
  }

  // Mongoose Cast Error (e.g. invalid ObjectId search query)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found or invalid ID format.';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

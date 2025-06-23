import { Request, Response, NextFunction } from 'express';

class ErrorResponse extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;
  console.log(error.message);
  console.log("ddddddddddddddddddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff----------------------")

  // Log to console for dev
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message);
    error = new ErrorResponse(message.join(', '), 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  console.log('Not Found Middleware Triggered');
  // This middleware is used to handle 404 errors
  res.status(404).json({
    success: false,
    message: 'Not Found',
  });
};
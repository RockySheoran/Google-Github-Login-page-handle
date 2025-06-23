import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include 'sanitized' property
declare global {
  namespace Express {
    interface Request {
      sanitized?: {
        body?: any;
        query?: any;
        params?: any;
      };
    }
  }
}

const sanitize = () => (req: Request, res: Response, next: NextFunction) => {
  // Helper function to recursively sanitize objects without mutation
  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = key.replace(/[\$\.]/g, '_');
      sanitized[cleanKey] = sanitizeObject(value);
    }
    return sanitized;
  };

  // Create new sanitized objects instead of modifying existing ones
  const sanitizedBody = req.body ? sanitizeObject(req.body) : undefined;
  const sanitizedQuery = req.query ? sanitizeObject(req.query) : undefined;
  const sanitizedParams = req.params ? sanitizeObject(req.params) : undefined;

  // Attach sanitized versions to new properties
  req.sanitized = {
    body: sanitizedBody,
    query: sanitizedQuery,
    params: sanitizedParams
  };

  next();
};

export default sanitize;
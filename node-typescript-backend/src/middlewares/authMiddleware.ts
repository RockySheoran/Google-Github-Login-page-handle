import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { JWT_SECRET } from '../utils/constants';


export interface AuthenticatedRequest extends Request {
  user?: any;
  tokenData?:any;
}

// Protect routes
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  let token: string | undefined;

  // Check authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookies
  else if (req.cookies?.jwt) {
    token = req.cookies.token;
  }
  console.log("token 1111111111111", token)

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("decoded",decoded)

    
      req.tokenData = decoded;
    req.user = decoded; // Or use this if you prefer

    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Role authorization
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
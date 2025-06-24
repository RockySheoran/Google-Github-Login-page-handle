import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_COOKIE_EXPIRES_IN } from '../utils/constants';
import { Response } from 'express';

interface TokenPayload {
  id: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  
  return jwt.sign(
    payload,
    JWT_SECRET,
    options
  );
};
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET as jwt.Secret) as TokenPayload;
};

export const sendTokenResponse = (user: any, res: Response) => {
  const token = generateToken({ id: user.id, email: user.email });
  
  const cookieOptions = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  // Set JWT token in httpOnly cookie (secure)
  res.cookie('jwt', token, cookieOptions);
  
  // Also set user data in a separate non-httpOnly cookie
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    provider: user.provider,
    isVerified: user.isVerified,
  };
  
  res.cookie('userData', JSON.stringify(userData), {
    ...cookieOptions,
    httpOnly: false // Allow frontend to access
  });

  return token;
  // res.json({
    //   success: true,
    //   token,
  //   user: {
    //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //     avatar: user.avatar,
  //     provider: user.provider,
  //     isVerified: user.isVerified,
  //   },
  // });
};
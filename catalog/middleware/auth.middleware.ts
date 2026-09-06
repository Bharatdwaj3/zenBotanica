import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { JWT_ACC_SECRECT } from '../config/env.config.ts';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authUser = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ message: 'Access denied: no token provided', code: 'AUTH_REQUIRED' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_ACC_SECRECT) as { user: { id: number; role: string } };
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token', code: 'JWT_VERIFY_FAIL' });
  }
};
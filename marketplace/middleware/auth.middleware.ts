import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { JWT_ACC_SECRECT } from '../config/env.config.ts';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Access denied: no token provided' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_ACC_SECRECT) as { user: { id: number; role: string } };
    req.user = { id: decoded.user.id, role: decoded.user.role };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

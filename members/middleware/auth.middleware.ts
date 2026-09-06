import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma-client.ts';
import { JWT_ACC_SECRECT } from '../config/env.config.ts';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ message: 'Access denied: no token provided', code: 'AUTH_REQUIRED' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_ACC_SECRECT) as { user: { id: number; role: string } };

    const user = await prisma.user.findUnique({
      where: { id: decoded.user.id },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'User not found or deactivated' });
      return;
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token', code: 'JWT_VERIFY_FAIL' });
  }
};
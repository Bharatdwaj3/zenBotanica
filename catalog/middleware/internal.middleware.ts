import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { INTERNAL_SERVICE_SECRET } from '../config/env.config.ts';
type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

import { auth } from '../config/firebase-admin.config.ts';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}


export const requireInternalSecret = (req: Request, res: Response, next: NextFunction): void => {
  const secret = req.header('x-internal-secret');

  if (secret !== INTERNAL_SERVICE_SECRET) {
    res.status(403).json({ message: 'Forbidden: not an authorized internal caller' });
    return;
  }

  next();
};

export const firebaseAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.status(401).json({ message });
  }
};
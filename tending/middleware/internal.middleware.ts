import express from 'express';
import { INTERNAL_SERVICE_SECRET } from '../config/env.config.ts';

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

export const requireInternalSecret = (req: Request, res: Response, next: NextFunction): void => {
  const secret = req.header('x-internal-secret');
  if (secret !== INTERNAL_SERVICE_SECRET) {
    res.status(403).json({ message: 'Forbidden: not an authorized internal caller' });
    return;
  }
  next();
};

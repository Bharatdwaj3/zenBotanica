import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.middleware.ts';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({
        message: 'Forbidden - insufficient permissions',
        required: allowedRoles,
        current: userRole || 'none',
      });
      return;
    }
    next();
  };
};
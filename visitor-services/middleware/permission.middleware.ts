import PERMISSIONS from '../config/permissions.config.ts';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.middleware.ts';

const checkPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    const allowed = userRole ? PERMISSIONS[userRole] || [] : [];

    if (!allowed.includes(permission)) {
      res.status(403).json({ message: 'Access denied: insufficient permissions', required: permission });
      return;
    }
    next();
  };
};

export default checkPermission;
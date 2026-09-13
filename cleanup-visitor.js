const fs = require('fs');

// 1. Delete unnecessary files copied from gardeners
const filesToDelete = [
  'visitor-services/controller/auth.controller.ts',
  'visitor-services/routes/auth.routes.ts',
  'visitor-services/controller/internal.controller.ts',
  'visitor-services/routes/internal.routes.ts',
  'visitor-services/middleware/token.middleware.ts',
  'visitor-services/prisma/seed.ts'
];

filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log('Deleted:', file);
  }
});

// 2. Rewrite auth.middleware.ts to ONLY verify JWT, without querying prisma.user
const authMiddleware = `import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { JWT_ACC_SECRECT } from '../config/env.config.ts';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access denied: no token provided', code: 'AUTH_REQUIRED' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_ACC_SECRECT) as { user: { id: number; role: string } };
    req.user = { id: decoded.user.id, role: decoded.user.role };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token', code: 'JWT_VERIFY_FAIL' });
  }
};
`;

fs.writeFileSync('visitor-services/middleware/auth.middleware.ts', authMiddleware);
console.log('Rewritten: visitor-services/middleware/auth.middleware.ts');

// 3. Update server.ts to remove deleted routes
let serverTs = fs.readFileSync('visitor-services/server.ts', 'utf8');
serverTs = serverTs.replace(/import authRoutes from '\.\/routes\/auth\.routes\.ts';\n/g, '');
serverTs = serverTs.replace(/import internalRoutes from '\.\/routes\/internal\.routes\.ts';\n/g, '');
serverTs = serverTs.replace(/app\.use\('\/api\/v1\/auth', authRoutes\);\n/g, '');
serverTs = serverTs.replace(/app\.use\('\/api\/v1\/internal', internalRoutes\);\n/g, '');
serverTs = serverTs.replace(/Gardeners service/Gardeners (Visitor) service/g);

fs.writeFileSync('visitor-services/server.ts', serverTs);
console.log('Updated: visitor-services/server.ts');

console.log("Cleanup complete!");

import jwt from 'jsonwebtoken';
import type { Response, Request } from 'express';
import prisma from '../config/prisma-client.ts';
import { JWT_ACC_SECRECT, JWT_ACC_EXPIRES_IN, JWT_REF_SECRECT, JWT_REF_EXPIRES_IN } from '../config/env.config.ts';

type SafeUser = { id: number; role: string };

const cookieOpts = (maxAgeSeconds: number, path = '/') => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  path,
  maxAge: maxAgeSeconds * 1000,
});

export const setAccessToken = (res: Response, user: SafeUser): string => {
  const payload = { user: { id: user.id, role: user.role } };
  const token = jwt.sign(payload, JWT_ACC_SECRECT, { expiresIn: JWT_ACC_EXPIRES_IN });
  res.cookie('accessToken', token, cookieOpts(15 * 60));
  return token;
};

export const setRefreshToken = async (res: Response, user: SafeUser): Promise<string> => {
  const payload = { user: { id: user.id } };
  const token = jwt.sign(payload, JWT_REF_SECRECT, { expiresIn: JWT_REF_EXPIRES_IN });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: token } });

  res.cookie('refreshToken', token, cookieOpts(7 * 24 * 60 * 60));
  return token;
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401).json({ message: 'No refresh token provided', code: 'REFRESH_TOKEN_MISSING' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_REF_SECRECT) as { user: { id: number } };

    const user = await prisma.user.findFirst({
      where: { id: decoded.user.id, refreshToken: token, isActive: true },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid or revoked refresh token', code: 'REFRESH_TOKEN_INVALID' });
      return;
    }

    const newAccessToken = setAccessToken(res, user);
    await setRefreshToken(res, user);

    res.status(200).json({ message: 'Token refreshed', accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: 'Refresh token expired or invalid', code: 'REFRESH_TOKEN_EXPIRED' });
  }
};
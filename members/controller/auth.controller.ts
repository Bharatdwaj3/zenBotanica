import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import prisma from '../config/prisma-client.ts';
import { setAccessToken, setRefreshToken, clearAuthCookies } from '../middleware/token.middleware.ts';
import type { AuthRequest } from '../middleware/auth.middleware.ts';
import PERMISSIONS from '../config/permissions.config.ts';

const PUBLIC_SIGNUP_ROLES = ['faculty', 'student']; // admin excluded — seed-only


export const completeProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { email, Fname, Lname, age, gender, Expertise, Subjects } = req.body;

    if (role === 'faculty') {
      const faculty = await prisma.faculty.create({
        data: { email, Fname, Lname, age: Number(age), gender, Expertise, userId },
      });
      res.status(201).json(faculty);
      return;
    }

    if (role === 'student') {
      const student = await prisma.student.create({
        data: { email, Fname, Lname, age: Number(age), gender, Subjects, userId },
      });
      res.status(201).json(student);
      return;
    }

    res.status(400).json({ message: `Role "${role}" has no profile to complete` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to complete profile';
    res.status(500).json({ message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    if (!role) {
      res.status(400).json({ message: 'Please select a role to complete registration' });
      return;
    }
    if (!PUBLIC_SIGNUP_ROLES.includes(role)) {
      res.status(400).json({ message: 'Please select a valid role to complete registration', allowed: PUBLIC_SIGNUP_ROLES });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashedPassword, role } });

    res.status(201).json({ message: 'Registered. Now complete your profile.', id: user.id, email: user.email, role: user.role });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : null });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    setAccessToken(res, user);
    await setRefreshToken(res, user);

    res.status(200).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(500).json({ message });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.id) {
      await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
    }
    clearAuthCookies(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    res.status(500).json({ message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, role: true, createdAt: true, avatar: true,
        faculty: true,
        student: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    res.status(500).json({ message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, role } = req.body;

    if (!id || !role) {
      res.status(400).json({ message: 'id and role are required' });
      return;
    }

    if (role === 'admin') {
      const existingAdmin = await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true } });
      if (existingAdmin && existingAdmin.id !== Number(id)) {
        res.status(409).json({ message: 'An admin already exists. Only one admin account is allowed.' });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    res.status(200).json({ message: 'Role updated successfully', user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update role';
    res.status(500).json({ message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    res.status(500).json({ message });
  }
};
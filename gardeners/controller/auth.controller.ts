import { Request, Response } from "express";
import prisma from "../config/prisma-client.ts";
import crypto from "crypto";

const hashPassword = (password: string) => {
  return crypto.pbkdf2Sync(password, 'mionchoillte-salt', 10000, 64, 'sha512').toString('hex');
};

const comparePassword = (password: string, hashedPassword: string) => {
  const hash = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashedPassword));
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });
    const user = await prisma.user.create({ data: { email, username, password: hashPassword(password), role } });
    res.status(201).json({ message: "User registered", user });
  } catch (error) { res.status(500).json({ error: "Registration failed" }); }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !comparePassword(password, user.password)) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ message: "Login successful", user });
  } catch (error) { res.status(500).json({ error: "Login failed" }); }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: "Logged out successfully" });
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { botanist: true, apprentice: true } });
    res.json(user);
  } catch (error) { res.status(500).json({ error: "Failed to get profile" }); }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    const user = await prisma.user.update({ where: { id: Number(userId) }, data: { role } });
    res.json({ message: "Role updated", user });
  } catch (error) { res.status(500).json({ error: "Failed to update role" }); }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await prisma.user.delete({ where: { id: Number(userId) } });
    res.json({ message: "User deleted" });
  } catch (error) { res.status(500).json({ error: "Failed to delete user" }); }
};

export const completeProfile = async (req: any, res: Response) => {
  try {
    const { Fname, Lname, age, gender, Expertise, Subjects } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user?.role === 'botanist') {
      await prisma.botanist.create({ data: { userId: Number(req.user.id), email: user.email, Fname, Lname, age, gender, Expertise: Expertise as any } as any });
    } else if (user?.role === 'apprentice') {
      await prisma.apprentice.create({ data: { userId: Number(req.user.id), email: user.email, Fname, Lname, age, gender, Subjects: Subjects as any } as any });
    }
    res.json({ message: "Profile completed" });
  } catch (error) { res.status(500).json({ error: "Failed to complete profile" }); }
};

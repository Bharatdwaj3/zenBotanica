import prisma from '../config/prisma-client.ts';
import type { Request, Response } from 'express';

// Internal-only: returns just enough info for another service to send an
// email or display a name — never returns password/refreshToken/etc.
export const getUserContact = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, email: true, username: true },
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user contact info';
    res.status(500).json({ message });
  }
};

// Internal-only: same as getUserContact, but looked up by email instead of id.
// Used by other services' seed scripts to resolve a real userId.
export const getUserByEmail = async (req: Request<{ email: string }>, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email },
      select: { id: true, email: true, username: true },
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user by email';
    res.status(500).json({ message });
  }
};

// Internal-only: bulk lookup for a list of userIds, returning just enough for
// grouping/display (role + name from whichever profile table applies) —
// used by circulation to label loans with the borrower's role and name.
export const getUsersByIds = async (req: Request, res: Response): Promise<void> => {
  try {
    const idsParam = req.query.ids as string | undefined;
    if (!idsParam) {
      res.status(400).json({ message: 'ids query param is required' });
      return;
    }
    const ids = idsParam
      .split(',')
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        email: true,
        role: true,
        faculty: { select: { Fname: true, Lname: true } },
        student: { select: { Fname: true, Lname: true } },
      },
    });

    const result = users.map((u) => {
      const profile = u.faculty || u.student;
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        Fname: profile?.Fname ?? null,
        Lname: profile?.Lname ?? null,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users by ids';
    res.status(500).json({ message });
  }
};

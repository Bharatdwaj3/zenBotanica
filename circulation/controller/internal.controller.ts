import prisma from '../config/prisma-client.ts';
import type { Request, Response } from 'express';
import { attemptBorrow } from './loan.controller.ts';

// Returns borrow counts per book. Optionally scoped to the last N days
// (e.g. ?days=7 for "trending this week") via the borrowedAt timestamp.
// With no `days` param, counts across all-time loan history.
export const getLoanCounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = req.query.days ? Number(req.query.days) : null;
    const where = days
      ? { borrowedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } }
      : {};

    const counts = await prisma.loan.groupBy({
      by: ['bookId'],
      where,
      _count: { bookId: true },
      orderBy: { _count: { bookId: 'desc' } },
    });

    const result = counts.map((c) => ({
      bookId: c.bookId,
      count: c._count.bookId,
    }));

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch loan counts';
    res.status(500).json({ message });
  }
};

// Called by catalog's cart checkout — borrows one book on behalf of a user, using the same
// caps (active-loan limit, fine threshold, role-based block) as the public borrowBook route.
// userId/role are passed in the body since there's no real user session on an internal call.
export const internalBorrow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role, bookId } = req.body;
    if (!userId || !role || !bookId) {
      res.status(400).json({ message: 'userId, role, and bookId are required' });
      return;
    }
    const result = await attemptBorrow(Number(userId), role, Number(bookId));
    res.status(result.status).json(result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to borrow book';
    res.status(500).json({ message });
  }
};

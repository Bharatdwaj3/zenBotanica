import prisma from '../config/prisma-client.ts';
import type { Request, Response } from 'express';
import { attemptBorrow } from './session.controller.ts';

// Returns tending counts per specimen. Optionally scoped to the last N days
// (e.g. ?days=7 for "trending this week") via the borrowedAt timestamp.
// With no `days` param, counts across all-time session history.
export const getSessionCounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = req.query.days ? Number(req.query.days) : null;
    const where = days
      ? { borrowedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } }
      : {};

    const counts = await prisma.loan.groupBy({
      by: ['specimenId'],
      where,
      _count: { specimenId: true },
      orderBy: { _count: { specimenId: 'desc' } },
    });

    const result = counts.map((c) => ({
      specimenId: c.specimenId,
      count: c._count.specimenId,
    }));

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch session counts';
    res.status(500).json({ message });
  }
};

// Called by grove's cart checkout — tends one specimen on behalf of a user, using the same
// caps (active-session limit, penalty threshold, role-based block) as the public borrowBook route.
// userId/role are passed in the body since there's no real user session on an internal call.
export const internalBorrow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role, specimenId } = req.body;
    if (!userId || !role || !specimenId) {
      res.status(400).json({ message: 'userId, role, and specimenId are required' });
      return;
    }
    const result = await attemptBorrow(Number(userId), role, Number(specimenId));
    res.status(result.status).json(result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to tend specimen';
    res.status(500).json({ message });
  }
};

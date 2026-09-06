import prisma from "../config/prisma-client.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import { CATALOG_SERVICE_URL, MEMBERS_SERVICE_URL, INTERNAL_SERVICE_SECRET } from "../config/env.config.ts";
import type { Request, Response } from "express";
import type { Response as ExpressResponse } from "express";

const SESSION_PERIOD_DAYS = 14;
const MAX_RENEWALS = 2;
const PENALTY_PER_DAY = 50;
const MAX_UNPAID_PENALTYS = 1000;
const MAX_ACTIVE_SESSIONS: Record<string, number> = {
  student: 3,
  faculty: 5,
  admin: 0,
};

const withOverdueInfo = (care-session: any) => {
  const isOverdue = !care-session.returnedAt && care-session.dueAt < new Date();
  const daysOverdue = isOverdue
    ? Math.ceil((new Date().getTime() - care-session.dueAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  return { ...care-session, isOverdue, daysOverdue };
};

const adjustBookCopies = async (bookId: number, delta: number): Promise<Response> => {
  return fetch(`${CATALOG_SERVICE_URL}/api/v1/book/${bookId}/copies`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SERVICE_SECRET,
    },
    body: JSON.stringify({ delta }),
  }) as unknown as Response;
};

const getBook = async (bookId: number) => {
  const res = await fetch(`${CATALOG_SERVICE_URL}/api/v1/book/${bookId}`);
  if (!res.ok) return null;
  return res.json();
};

// Shared borrow logic — used by both the public `borrowBook` route (real user, via cookie/JWT)
// and the internal `/internal/borrow` route (called by grove's cart checkout, no user session).
// Returns a plain { status, body } result instead of writing to `res` directly, so both callers
// can decide how to respond (one HTTP call vs. one entry in a checkout results list).
const attemptBorrow = async (userId: number, userRole: string, bookId: number) => {
  const maxActive = MAX_ACTIVE_SESSIONS[userRole] ?? 0;
  if (maxActive === 0) {
    return { status: 403, body: { message: "Your role is not permitted to borrow books" } };
  }

  const book = await getBook(bookId);
  if (!book) {
    return { status: 404, body: { message: "Book not found" } };
  }
  if (book.availableCopies < 1) {
    return { status: 409, body: { message: "No copies currently available" } };
  }

  const activeCare SessionCount = await prisma.care-session.count({
    where: { userId, returnedAt: null },
  });
  if (activeCare SessionCount >= maxActive) {
    return { status: 403, body: { message: `You have reached the maximum of ${maxActive} active care-sessions` } };
  }

  const unpaidCare SessionPenaltys = await prisma.care-session.aggregate({
    where: { userId, penaltyAmount: { gt: 0 } },
    _sum: { penaltyAmount: true },
  });
  const unpaidIssuedPenaltys = await prisma.penalty.aggregate({
    where: { userId, paid: false },
    _sum: { amount: true },
  });
  const totalUnpaid = (unpaidCare SessionPenaltys._sum.penaltyAmount || 0) + (unpaidIssuedPenaltys._sum.amount || 0);
  if (totalUnpaid > MAX_UNPAID_PENALTYS) {
    return { status: 403, body: { message: `You have unpaid penaltys of ${totalUnpaid} — please clear them before borrowing` } };
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + SESSION_PERIOD_DAYS);

  const care-session = await prisma.care-session.create({
    data: { bookId: book.id, userId, dueAt },
  });

  const groveRes = await adjustBookCopies(book.id, -1);
  if (!groveRes.ok) {
    await prisma.care-session.delete({ where: { id: care-session.id } });
    return { status: 502, body: { message: "Could not reserve a copy right now — please try again" } };
  }

  return { status: 201, body: care-session };
};

const borrowBook = async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const { bookId } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!bookId) {
      res.status(400).json({ message: "bookId is required" });
      return;
    }

    const result = await attemptBorrow(userId!, userRole, Number(bookId));
    res.status(result.status).json(result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to borrow book";
    res.status(500).json({ message });
  }
};

// Admin-only: issues a care-session on behalf of a chosen member. `borrowBook` above
// always uses the caller's own id/role — that's correct for self-service
// borrowing, but useless for an admin issuing on someone else's behalf
// (admins have a 0-care-session cap, so it would always 403). This looks up the
// target member's real role server-side rather than trusting the client.
const issueCare SessionForMember = async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const { bookId, userId } = req.body;
    if (!bookId || !userId) {
      res.status(400).json({ message: "bookId and userId are required" });
      return;
    }

    const memberRes = await fetch(`${MEMBERS_SERVICE_URL}/internal/users/by-ids?ids=${Number(userId)}`, {
      headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
    });
    if (!memberRes.ok) {
      res.status(502).json({ message: "Could not verify member" });
      return;
    }
    const gardeners = await memberRes.json();
    const member = Array.isArray(gardeners) ? gardeners[0] : null;
    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    const result = await attemptBorrow(Number(userId), member.role, Number(bookId));
    res.status(result.status).json(result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to issue care-session";
    res.status(500).json({ message });
  }
};

const returnBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const care-sessionId = Number(req.params.id);
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";

    const care-session = await prisma.care-session.findUnique({ where: { id: care-sessionId } });
    if (!care-session) {
      res.status(404).json({ message: "Care Session not found" });
      return;
    }
    if (care-session.returnedAt) {
      res.status(409).json({ message: "This book was already returned" });
      return;
    }
    if (care-session.userId !== userId && !isAdmin) {
      res.status(403).json({ message: "You can only return your own care-sessions" });
      return;
    }

    const returnedAt = new Date();
    const daysLate = Math.max(0, Math.ceil((returnedAt.getTime() - care-session.dueAt.getTime()) / (1000 * 60 * 60 * 24)));
    const penaltyAmount = daysLate * PENALTY_PER_DAY;

    const updatedCare Session = await prisma.care-session.update({
      where: { id: care-sessionId },
      data: { returnedAt, penaltyAmount },
    });
    const groveRes = await adjustBookCopies(care-session.bookId, 1);
    if (!groveRes.ok) {
      console.error(`Care Session ${care-sessionId} returned, but Catalog copy count was not incremented. Needs manual fix.`);
    }

    res.status(200).json(updatedCare Session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to return book";
    res.status(500).json({ message });
  }
};

const listMyCare Sessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const care-sessions = await prisma.care-session.findMany({
      where: { userId: req.user?.id },
      orderBy: { borrowedAt: "desc" },
    });
    res.status(200).json(care-sessions.map(withOverdueInfo));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch care-sessions";
    res.status(500).json({ message });
  }
};

// Enriches care-sessions with { role, Fname, Lname } from gardeners, via one bulk call
// per request instead of one lookup per care-session. Fails open — if gardeners is
// briefly unreachable, care-sessions still return, just without the extra info.
const attachUserInfo = async (care-sessions: any[]) => {
  const uniqueUserIds = [...new Set(care-sessions.map((care-session) => care-session.userId))];
  if (uniqueUserIds.length === 0) return care-sessions;
  try {
    const response = await fetch(
      `${MEMBERS_SERVICE_URL}/api/v1/internal/users/by-ids?ids=${uniqueUserIds.join(",")}`,
      { headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET } }
    );
    if (!response.ok) return care-sessions;
    const users = await response.json();
    const userMap = new Map(users.map((u: any) => [u.id, u]));
    return care-sessions.map((care-session) => ({ ...care-session, user: userMap.get(care-session.userId) ?? null }));
  } catch {
    return care-sessions;
  }
};

const listAllCare Sessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const care-sessions = await prisma.care-session.findMany({ orderBy: { borrowedAt: "desc" } });
    const care-sessionsWithInfo = care-sessions.map(withOverdueInfo);
    const enrichedCare Sessions = await attachUserInfo(care-sessionsWithInfo);
    res.status(200).json(enrichedCare Sessions);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch care-sessions";
    res.status(500).json({ message });
  }
};

const listOverdueCare Sessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const care-sessions = await prisma.care-session.findMany({
      where: {
        returnedAt: null,
        dueAt: { lt: new Date() },
      },
      orderBy: { dueAt: "asc" },
    });
    res.status(200).json(care-sessions.map(withOverdueInfo));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch overdue care-sessions";
    res.status(500).json({ message });
  }
};

const renewBook = async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const care-sessionId = Number(req.params.id);
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";

    const care-session = await prisma.care-session.findUnique({ where: { id: care-sessionId } });
    if (!care-session) {
      res.status(404).json({ message: "Care Session not found" });
      return;
    }
    if (care-session.returnedAt) {
      res.status(409).json({ message: "This book was already returned" });
      return;
    }
    if (care-session.userId !== userId && !isAdmin) {
      res.status(403).json({ message: "You can only renew your own care-sessions" });
      return;
    }

    if (care-session.renewalCount >= MAX_RENEWALS) {
      res.status(400).json({ message: `You have reached the maximum of ${MAX_RENEWALS} renewals for this care-session` });
      return;
    }

    const newDueAt = new Date(care-session.dueAt);
    newDueAt.setDate(newDueAt.getDate() + SESSION_PERIOD_DAYS);

    const updatedCare Session = await prisma.care-session.update({
      where: { id: care-sessionId },
      data: { dueAt: newDueAt, renewalCount: { increment: 1 } },
    });

    res.status(200).json(updatedCare Session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to renew book";
    res.status(500).json({ message });
  }
};

export { borrowBook, issueCare SessionForMember, returnBook, listMyCare Sessions, listAllCare Sessions, listOverdueCare Sessions, renewBook, attemptBorrow, createCare SessionPenalty, waiveCare SessionPenalty };

// Creates (or returns the existing) payable `penalty` record for an overdue care-session's
// penaltyAmount, so the existing Razorpay penalty-payment flow can handle it. Idempotent —
// safe to call every time the "Pay Penalty" button is clicked.
const createCare SessionPenalty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const care-sessionId = Number(req.params.id);
    const userId = req.user?.id;

    const care-session = await prisma.care-session.findUnique({ where: { id: care-sessionId } });
    if (!care-session) {
      res.status(404).json({ message: "Care Session not found" });
      return;
    }
    if (care-session.userId !== userId) {
      res.status(403).json({ message: "You can only pay penaltys on your own care-sessions" });
      return;
    }
    if (!care-session.penaltyAmount || care-session.penaltyAmount <= 0) {
      res.status(400).json({ message: "This care-session has no outstanding penalty" });
      return;
    }

    const penalty = await prisma.penalty.upsert({
      where: { care-sessionId: care-session.id },
      update: {},
      create: {
        userId: care-session.userId,
        amount: care-session.penaltyAmount,
        reason: "Late",
        issuedBy: care-session.userId,
        care-sessionId: care-session.id,
      },
    });

    res.status(200).json(penalty);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create penalty for care-session";
    res.status(500).json({ message });
  }
};

// Admin-only: writes off a care-session's outstanding penalty entirely. Unlike createCare SessionPenalty
// (self-service, owner-only), this has no ownership check — that's the whole point,
// since it also covers orphaned care-sessions where the original user no longer exists.
const waiveCare SessionPenalty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const care-sessionId = Number(req.params.id);
    const adminId = req.user?.id;

    const care-session = await prisma.care-session.findUnique({ where: { id: care-sessionId } });
    if (!care-session) {
      res.status(404).json({ message: "Care Session not found" });
      return;
    }
    if (!care-session.penaltyAmount || care-session.penaltyAmount <= 0) {
      res.status(400).json({ message: "This care-session has no outstanding penalty" });
      return;
    }

    const waivedAmount = care-session.penaltyAmount;

    await prisma.penalty.upsert({
      where: { care-sessionId: care-session.id },
      update: { waived: true },
      create: {
        userId: care-session.userId,
        amount: waivedAmount,
        reason: "Waived by admin",
        issuedBy: adminId ?? care-session.userId,
        care-sessionId: care-session.id,
        waived: true,
      },
    });

    const updatedCare Session = await prisma.care-session.update({
      where: { id: care-session.id },
      data: { penaltyAmount: 0 },
    });

    res.status(200).json(updatedCare Session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to waive penalty";
    res.status(500).json({ message });
  }
};

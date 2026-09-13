import prisma from "../config/prisma-client.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import { GROVE_SERVICE_URL, GARDENERS_SERVICE_URL, INTERNAL_SERVICE_SECRET } from "../config/env.config.ts";
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

const withOverdueInfo = (careSession: any) => {
  const isOverdue = !careSession.returnedAt && careSession.dueAt < new Date();
  const daysOverdue = isOverdue
    ? Math.ceil((new Date().getTime() - careSession.dueAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  return { ...careSession, isOverdue, daysOverdue };
};

const adjustSpecimenCopies = async (specimenId: number, delta: number): Promise<Response> => {
  return fetch(`${GROVE_SERVICE_URL}/api/v1/specimen/${specimenId}/copies`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SERVICE_SECRET,
    },
    body: JSON.stringify({ delta }),
  }) as unknown as Response;
};

const getSpecimen = async (specimenId: number) => {
  const res = await fetch(`${GROVE_SERVICE_URL}/api/v1/specimen/${specimenId}`);
  if (!res.ok) return null;
  return res.json();
};

// Shared borrow logic — used by both the public `borrowBook` route (real user, via cookie/JWT)
// and the internal `/internal/borrow` route (called by grove's cart checkout, no user session).
// Returns a plain { status, body } result instead of writing to `res` directly, so both callers
// can decide how to respond (one HTTP call vs. one entry in a checkout results list).
const attemptBorrow = async (userId: number, userRole: string, specimenId: number) => {
  const maxActive = MAX_ACTIVE_SESSIONS[userRole] ?? 0;
  if (maxActive === 0) {
    return { status: 403, body: { message: "Your role is not permitted to borrow books" } };
  }

  const specimen = await getSpecimen(specimenId);
  if (!specimen) {
    return { status: 404, body: { message: "Specimen not found" } };
  }
  if (specimen.availableCopies < 1) {
    return { status: 409, body: { message: "No copies currently available" } };
  }

  const activeCareSessionCount = await prisma.loan.count({
    where: { userId, returnedAt: null },
  });
  if (activeCareSessionCount >= maxActive) {
    return { status: 403, body: { message: `You have reached the maximum of ${maxActive} active careSessions` } };
  }

  const unpaidCareSessionPenaltys = await prisma.loan.aggregate({
    where: { userId, fineAmount: { gt: 0 } },
    _sum: { fineAmount: true },
  });
  const unpaidIssuedPenaltys = await prisma.fine.aggregate({
    where: { userId, paid: false },
    _sum: { amount: true },
  });
  const totalUnpaid = (unpaidCareSessionPenaltys._sum.fineAmount || 0) + (unpaidIssuedPenaltys._sum.amount || 0);
  if (totalUnpaid > MAX_UNPAID_PENALTYS) {
    return { status: 403, body: { message: `You have unpaid penaltys of ${totalUnpaid} — please clear them before borrowing` } };
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + SESSION_PERIOD_DAYS);

  const careSession = await prisma.loan.create({
    data: { specimenId: specimen.id, userId, dueAt },
  });

  const groveRes = await adjustSpecimenCopies(specimen.id, -1);
  if (!(groveRes as any).ok) {
    await prisma.loan.delete({ where: { id: careSession.id } });
    return { status: 502, body: { message: "Could not reserve a copy right now — please try again" } };
  }

  return { status: 201, body: careSession };
};

const borrowBook = async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const { specimenId } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!specimenId) {
      res.status(400).json({ message: "specimenId is required" });
      return;
    }

    const result = await attemptBorrow(userId!, userRole, Number(specimenId));
    res.status(result.status).json(result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to tend specimen";
    res.status(500).json({ message });
  }
};

// Admin-only: issues a careSession on behalf of a chosen member. `borrowBook` above
// always uses the caller's own id/role — that's correct for self-service
// borrowing, but useless for an admin issuing on someone else's behalf
// (admins have a 0-careSession cap, so it would always 403). This looks up the
// target member's real role server-side rather than trusting the client.
const issueCareSessionForMember = async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const { specimenId, userId } = req.body;
    if (!specimenId || !userId) {
      res.status(400).json({ message: "specimenId and userId are required" });
      return;
    }

    const memberRes = await fetch(`${GARDENERS_SERVICE_URL}/api/v1/internal/users/by-ids?ids=${Number(userId)}`, {
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

    const result = await attemptBorrow(Number(userId), member.role, Number(specimenId));
    res.status(result.status).json(result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to issue careSession";
    res.status(500).json({ message });
  }
};

const returnBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loanId = Number(req.params.id);
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";

    const careSession = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!careSession) {
      res.status(404).json({ message: "CareSession not found" });
      return;
    }
    if (careSession.returnedAt) {
      res.status(409).json({ message: "This specimen was already returned" });
      return;
    }
    if (careSession.userId !== userId && !isAdmin) {
      res.status(403).json({ message: "You can only return your own careSessions" });
      return;
    }

    const returnedAt = new Date();
    const daysLate = Math.max(0, Math.ceil((returnedAt.getTime() - careSession.dueAt.getTime()) / (1000 * 60 * 60 * 24)));
    const fineAmount = daysLate * PENALTY_PER_DAY;

    const updatedCareSession = await prisma.loan.update({
      where: { id: loanId },
      data: { returnedAt, fineAmount },
    });
    const groveRes = await adjustSpecimenCopies(careSession.specimenId, 1);
    if (!(groveRes as any).ok) {
      console.error(`CareSession ${loanId} returned, but Catalog copy count was not incremented. Needs manual fix.`);
    }

    res.status(200).json(updatedCareSession);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to return specimen";
    res.status(500).json({ message });
  }
};

const listMyCareSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const careSessions = await prisma.loan.findMany({
      where: { userId: req.user?.id },
      orderBy: { borrowedAt: "desc" },
    });
    res.status(200).json(careSessions.map(withOverdueInfo));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch careSessions";
    res.status(500).json({ message });
  }
};

// Enriches careSessions with { role, Fname, Lname } from gardeners, via one bulk call
// per request instead of one lookup per careSession. Fails open — if gardeners is
// briefly unreachable, careSessions still return, just without the extra info.
const attachUserInfo = async (careSessions: any[]) => {
  const uniqueUserIds = [...new Set(careSessions.map((careSession) => careSession.userId))];
  if (uniqueUserIds.length === 0) return careSessions;
  try {
    const response = await fetch(
      `${GARDENERS_SERVICE_URL}/api/v1/internal/users/by-ids?ids=${uniqueUserIds.join(",")}`,
      { headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET } }
    );
    if (!response.ok) return careSessions;
    const users = await response.json();
    const userMap = new Map(users.map((u: any) => [u.id, u]));
    return careSessions.map((careSession) => ({ ...careSession, user: userMap.get(careSession.userId) ?? null }));
  } catch {
    return careSessions;
  }
};

const listAllCareSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const careSessions = await prisma.loan.findMany({ orderBy: { borrowedAt: "desc" } });
    const careSessionsWithInfo = careSessions.map(withOverdueInfo);
    const enrichedCareSessions = await attachUserInfo(careSessionsWithInfo);
    res.status(200).json(enrichedCareSessions);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch careSessions";
    res.status(500).json({ message });
  }
};

const listOverdueCareSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const careSessions = await prisma.loan.findMany({
      where: {
        returnedAt: null,
        dueAt: { lt: new Date() },
      },
      orderBy: { dueAt: "asc" },
    });
    res.status(200).json(careSessions.map(withOverdueInfo));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch overdue careSessions";
    res.status(500).json({ message });
  }
};

const renewBook = async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const loanId = Number(req.params.id);
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";

    const careSession = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!careSession) {
      res.status(404).json({ message: "CareSession not found" });
      return;
    }
    if (careSession.returnedAt) {
      res.status(409).json({ message: "This specimen was already returned" });
      return;
    }
    if (careSession.userId !== userId && !isAdmin) {
      res.status(403).json({ message: "You can only renew your own careSessions" });
      return;
    }

    if (careSession.renewalCount >= MAX_RENEWALS) {
      res.status(400).json({ message: `You have reached the maximum of ${MAX_RENEWALS} renewals for this careSession` });
      return;
    }

    const newDueAt = new Date(careSession.dueAt);
    newDueAt.setDate(newDueAt.getDate() + SESSION_PERIOD_DAYS);

    const updatedCareSession = await prisma.loan.update({
      where: { id: loanId },
      data: { dueAt: newDueAt, renewalCount: { increment: 1 } },
    });

    res.status(200).json(updatedCareSession);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to renew specimen";
    res.status(500).json({ message });
  }
};

export { borrowBook, issueCareSessionForMember, returnBook, listMyCareSessions, listAllCareSessions, listOverdueCareSessions, renewBook, attemptBorrow, createCareSessionPenalty, waiveCareSessionPenalty };

// Creates (or returns the existing) payable `penalty` record for an overdue careSession's
// fineAmount, so the existing Razorpay penalty-payment flow can handle it. Idempotent —
// safe to call every time the "Pay Penalty" button is clicked.
const createCareSessionPenalty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loanId = Number(req.params.id);
    const userId = req.user?.id;

    const careSession = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!careSession) {
      res.status(404).json({ message: "CareSession not found" });
      return;
    }
    if (careSession.userId !== userId) {
      res.status(403).json({ message: "You can only pay penaltys on your own careSessions" });
      return;
    }
    if (!careSession.fineAmount || careSession.fineAmount <= 0) {
      res.status(400).json({ message: "This careSession has no outstanding penalty" });
      return;
    }

    const penalty = await prisma.fine.upsert({
      where: { loanId: careSession.id },
      update: {},
      create: {
        userId: careSession.userId,
        amount: careSession.fineAmount,
        reason: "Late",
        issuedBy: careSession.userId,
        loanId: careSession.id,
      },
    });

    res.status(200).json(penalty);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create penalty for careSession";
    res.status(500).json({ message });
  }
};

// Admin-only: writes off a careSession's outstanding penalty entirely. Unlike createCareSessionPenalty
// (self-service, owner-only), this has no ownership check — that's the whole point,
// since it also covers orphaned careSessions where the original user no longer exists.
const waiveCareSessionPenalty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loanId = Number(req.params.id);
    const adminId = req.user?.id;

    const careSession = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!careSession) {
      res.status(404).json({ message: "CareSession not found" });
      return;
    }
    if (!careSession.fineAmount || careSession.fineAmount <= 0) {
      res.status(400).json({ message: "This careSession has no outstanding penalty" });
      return;
    }

    const waivedAmount = careSession.fineAmount;

    await prisma.fine.upsert({
      where: { loanId: careSession.id },
      update: { waived: true },
      create: {
        userId: careSession.userId,
        amount: waivedAmount,
        reason: "Waived by admin",
        issuedBy: adminId ?? careSession.userId,
        loanId: careSession.id,
        waived: true,
      },
    });

    const updatedCareSession = await prisma.loan.update({
      where: { id: careSession.id },
      data: { fineAmount: 0 },
    });

    res.status(200).json(updatedCareSession);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to waive penalty";
    res.status(500).json({ message });
  }
};

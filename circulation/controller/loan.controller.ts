import prisma from "../config/prisma-client.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import { CATALOG_SERVICE_URL, MEMBERS_SERVICE_URL, INTERNAL_SERVICE_SECRET } from "../config/env.config.ts";
import type { Request, Response } from "express";
import type { Response as ExpressResponse } from "express";

const LOAN_PERIOD_DAYS = 14;
const MAX_RENEWALS = 2;
const FINE_PER_DAY = 50;
const MAX_UNPAID_FINES = 1000;
const MAX_ACTIVE_LOANS: Record<string, number> = {
  student: 3,
  faculty: 5,
  admin: 0,
};

const withOverdueInfo = (loan: any) => {
  const isOverdue = !loan.returnedAt && loan.dueAt < new Date();
  const daysOverdue = isOverdue
    ? Math.ceil((new Date().getTime() - loan.dueAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  return { ...loan, isOverdue, daysOverdue };
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
// and the internal `/internal/borrow` route (called by catalog's cart checkout, no user session).
// Returns a plain { status, body } result instead of writing to `res` directly, so both callers
// can decide how to respond (one HTTP call vs. one entry in a checkout results list).
const attemptBorrow = async (userId: number, userRole: string, bookId: number) => {
  const maxActive = MAX_ACTIVE_LOANS[userRole] ?? 0;
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

  const activeLoanCount = await prisma.loan.count({
    where: { userId, returnedAt: null },
  });
  if (activeLoanCount >= maxActive) {
    return { status: 403, body: { message: `You have reached the maximum of ${maxActive} active loans` } };
  }

  const unpaidLoanFines = await prisma.loan.aggregate({
    where: { userId, fineAmount: { gt: 0 } },
    _sum: { fineAmount: true },
  });
  const unpaidIssuedFines = await prisma.fine.aggregate({
    where: { userId, paid: false },
    _sum: { amount: true },
  });
  const totalUnpaid = (unpaidLoanFines._sum.fineAmount || 0) + (unpaidIssuedFines._sum.amount || 0);
  if (totalUnpaid > MAX_UNPAID_FINES) {
    return { status: 403, body: { message: `You have unpaid fines of ${totalUnpaid} — please clear them before borrowing` } };
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + LOAN_PERIOD_DAYS);

  const loan = await prisma.loan.create({
    data: { bookId: book.id, userId, dueAt },
  });

  const catalogRes = await adjustBookCopies(book.id, -1);
  if (!catalogRes.ok) {
    await prisma.loan.delete({ where: { id: loan.id } });
    return { status: 502, body: { message: "Could not reserve a copy right now — please try again" } };
  }

  return { status: 201, body: loan };
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

// Admin-only: issues a loan on behalf of a chosen member. `borrowBook` above
// always uses the caller's own id/role — that's correct for self-service
// borrowing, but useless for an admin issuing on someone else's behalf
// (admins have a 0-loan cap, so it would always 403). This looks up the
// target member's real role server-side rather than trusting the client.
const issueLoanForMember = async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
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
    const members = await memberRes.json();
    const member = Array.isArray(members) ? members[0] : null;
    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    const result = await attemptBorrow(Number(userId), member.role, Number(bookId));
    res.status(result.status).json(result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to issue loan";
    res.status(500).json({ message });
  }
};

const returnBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loanId = Number(req.params.id);
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";

    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    if (loan.returnedAt) {
      res.status(409).json({ message: "This book was already returned" });
      return;
    }
    if (loan.userId !== userId && !isAdmin) {
      res.status(403).json({ message: "You can only return your own loans" });
      return;
    }

    const returnedAt = new Date();
    const daysLate = Math.max(0, Math.ceil((returnedAt.getTime() - loan.dueAt.getTime()) / (1000 * 60 * 60 * 24)));
    const fineAmount = daysLate * FINE_PER_DAY;

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: { returnedAt, fineAmount },
    });
    const catalogRes = await adjustBookCopies(loan.bookId, 1);
    if (!catalogRes.ok) {
      console.error(`Loan ${loanId} returned, but Catalog copy count was not incremented. Needs manual fix.`);
    }

    res.status(200).json(updatedLoan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to return book";
    res.status(500).json({ message });
  }
};

const listMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.user?.id },
      orderBy: { borrowedAt: "desc" },
    });
    res.status(200).json(loans.map(withOverdueInfo));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch loans";
    res.status(500).json({ message });
  }
};

// Enriches loans with { role, Fname, Lname } from members, via one bulk call
// per request instead of one lookup per loan. Fails open — if members is
// briefly unreachable, loans still return, just without the extra info.
const attachUserInfo = async (loans: any[]) => {
  const uniqueUserIds = [...new Set(loans.map((loan) => loan.userId))];
  if (uniqueUserIds.length === 0) return loans;
  try {
    const response = await fetch(
      `${MEMBERS_SERVICE_URL}/api/v1/internal/users/by-ids?ids=${uniqueUserIds.join(",")}`,
      { headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET } }
    );
    if (!response.ok) return loans;
    const users = await response.json();
    const userMap = new Map(users.map((u: any) => [u.id, u]));
    return loans.map((loan) => ({ ...loan, user: userMap.get(loan.userId) ?? null }));
  } catch {
    return loans;
  }
};

const listAllLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await prisma.loan.findMany({ orderBy: { borrowedAt: "desc" } });
    const loansWithInfo = loans.map(withOverdueInfo);
    const enrichedLoans = await attachUserInfo(loansWithInfo);
    res.status(200).json(enrichedLoans);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch loans";
    res.status(500).json({ message });
  }
};

const listOverdueLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await prisma.loan.findMany({
      where: {
        returnedAt: null,
        dueAt: { lt: new Date() },
      },
      orderBy: { dueAt: "asc" },
    });
    res.status(200).json(loans.map(withOverdueInfo));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch overdue loans";
    res.status(500).json({ message });
  }
};

const renewBook = async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const loanId = Number(req.params.id);
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";

    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    if (loan.returnedAt) {
      res.status(409).json({ message: "This book was already returned" });
      return;
    }
    if (loan.userId !== userId && !isAdmin) {
      res.status(403).json({ message: "You can only renew your own loans" });
      return;
    }

    if (loan.renewalCount >= MAX_RENEWALS) {
      res.status(400).json({ message: `You have reached the maximum of ${MAX_RENEWALS} renewals for this loan` });
      return;
    }

    const newDueAt = new Date(loan.dueAt);
    newDueAt.setDate(newDueAt.getDate() + LOAN_PERIOD_DAYS);

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: { dueAt: newDueAt, renewalCount: { increment: 1 } },
    });

    res.status(200).json(updatedLoan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to renew book";
    res.status(500).json({ message });
  }
};

export { borrowBook, issueLoanForMember, returnBook, listMyLoans, listAllLoans, listOverdueLoans, renewBook, attemptBorrow, createLoanFine, waiveLoanFine };

// Creates (or returns the existing) payable `fine` record for an overdue loan's
// fineAmount, so the existing Razorpay fine-payment flow can handle it. Idempotent —
// safe to call every time the "Pay Fine" button is clicked.
const createLoanFine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loanId = Number(req.params.id);
    const userId = req.user?.id;

    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    if (loan.userId !== userId) {
      res.status(403).json({ message: "You can only pay fines on your own loans" });
      return;
    }
    if (!loan.fineAmount || loan.fineAmount <= 0) {
      res.status(400).json({ message: "This loan has no outstanding fine" });
      return;
    }

    const fine = await prisma.fine.upsert({
      where: { loanId: loan.id },
      update: {},
      create: {
        userId: loan.userId,
        amount: loan.fineAmount,
        reason: "Late",
        issuedBy: loan.userId,
        loanId: loan.id,
      },
    });

    res.status(200).json(fine);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create fine for loan";
    res.status(500).json({ message });
  }
};

// Admin-only: writes off a loan's outstanding fine entirely. Unlike createLoanFine
// (self-service, owner-only), this has no ownership check — that's the whole point,
// since it also covers orphaned loans where the original user no longer exists.
const waiveLoanFine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loanId = Number(req.params.id);
    const adminId = req.user?.id;

    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    if (!loan.fineAmount || loan.fineAmount <= 0) {
      res.status(400).json({ message: "This loan has no outstanding fine" });
      return;
    }

    const waivedAmount = loan.fineAmount;

    await prisma.fine.upsert({
      where: { loanId: loan.id },
      update: { waived: true },
      create: {
        userId: loan.userId,
        amount: waivedAmount,
        reason: "Waived by admin",
        issuedBy: adminId ?? loan.userId,
        loanId: loan.id,
        waived: true,
      },
    });

    const updatedLoan = await prisma.loan.update({
      where: { id: loan.id },
      data: { fineAmount: 0 },
    });

    res.status(200).json(updatedLoan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to waive fine";
    res.status(500).json({ message });
  }
};

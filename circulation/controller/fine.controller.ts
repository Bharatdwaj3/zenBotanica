import prisma from "../config/prisma-client.ts";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import Razorpay from "razorpay";
import crypto from "crypto";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../config/env.config.ts";

const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

// Fixed-amount presets. "Late" is handled separately since it's computed from `days`.
const FINE_PRESETS: Record<string, number> = {
  Damaged: 300,
  Lost: 700,
};
const LATE_FINE_PER_DAY = 50;

const issueFine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, reason, days } = req.body;
    const issuedBy = req.user?.id;

    if (!userId || !reason) {
      res.status(400).json({ message: "userId and reason are required" });
      return;
    }

    let amount: number;
    if (reason === "Late") {
      if (!days || days <= 0) {
        res.status(400).json({ message: "days is required and must be greater than 0 for a Late fine" });
        return;
      }
      amount = LATE_FINE_PER_DAY * days;
    } else if (reason in FINE_PRESETS) {
      amount = FINE_PRESETS[reason];
    } else {
      res.status(400).json({ message: `reason must be one of: ${Object.keys(FINE_PRESETS).join(", ")}, Late` });
      return;
    }

    const fine = await prisma.fine.create({
      data: { userId, amount, reason, issuedBy: issuedBy! },
    });

    res.status(201).json(fine);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to issue fine";
    res.status(500).json({ message });
  }
};

// Lists the current user's own admin-issued fines (the `fine` table only —
// automatic late fees on loans are shown separately via /loan/mine).
const listMyFines = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fines = await prisma.fine.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(fines);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch fines";
    res.status(500).json({ message });
  }
};

// Creates a Razorpay order for one specific fine. Amount comes from the fine record itself
// (never trusted from the request body), so a user can't pay less than what's actually owed.
const createPayOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fineId = Number(req.params.id);
    const userId = req.user?.id;

    const fine = await prisma.fine.findUnique({ where: { id: fineId } });
    if (!fine) {
      res.status(404).json({ message: "Fine not found" });
      return;
    }
    if (fine.userId !== userId) {
      res.status(403).json({ message: "You can only pay your own fines" });
      return;
    }
    if (fine.paid) {
      res.status(409).json({ message: "This fine has already been paid" });
      return;
    }
    if (fine.waived) {
      res.status(409).json({ message: "This fine has been waived and cannot be paid" });
      return;
    }

    const order = await razorpay.orders.create({
      amount: fine.amount * 100, // Razorpay expects the amount in paise, not rupees
      currency: "INR",
      receipt: `fine_${fine.id}`,
    });

    res.status(200).json({ order, keyId: RAZORPAY_KEY_ID });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create payment order";
    res.status(500).json({ message });
  }
};

// Verifies Razorpay's payment signature (proves the payment genuinely came from Razorpay,
// not a spoofed request claiming success) before marking the fine as paid.
const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fineId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?.id;

    if (!fineId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ message: "fineId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required" });
      return;
    }

    const fine = await prisma.fine.findUnique({ where: { id: Number(fineId) } });
    if (!fine || fine.userId !== userId) {
      res.status(404).json({ message: "Fine not found" });
      return;
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ message: "Payment verification failed — signature mismatch" });
      return;
    }

    const updatedFine = await prisma.fine.update({
      where: { id: fine.id },
      data: { paid: true },
    });

    if (updatedFine.loanId) {
      await prisma.loan.update({
        where: { id: updatedFine.loanId },
        data: { fineAmount: 0 },
      });
    }

    res.status(200).json(updatedFine);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed";
    res.status(500).json({ message });
  }
};

export { issueFine, listMyFines, createPayOrder, verifyPayment };

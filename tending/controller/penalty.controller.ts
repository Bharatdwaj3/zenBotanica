import prisma from "../config/prisma-client.ts";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import Razorpay from "razorpay";
import crypto from "crypto";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../config/env.config.ts";

const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

// Fixed-amount presets. "Late" is handled separately since it's computed from `days`.
const PENALTY_PRESETS: Record<string, number> = {
  Damaged: 300,
  Lost: 700,
};
const LATE_PENALTY_PER_DAY = 50;

const issuePenalty = async (req: AuthRequest, res: Response): Promise<void> => {
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
        res.status(400).json({ message: "days is required and must be greater than 0 for a Late penalty" });
        return;
      }
      amount = LATE_PENALTY_PER_DAY * days;
    } else if (reason in PENALTY_PRESETS) {
      amount = PENALTY_PRESETS[reason];
    } else {
      res.status(400).json({ message: `reason must be one of: ${Object.keys(PENALTY_PRESETS).join(", ")}, Late` });
      return;
    }

    const penalty = await prisma.penalty.create({
      data: { userId, amount, reason, issuedBy: issuedBy! },
    });

    res.status(201).json(penalty);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to issue penalty";
    res.status(500).json({ message });
  }
};

// Lists the current user's own admin-issued penaltys (the `penalty` table only —
// automatic late fees on sessions are shown separately via /session/mine).
const listMyPenaltys = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const penaltys = await prisma.penalty.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(penaltys);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch penaltys";
    res.status(500).json({ message });
  }
};

// Creates a Razorpay order for one specific penalty. Amount comes from the penalty record itself
// (never trusted from the request body), so a user can't pay less than what's actually owed.
const createPayOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const penaltyId = Number(req.params.id);
    const userId = req.user?.id;

    const penalty = await prisma.penalty.findUnique({ where: { id: penaltyId } });
    if (!penalty) {
      res.status(404).json({ message: "Penalty not found" });
      return;
    }
    if (penalty.userId !== userId) {
      res.status(403).json({ message: "You can only pay your own penaltys" });
      return;
    }
    if (penalty.paid) {
      res.status(409).json({ message: "This penalty has already been paid" });
      return;
    }
    if (penalty.waived) {
      res.status(409).json({ message: "This penalty has been waived and cannot be paid" });
      return;
    }

    const order = await razorpay.orders.create({
      amount: penalty.amount * 100, // Razorpay expects the amount in paise, not rupees
      currency: "INR",
      receipt: `penalty_${penalty.id}`,
    });

    res.status(200).json({ order, keyId: RAZORPAY_KEY_ID });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create payment order";
    res.status(500).json({ message });
  }
};

// Verifies Razorpay's payment signature (proves the payment genuinely came from Razorpay,
// not a spoofed request claiming success) before marking the penalty as paid.
const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { penaltyId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?.id;

    if (!penaltyId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ message: "penaltyId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required" });
      return;
    }

    const penalty = await prisma.penalty.findUnique({ where: { id: Number(penaltyId) } });
    if (!penalty || penalty.userId !== userId) {
      res.status(404).json({ message: "Penalty not found" });
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

    const updatedPenalty = await prisma.penalty.update({
      where: { id: penalty.id },
      data: { paid: true },
    });

    if (updatedPenalty.sessionId) {
      await prisma.session.update({
        where: { id: updatedPenalty.sessionId },
        data: { penaltyAmount: 0 },
      });
    }

    res.status(200).json(updatedPenalty);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed";
    res.status(500).json({ message });
  }
};

export { issuePenalty, listMyPenaltys, createPayOrder, verifyPayment };

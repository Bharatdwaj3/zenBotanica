import prisma from "../config/prisma-client.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import type { Response } from "express";

export const reportViolation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { touristId, specimenId, type, fineAmount } = req.body;
    const reportedBy = req.user?.id;
    const violation = await prisma.violation.create({
      data: { touristId: Number(touristId), specimenId: specimenId ? Number(specimenId) : null, type, fineAmount: Number(fineAmount), reportedBy: Number(reportedBy) },
    });
    res.status(201).json(violation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to report violation";
    res.status(500).json({ message });
  }
};

export const payViolationFine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const violationId = Number(req.params.id);
    const userId = req.user?.id;
    const violation = await prisma.violation.findUnique({ where: { id: violationId } });
    if (!violation || violation.touristId !== userId) {
      res.status(403).json({ message: "Unauthorized to pay this fine" });
      return;
    }
    const updated = await prisma.violation.update({ where: { id: violationId }, data: { paid: true } });
    res.status(200).json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to pay fine";
    res.status(500).json({ message });
  }
};

export const listViolations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const violations = await prisma.violation.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(violations);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch violations";
    res.status(500).json({ message });
  }
};
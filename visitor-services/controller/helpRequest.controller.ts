import prisma from "../config/prisma-client.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import type { Response } from "express";

export const submitHelpRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const farmerId = req.user?.id;
    const request = await prisma.help_request.create({
      data: { farmerId: Number(farmerId), message },
    });
    res.status(201).json(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit help request";
    res.status(500).json({ message });
  }
};

export const listHelpRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await prisma.help_request.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(requests);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch help requests";
    res.status(500).json({ message });
  }
};

export const updateHelpRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestId = Number(req.params.id);
    const { status, assignedTo } = req.body;
    const updated = await prisma.help_request.update({
      where: { id: requestId },
      data: { status, assignedTo: assignedTo ? Number(assignedTo) : null },
    });
    res.status(200).json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update help request";
    res.status(500).json({ message });
  }
};
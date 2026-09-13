import prisma from "../config/prisma-client.ts";
import { GARDENERS_SERVICE_URL, INTERNAL_SERVICE_SECRET } from "../config/env.config.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import type { Response } from "express";

export const buyTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, durationHours } = req.body;
    const touristId = req.user?.role === 'tourist' ? req.user.id : null;

    let resolvedEmail = email;
    if (!resolvedEmail && touristId) {
      const userRes = await fetch(`${GARDENERS_SERVICE_URL}/api/v1/internal/users/by-ids?ids=${Number(touristId)}`, {
        headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
      });
      const users = await userRes.json();
      resolvedEmail = users[0]?.email ?? null;
    }

    if (!resolvedEmail) {
      res.status(400).json({ message: "email is required for guest purchases" });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (durationHours || 24));
    const ticket = await prisma.ticket.create({
      data: { touristId, email: resolvedEmail, expiresAt },
    });
    res.status(201).json(ticket);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to buy ticket";
    res.status(500).json({ message });
  }
};

export const listTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tickets = await prisma.ticket.findMany({ orderBy: { purchasedAt: 'desc' } });
    res.status(200).json(tickets);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tickets";
    res.status(500).json({ message });
  }
};
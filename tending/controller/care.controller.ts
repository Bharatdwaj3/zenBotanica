import prisma from "../config/prisma-client.ts";
import { GARDENERS_SERVICE_URL, INTERNAL_SERVICE_SECRET } from "../config/env.config.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import type { Response } from "express";

export const getCareTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const whereClause = userRole === 'curator' || userRole === 'botanist' 
      ? {} 
      : { caretakerId: userId };

    const tasks = await prisma.care_task.findMany({
      where: whereClause,
      orderBy: { nextDueAt: 'asc' },
    });
    
    res.status(200).json(tasks);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch care tasks";
    res.status(500).json({ message });
  }
};

export const completeCareTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = Number(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const task = await prisma.care_task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ message: "Care task not found" });
      return;
    }

    if (task.caretakerId !== userId && userRole !== 'curator') {
      res.status(403).json({ message: "You can only complete your own care tasks" });
      return;
    }

    const now = new Date();
    const nextDueAt = new Date(now);
    nextDueAt.setDate(nextDueAt.getDate() + task.intervalDays);

    const updatedTask = await prisma.care_task.update({
      where: { id: taskId },
      data: {
        lastCompletedAt: now,
        nextDueAt: nextDueAt,
      },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete care task";
    res.status(500).json({ message });
  }
};

export const reassignCareTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = Number(req.params.id);
    const { caretakerId } = req.body;

    if (!caretakerId) {
      res.status(400).json({ message: "caretakerId is required" });
      return;
    }

    const task = await prisma.care_task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ message: "Care task not found" });
      return;
    }

    const userRes = await fetch(`${GARDENERS_SERVICE_URL}/api/v1/internal/users/by-ids?ids=${Number(caretakerId)}`, {
      headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
    });
    const users = await userRes.json();
    const target = users[0];

    if (!target || target.role !== "caretaker") {
      res.status(400).json({ message: "caretakerId does not refer to a valid caretaker" });
      return;
    }

    const updatedTask = await prisma.care_task.update({
      where: { id: taskId },
      data: { caretakerId: Number(caretakerId) },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reassign care task";
    res.status(500).json({ message });
  }
};

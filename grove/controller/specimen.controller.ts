import prisma from "../config/prisma-client.ts";
import { CIRCULATION_SERVICE_URL, INTERNAL_SERVICE_SECRET } from '../config/env.config.ts';
import type { Response, Request } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.ts";

const listSpecimens = async (req: Request, res: Response): Promise<void> => {
  try {
    const specimens = await prisma.specimen.findMany({ where: { deletedAt: null } });
    res.status(200).json(specimens);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ message });
  }
};

const getSpecimen = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const specimen = await prisma.specimen.findUnique({ where: { id: Number(req.params.id) } });
    if (!specimen || specimen.deletedAt) {
      res.status(404).json({ message: "Specimen not found" });
      return;
    }
    res.status(200).json(specimen);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ message });
  }
};

const registerSpecimen = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, author, publisher, isbn, genre, totalCopies, coverUrl, pdfUrl, description } = req.body;

    if (!title || !author || !isbn) {
      res.status(400).json({ message: "title, author, and isbn are required" });
      return;
    }

    const copies = Number(totalCopies) || 1;

    const specimen = await prisma.specimen.create({
      data: {
        title, author, publisher, isbn, genre,
        description, totalCopies: copies,
        availableCopies: copies,
        coverUrl,
        pdfUrl,
        addedByUserId: req.user?.id,
      },
    });
    res.status(201).json(specimen);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "A specimen with this ISBN already exists" });
      return;
    }
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ message });
  }
};

const updateSpecimen = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { title, author, publisher, isbn, genre, totalCopies, coverUrl, pdfUrl, description } = req.body;
    const specimen = await prisma.specimen.update({
      where: { id: Number(req.params.id) },
      data: { title, author, publisher, isbn, genre, totalCopies, coverUrl, pdfUrl, description },
    });
    res.status(200).json(specimen);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ message });
  }
};

const removeSpecimen = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const specimen = await prisma.specimen.update({
      where: { id: Number(req.params.id) },
      data: { deletedAt: new Date() },
    });
    res.status(200).json(specimen);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ message });
  }
};

const adjustCopies = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { delta } = req.body; 
    const specimen = await prisma.specimen.update({
      where: { id: Number(req.params.id) },
      data: { availableCopies: { increment: Number(delta) } },
    });
    res.status(200).json(specimen);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to adjust copies";
    res.status(500).json({ message });
  }
};

const getNewArrivals = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;
    const specimens = await prisma.specimen.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    res.status(200).json(specimens);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch new arrivals";
    res.status(500).json({ message });
  }
};

const getSimilarSpecimens = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const specimenId = Number(req.params.id);
    const specimen = await prisma.specimen.findUnique({ where: { id: specimenId } });
    if (!specimen || specimen.deletedAt) {
      res.status(404).json({ message: "Specimen not found" });
      return;
    }

    const [byAuthor, byGenre] = await Promise.all([
      prisma.specimen.findMany({
        where: { author: specimen.author, id: { not: specimenId }, deletedAt: null },
        take: 6,
      }),
      prisma.specimen.findMany({
        where: { genre: { hasSome: specimen.genre }, id: { not: specimenId }, deletedAt: null },
        take: 6,
      }),
    ]);

    res.status(200).json({ byAuthor, byGenre });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch similar specimens";
    res.status(500).json({ message });
  }
};

const getTrending = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;
    const days = Number(req.query.days) || 7;
    const loanCountsRes = await fetch(`${CIRCULATION_SERVICE_URL}/api/v1/internal/loan-counts?days=${days}`, {
      headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
    });
    if (!loanCountsRes.ok) {
      res.status(502).json({ message: "Failed to reach tending service" });
      return;
    }
    const loanCounts: { specimenId: number; count: number }[] = await loanCountsRes.json();

    const topIds = loanCounts.slice(0, limit).map((lc) => lc.specimenId);
    if (topIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    const specimens = await prisma.specimen.findMany({
      where: { id: { in: topIds }, deletedAt: null },
    });

    const countBySpecimenId = new Map(loanCounts.map((lc) => [lc.specimenId, lc.count]));
    const sortedSpecimens = specimens
      .map((specimen) => ({ ...specimen, borrowCount: countBySpecimenId.get(specimen.id) || 0 }))
      .sort((a, b) => b.borrowCount - a.borrowCount);

    res.status(200).json(sortedSpecimens);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch trending specimens";
    res.status(500).json({ message });
  }
};

const bulkSetFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, featured } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "ids must be a non-empty array" });
      return;
    }
    if (typeof featured !== "boolean") {
      res.status(400).json({ message: "featured must be a boolean" });
      return;
    }

    const result = await prisma.specimen.updateMany({
      where: { id: { in: ids.map(Number) } },
      data: { featured },
    });

    res.status(200).json({ updated: result.count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update featured status";
    res.status(500).json({ message });
  }
};

const bulkSetWeeklyRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, weeklyRead } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "ids must be a non-empty array" });
      return;
    }
    if (typeof weeklyRead !== "boolean") {
      res.status(400).json({ message: "weeklyRead must be a boolean" });
      return;
    }
    const result = await prisma.specimen.updateMany({
      where: { id: { in: ids.map(Number) } },
      data: { weeklyRead },
    });
    res.status(200).json({ updated: result.count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update weekly read status";
    res.status(500).json({ message });
  }
};
const getFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const specimens = await prisma.specimen.findMany({
      where: { featured: true, deletedAt: null },
    });
    res.status(200).json(specimens);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch featured specimens";
    res.status(500).json({ message });
  }
};

export { listSpecimens, getSpecimen, registerSpecimen, updateSpecimen, removeSpecimen, adjustCopies, getNewArrivals, getSimilarSpecimens, getTrending, bulkSetFeatured, bulkSetWeeklyRead, getFeatured };
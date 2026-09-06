import prisma from "../config/prisma-client.ts";
import { CIRCULATION_SERVICE_URL, INTERNAL_SERVICE_SECRET } from '../config/env.config.ts';
import type { Response, Request } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.ts";

const listBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await prisma.book.findMany({ where: { deletedAt: null } });
    res.status(200).json(books);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ message });
  }
};

const getBook = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const book = await prisma.book.findUnique({ where: { id: Number(req.params.id) } });
    if (!book || book.deletedAt) {
      res.status(404).json({ message: "Book not found" });
      return;
    }
    res.status(200).json(book);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ message });
  }
};

const registerBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, author, publisher, isbn, genre, totalCopies, coverUrl, pdfUrl, description } = req.body;

    if (!title || !author || !isbn) {
      res.status(400).json({ message: "title, author, and isbn are required" });
      return;
    }

    const copies = Number(totalCopies) || 1;

    const book = await prisma.book.create({
      data: {
        title, author, publisher, isbn, genre,
        description, totalCopies: copies,
        availableCopies: copies,
        coverUrl,
        pdfUrl,
        addedByUserId: req.user?.id,
      },
    });
    res.status(201).json(book);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "A book with this ISBN already exists" });
      return;
    }
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ message });
  }
};

const updateBook = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { title, author, publisher, isbn, genre, totalCopies, coverUrl, pdfUrl, description } = req.body;
    const book = await prisma.book.update({
      where: { id: Number(req.params.id) },
      data: { title, author, publisher, isbn, genre, totalCopies, coverUrl, pdfUrl, description },
    });
    res.status(200).json(book);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ message });
  }
};

const removeBook = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const book = await prisma.book.update({
      where: { id: Number(req.params.id) },
      data: { deletedAt: new Date() },
    });
    res.status(200).json(book);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ message });
  }
};

const adjustCopies = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { delta } = req.body; 
    const book = await prisma.book.update({
      where: { id: Number(req.params.id) },
      data: { availableCopies: { increment: Number(delta) } },
    });
    res.status(200).json(book);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to adjust copies";
    res.status(500).json({ message });
  }
};

const getNewArrivals = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;
    const books = await prisma.book.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    res.status(200).json(books);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch new arrivals";
    res.status(500).json({ message });
  }
};

const getSimilarBooks = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const bookId = Number(req.params.id);
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.deletedAt) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    const [byAuthor, byGenre] = await Promise.all([
      prisma.book.findMany({
        where: { author: book.author, id: { not: bookId }, deletedAt: null },
        take: 6,
      }),
      prisma.book.findMany({
        where: { genre: { hasSome: book.genre }, id: { not: bookId }, deletedAt: null },
        take: 6,
      }),
    ]);

    res.status(200).json({ byAuthor, byGenre });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch similar books";
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
      res.status(502).json({ message: "Failed to reach circulation service" });
      return;
    }
    const loanCounts: { bookId: number; count: number }[] = await loanCountsRes.json();

    const topIds = loanCounts.slice(0, limit).map((lc) => lc.bookId);
    if (topIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    const books = await prisma.book.findMany({
      where: { id: { in: topIds }, deletedAt: null },
    });

    const countByBookId = new Map(loanCounts.map((lc) => [lc.bookId, lc.count]));
    const sortedBooks = books
      .map((book) => ({ ...book, borrowCount: countByBookId.get(book.id) || 0 }))
      .sort((a, b) => b.borrowCount - a.borrowCount);

    res.status(200).json(sortedBooks);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch trending books";
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

    const result = await prisma.book.updateMany({
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
    const result = await prisma.book.updateMany({
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
    const books = await prisma.book.findMany({
      where: { featured: true, deletedAt: null },
    });
    res.status(200).json(books);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch featured books";
    res.status(500).json({ message });
  }
};

export { listBooks, getBook, registerBook, updateBook, removeBook, adjustCopies, getNewArrivals, getSimilarBooks, getTrending, bulkSetFeatured, bulkSetWeeklyRead, getFeatured };
import prisma from '../config/prisma-client.ts';
import type { Request, Response } from 'express';

// Internal-only: returns just enough info for another service (e.g. a seed
// script) to resolve a real bookId from a known ISBN.
export const getBookByIsbn = async (req: Request<{ isbn: string }>, res: Response): Promise<void> => {
  try {
    const book = await prisma.book.findUnique({
      where: { isbn: req.params.isbn },
      select: { id: true, title: true, isbn: true },
    });
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    res.status(200).json(book);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch book by isbn';
    res.status(500).json({ message });
  }
};

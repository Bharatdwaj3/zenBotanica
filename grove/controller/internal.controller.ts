import prisma from '../config/prisma-client.ts';
import type { Request, Response } from 'express';

// Internal-only: returns just enough info for another service (e.g. a seed
// script) to resolve a real specimenId from a known ISBN.
export const getSpecimenByIsbn = async (req: Request<{ isbn: string }>, res: Response): Promise<void> => {
  try {
    const specimen = await prisma.book.findUnique({
      where: { isbn: req.params.isbn },
      select: { id: true, title: true, isbn: true },
    });
    if (!specimen) {
      res.status(404).json({ message: 'Specimen not found' });
      return;
    }
    res.status(200).json(specimen);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch specimen by isbn';
    res.status(500).json({ message });
  }
};

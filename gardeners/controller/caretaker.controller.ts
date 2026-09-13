import { Request, Response } from 'express';
import prisma from '../config/prisma-client.ts';

export const getAllCaretakers = async (req: Request, res: Response) => {
  try {
    const caretakers = await prisma.caretaker.findMany({
      include: { user: { select: { id: true, email: true, role: true, isActive: true } } },
    });
    res.status(200).json(caretakers);
  } catch (error) {
    console.error('Failed to fetch caretakers:', error);
    res.status(500).json({ error: 'Failed to fetch caretakers' });
  }
};

export const getCaretakerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const caretaker = await prisma.caretaker.findUnique({
      where: { id: Number(id) },
      include: { user: { select: { id: true, email: true, role: true, isActive: true } } },
    });
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found' });
    res.status(200).json(caretaker);
  } catch (error) {
    console.error('Failed to fetch caretaker:', error);
    res.status(500).json({ error: 'Failed to fetch caretaker' });
  }
};

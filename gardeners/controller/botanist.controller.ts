import { Request, Response } from "express";
import prisma from "../config/prisma-client.ts";

export const listBotanist = async (req: Request, res: Response) => {
  try {
    const botanists = await prisma.user.findMany({
      where: { role: "botanist" },
      include: { botanist: true },
    });
    res.json(botanists);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch botanists" });
  }
};

export const getBotanist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const botanist = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { botanist: true },
    });
    if (!botanist) return res.status(404).json({ error: "Botanist not found" });
    res.json(botanist);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch botanist" });
  }
};

export const registerBotanist = async (req: Request, res: Response) => {
  try {
    const { email, username, password, Fname, Lname, age, gender, Expertise } = req.body;
    const hashedPassword = Buffer.from(password).toString('base64');
    const user = await prisma.user.create({
      data: {
        email, username, password: hashedPassword, role: "botanist",
        botanist: { create: { email, Fname, Lname, age, gender, Expertise: Expertise as any } }
      },
      include: { botanist: true }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to register botanist" });
  }
};

export const updateBotanist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Fname, Lname, age, gender, Expertise } = req.body;
    const updated = await prisma.botanist.update({
      where: { userId: Number(id) },
      data: { Fname, Lname, age, gender, Expertise: Expertise as any }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update botanist" });
  }
};

export const deleteBotanist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "Botanist deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete botanist" });
  }
};

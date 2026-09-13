import prisma from "../config/prisma-client.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import type { Response } from "express";

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price } = req.body;
    const farmerId = req.user?.id;
    const product = await prisma.product.create({
      data: { name, description, price: Number(price), farmerId: Number(farmerId) },
    });
    res.status(201).json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    res.status(500).json({ message });
  }
};

export const listProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: 'desc' } });
    res.status(200).json(products);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    res.status(500).json({ message });
  }
};

export const certifyProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = Number(req.params.id);
    const curatorId = req.user?.id;
    const product = await prisma.product.update({
      where: { id: productId },
      data: { certified: true, certifiedBy: Number(curatorId) },
    });
    res.status(200).json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to certify product";
    res.status(500).json({ message });
  }
};
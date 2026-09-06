import prisma from "../config/prisma-client.ts";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.ts";

const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId } = req.body;
    const userId = req.user?.id;

    if (!bookId) {
      res.status(400).json({ message: "bookId is required" });
      return;
    }

    const wishlistItem = await prisma.wishlist_item.create({
      data: { userId: userId!, bookId: Number(bookId) },
    });
    res.status(201).json(wishlistItem);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "This book is already in your wishlist" });
      return;
    }
    const message = error instanceof Error ? error.message : "Failed to add to wishlist";
    res.status(500).json({ message });
  }
};

const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookId = Number(req.params.bookId);
    const userId = req.user?.id;

    await prisma.wishlist_item.delete({
      where: { userId_bookId: { userId: userId!, bookId } },
    });
    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "This book is not in your wishlist" });
      return;
    }
    const message = error instanceof Error ? error.message : "Failed to remove from wishlist";
    res.status(500).json({ message });
  }
};

const listWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const wishlistItems = await prisma.wishlist_item.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { addedAt: "desc" },
    });
    res.status(200).json(wishlistItems);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch wishlist";
    res.status(500).json({ message });
  }
};

export { addToWishlist, removeFromWishlist, listWishlist };

import prisma from "../config/prisma-client.ts";
import { CIRCULATION_SERVICE_URL, INTERNAL_SERVICE_SECRET } from "../config/env.config.ts";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.ts";

const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId } = req.body;
    const userId = req.user?.id;

    if (!bookId) {
      res.status(400).json({ message: "bookId is required" });
      return;
    }

    const cartItem = await prisma.cart_item.create({
      data: { userId: userId!, bookId: Number(bookId) },
    });
    res.status(201).json(cartItem);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "This book is already in your cart" });
      return;
    }
    const message = error instanceof Error ? error.message : "Failed to add to cart";
    res.status(500).json({ message });
  }
};

const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookId = Number(req.params.bookId);
    const userId = req.user?.id;

    await prisma.cart_item.delete({
      where: { userId_bookId: { userId: userId!, bookId } },
    });
    res.status(200).json({ message: "Removed from cart" });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "This book is not in your cart" });
      return;
    }
    const message = error instanceof Error ? error.message : "Failed to remove from cart";
    res.status(500).json({ message });
  }
};

const listCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const cartItems = await prisma.cart_item.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { addedAt: "desc" },
    });
    res.status(200).json(cartItems);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch cart";
    res.status(500).json({ message });
  }
};

// Borrows every book currently in the user's cart, one at a time, via circulation's
// internal /borrow endpoint (so the same caps apply as a normal borrow). Runs sequentially
// (not Promise.all) since each borrow can change whether the next one is still allowed
// (e.g. hitting the active-loan cap partway through the cart).
// Only successfully-borrowed items are removed from the cart — failures stay so the user
// can see what didn't go through and try again later.
const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    const cartItems = await prisma.cart_item.findMany({ where: { userId } });
    if (cartItems.length === 0) {
      res.status(400).json({ message: "Your cart is empty" });
      return;
    }

    const results = [];
    for (const item of cartItems) {
      const borrowRes = await fetch(`${CIRCULATION_SERVICE_URL}/api/v1/internal/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_SERVICE_SECRET,
        },
        body: JSON.stringify({ userId, role: userRole, bookId: item.bookId }),
      });
      const body = await borrowRes.json();
      results.push({ bookId: item.bookId, success: borrowRes.ok, message: borrowRes.ok ? "Borrowed" : body.message });

      if (borrowRes.ok) {
        await prisma.cart_item.delete({ where: { id: item.id } });
      }
    }

    res.status(200).json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    res.status(500).json({ message });
  }
};

export { addToCart, removeFromCart, listCart, checkout };

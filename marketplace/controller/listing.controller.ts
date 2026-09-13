import prisma from "../config/prisma-client.ts";
import { GARDENERS_SERVICE_URL, INTERNAL_SERVICE_SECRET } from "../config/env.config.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import type { Response } from "express";

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    const merchantId = req.user?.id;

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (!product.certified) {
      res.status(403).json({ message: "Cannot list an uncertified product" });
      return;
    }

    const merchantRes = await fetch(`${GARDENERS_SERVICE_URL}/api/v1/internal/users/by-ids?ids=${Number(merchantId)}`, {
      headers: { "x-internal-secret": INTERNAL_SERVICE_SECRET },
    });
    const merchants = await merchantRes.json();
    const merchant = merchants[0];

    if (!merchant || merchant.role !== "merchant" || merchant.approved !== true) {
      res.status(403).json({ message: "Merchant is not approved to create listings" });
      return;
    }

    const listing = await prisma.listing.create({
      data: { productId: Number(productId), merchantId: Number(merchantId) },
    });
    res.status(201).json(listing);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create listing";
    res.status(500).json({ message });
  }
};

export const listListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listings = await prisma.listing.findMany({ include: { product: true }, orderBy: { createdAt: 'desc' } });
    res.status(200).json(listings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch listings";
    res.status(500).json({ message });
  }
};

export const approveListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = Number(req.params.id);
    const curatorId = req.user?.id;
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: { status: "APPROVED", approvedBy: Number(curatorId) },
    });
    res.status(200).json(listing);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve listing";
    res.status(500).json({ message });
  }
};
import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import { addToWishlist, removeFromWishlist, listWishlist } from "../controller/wishlist.controller.ts";

const router = Router();

router.get("/", authUser, listWishlist);
router.post("/", authUser, addToWishlist);
router.delete("/:bookId", authUser, removeFromWishlist);

export default router;

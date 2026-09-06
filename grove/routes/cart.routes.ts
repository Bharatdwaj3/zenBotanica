import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import { addToCart, removeFromCart, listCart, checkout } from "../controller/cart.controller.ts";

const router = Router();

router.get("/", authUser, listCart);
router.post("/", authUser, addToCart);
router.delete("/:bookId", authUser, removeFromCart);
router.post("/checkout", authUser, checkout);

export default router;

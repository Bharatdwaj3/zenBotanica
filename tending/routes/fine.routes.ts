import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import checkPermission from "../middleware/permission.middleware.ts";
import { issueFine, listMyFines, createPayOrder, verifyPayment } from "../controller/fine.controller.ts";

const router = Router();

router.post("/", authUser, checkPermission("issueFine"), issueFine);
router.get("/mine", authUser, checkPermission("payFine"), listMyFines);
router.post("/:id/pay-order", authUser, checkPermission("payFine"), createPayOrder);
router.post("/verify-payment", authUser, checkPermission("payFine"), verifyPayment);

export default router;

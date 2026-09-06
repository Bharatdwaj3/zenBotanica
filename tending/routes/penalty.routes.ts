import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import checkPermission from "../middleware/permission.middleware.ts";
import { issuePenalty, listMyPenaltys, createPayOrder, verifyPayment } from "../controller/penalty.controller.ts";

const router = Router();

router.post("/", authUser, checkPermission("issuePenalty"), issuePenalty);
router.get("/mine", authUser, checkPermission("payPenalty"), listMyPenaltys);
router.post("/:id/pay-order", authUser, checkPermission("payPenalty"), createPayOrder);
router.post("/verify-payment", authUser, checkPermission("payPenalty"), verifyPayment);

export default router;

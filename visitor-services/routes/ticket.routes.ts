import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import checkPermission from "../middleware/permission.middleware.ts";
import { buyTicket, listTickets } from "../controller/ticket.controller.ts";

const router = Router();
router.use(authUser);
router.post("/", checkPermission("buyTicket"), buyTicket);
router.get("/", checkPermission("listTickets"), listTickets);
export default router;
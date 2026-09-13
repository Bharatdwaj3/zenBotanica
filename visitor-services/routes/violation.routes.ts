import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import checkPermission from "../middleware/permission.middleware.ts";
import { reportViolation, payViolationFine, listViolations } from "../controller/violation.controller.ts";

const router = Router();
router.use(authUser);
router.post("/", checkPermission("manageViolations"), reportViolation);
router.get("/", checkPermission("listViolations"), listViolations);
router.patch("/:id/pay", checkPermission("payViolationFine"), payViolationFine);
export default router;
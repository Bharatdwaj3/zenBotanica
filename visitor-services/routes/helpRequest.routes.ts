import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import checkPermission from "../middleware/permission.middleware.ts";
import { submitHelpRequest, listHelpRequests, updateHelpRequest } from "../controller/helpRequest.controller.ts";

const router = Router();
router.use(authUser);
router.post("/", checkPermission("submitHelpRequest"), submitHelpRequest);
router.get("/", checkPermission("listHelpRequests"), listHelpRequests);
router.patch("/:id", checkPermission("manageHelpRequests"), updateHelpRequest);
export default router;
import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import checkPermission from "../middleware/permission.middleware.ts";
import { getCareTasks, completeCareTask, reassignCareTask } from "../controller/care.controller.ts";

const router = Router();

router.use(authUser);

router.get("/", checkPermission("listCareTask"), getCareTasks);
router.patch("/:id/complete", checkPermission("completeCareTask"), completeCareTask);
router.patch("/:id/reassign", checkPermission("manageCareTask"), reassignCareTask);

export default router;

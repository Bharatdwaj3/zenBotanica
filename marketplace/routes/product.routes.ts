import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import checkPermission from "../middleware/permission.middleware.ts";
import { createProduct, listProducts, certifyProduct } from "../controller/product.controller.ts";

const router = Router();
router.use(authUser);
router.post("/", checkPermission("createProduct"), createProduct);
router.get("/", checkPermission("listProducts"), listProducts);
router.patch("/:id/certify", checkPermission("certifyProduct"), certifyProduct);
export default router;
import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.ts";
import checkPermission from "../middleware/permission.middleware.ts";
import { createListing, listListings, approveListing } from "../controller/listing.controller.ts";

const router = Router();
router.use(authUser);
router.post("/", checkPermission("createListing"), createListing);
router.get("/", checkPermission("listListings"), listListings);
router.patch("/:id/approve", checkPermission("approveListing"), approveListing);
export default router;
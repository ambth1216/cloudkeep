import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createShareSchema } from "../schemas/share.schema.js";
import * as shareController from "../controllers/share.controller.js";

const router = Router();

// Public route — no auth required
router.get("/public/:token", shareController.accessSharedFile);

// Authenticated routes
router.use(authenticate);

router.post("/", validate(createShareSchema), shareController.createShareLink);
router.get("/", shareController.listSharedLinks);
router.delete("/:id", shareController.revokeShareLink);

export default router;

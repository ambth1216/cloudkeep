import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get("/stats", dashboardController.getStats);
router.get("/recent", dashboardController.getRecentUploads);
router.get("/activity", dashboardController.getActivity);

export default router;

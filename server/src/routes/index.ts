import { Router } from "express";
import type { Request, Response } from "express";

import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import fileRoutes from "./file.routes.js";
import folderRoutes from "./folder.routes.js";
import shareRoutes from "./share.routes.js";
import favoriteRoutes from "./favorite.routes.js";
import searchRoutes from "./search.routes.js";

const router = Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/files", fileRoutes);
router.use("/folders", folderRoutes);
router.use("/share", shareRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/search", searchRoutes);

export default router;

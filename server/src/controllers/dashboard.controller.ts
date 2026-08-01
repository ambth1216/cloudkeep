import type { Request, Response } from "express";

import * as dashboardService from "../services/dashboard.service.js";

/**
 * GET /api/dashboard/stats
 */
export async function getStats(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const stats = await dashboardService.getStats(userId);

  res.status(200).json({
    success: true,
    data: stats,
  });
}

/**
 * GET /api/dashboard/recent
 */
export async function getRecentUploads(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const files = await dashboardService.getRecentUploads(userId);

  res.status(200).json({
    success: true,
    data: files,
  });
}

/**
 * GET /api/dashboard/activity
 */
export async function getActivity(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const page = parseInt(req.query["page"] as string) || 1;
  const limit = parseInt(req.query["limit"] as string) || 20;

  const result = await dashboardService.getActivityLog(userId, page, limit);

  res.status(200).json({
    success: true,
    data: result.activities,
    pagination: result.pagination,
  });
}

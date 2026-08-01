import type { Request, Response } from "express";

import * as favoriteService from "../services/favorite.service.js";

/**
 * GET /api/favorites
 */
export async function listFavorites(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;

  const favorites = await favoriteService.listFavorites(userId);

  res.status(200).json({
    success: true,
    data: favorites,
  });
}

/**
 * POST /api/favorites
 */
export async function toggleFavorite(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const { fileId, folderId } = req.body as {
    fileId?: string;
    folderId?: string;
  };

  const result = await favoriteService.toggleFavorite(
    userId,
    fileId ?? null,
    folderId ?? null
  );

  res.status(200).json({
    success: true,
    ...result,
  });
}

/**
 * DELETE /api/favorites/:id
 */
export async function removeFavorite(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const favoriteId = req.params.id as string;

  const result = await favoriteService.removeFavorite(userId, favoriteId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
}

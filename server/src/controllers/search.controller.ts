import type { Request, Response } from "express";

import * as searchService from "../services/search.service.js";
import type { SearchQuery } from "../schemas/search.schema.js";

/**
 * GET /api/search
 */
export async function search(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const query = req.query as unknown as SearchQuery;

  const result = await searchService.searchFiles(userId, query);

  res.status(200).json({
    success: true,
    data: result.files,
    pagination: result.pagination,
  });
}

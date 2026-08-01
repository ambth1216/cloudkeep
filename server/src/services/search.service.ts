import { Prisma } from "@prisma/client";

import { prisma } from "../config/database.js";
import type { SearchQuery } from "../schemas/search.schema.js";

/**
 * Search files by name, type, date range, and folder.
 * Builds a dynamic Prisma query from the search parameters.
 */
export async function searchFiles(userId: string, query: SearchQuery) {
  const { q, type, dateFrom, dateTo, folderId, page, limit } = query;
  const skip = (page - 1) * limit;

  // Build dynamic where clause
  const where: Prisma.FileWhereInput = {
    userId,
    isDeleted: false,
  };

  // Filename search (case-insensitive)
  if (q) {
    where.name = {
      contains: q,
      mode: "insensitive",
    };
  }

  // MIME type filter
  if (type) {
    where.mimeType = {
      startsWith: type,
    };
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo);
    }
  }

  // Folder scope
  if (folderId) {
    where.folderId = folderId;
  }

  const [files, total] = await Promise.all([
    prisma.file.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        originalName: true,
        mimeType: true,
        size: true,
        cloudinaryUrl: true,
        folderId: true,
        createdAt: true,
        folder: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.file.count({ where }),
  ]);

  return {
    files: files.map((f: any) => ({ ...f, size: Number(f.size) })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

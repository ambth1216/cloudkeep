import { prisma } from "../config/database.js";
import { formatFileSize } from "../utils/helpers.js";
import type { DashboardStats } from "../types/index.js";

/**
 * Get dashboard statistics for a user.
 */
export async function getStats(userId: string) {
  const [
    user,
    totalFiles,
    sharedFilesCount,
    favoritesCount,
    picturesCount,
    videosCount,
    audioCount,
    documentsCount,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, storageLimit: true },
    }),
    prisma.file.count({
      where: { userId, isDeleted: false },
    }),
    prisma.sharedLink.count({
      where: { userId, isActive: true },
    }),
    prisma.favorite.count({
      where: { userId },
    }),
    prisma.file.count({
      where: { userId, isDeleted: false, mimeType: { startsWith: "image/" } },
    }),
    prisma.file.count({
      where: { userId, isDeleted: false, mimeType: { startsWith: "video/" } },
    }),
    prisma.file.count({
      where: { userId, isDeleted: false, mimeType: { startsWith: "audio/" } },
    }),
    prisma.file.count({
      where: {
        userId,
        isDeleted: false,
        NOT: {
          OR: [
            { mimeType: { startsWith: "image/" } },
            { mimeType: { startsWith: "video/" } },
            { mimeType: { startsWith: "audio/" } },
          ],
        },
      },
    }),
  ]);

  const storageUsed = Number(user?.storageUsed ?? 0);
  const storageLimit = Number(user?.storageLimit ?? 524288000);

  return {
    totalFiles,
    storageUsed: formatFileSize(storageUsed),
    storageLimit: formatFileSize(storageLimit),
    storagePercentage:
      storageLimit > 0
        ? Math.round((storageUsed / storageLimit) * 100)
        : 0,
    sharedFilesCount,
    favoritesCount,
    picturesCount,
    videosCount,
    audioCount,
    documentsCount,
  };
}

/**
 * Get recent uploads for a user (last 10).
 */
export async function getRecentUploads(userId: string) {
  const files = await prisma.file.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: 10,
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
  });

  return files.map((file: any) => ({
    ...file,
    size: Number(file.size),
  }));
}

/**
 * Get activity log for a user with pagination.
 */
export async function getActivityLog(
  userId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        createdAt: true,
      },
    }),
    prisma.activityLog.count({ where: { userId } }),
  ]);

  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

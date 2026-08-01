import { prisma } from "../config/database.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

/**
 * List all favorites for a user (both files and folders).
 */
export async function listFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      file: {
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          cloudinaryUrl: true,
          isDeleted: true,
          createdAt: true,
        },
      },
      folder: {
        select: {
          id: true,
          name: true,
          isDeleted: true,
          createdAt: true,
          _count: {
            select: {
              children: { where: { isDeleted: false } },
              files: { where: { isDeleted: false } },
            },
          },
        },
      },
    },
  });

  return favorites.map((fav: any) => ({
    id: fav.id,
    type: fav.file ? ("file" as const) : ("folder" as const),
    createdAt: fav.createdAt,
    item: fav.file
      ? { ...fav.file, size: Number(fav.file.size) }
      : fav.folder,
  }));
}

/**
 * Toggle favorite — add if not exists, remove if exists.
 */
export async function toggleFavorite(
  userId: string,
  fileId?: string | null,
  folderId?: string | null
) {
  if (!fileId && !folderId) {
    throw new BadRequestError("Either fileId or folderId must be provided");
  }

  if (fileId && folderId) {
    throw new BadRequestError("Only one of fileId or folderId should be provided");
  }

  if (fileId) {
    // Verify file exists
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId, isDeleted: false },
    });
    if (!file) throw new NotFoundError("File not found");

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: { userId_fileId: { userId, fileId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return { action: "removed" as const, message: "Removed from favorites" };
    }

    const favorite = await prisma.favorite.create({
      data: { userId, fileId },
      select: { id: true, createdAt: true },
    });

    return { action: "added" as const, id: favorite.id, message: "Added to favorites" };
  }

  if (folderId) {
    // Verify folder exists
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId, isDeleted: false },
    });
    if (!folder) throw new NotFoundError("Folder not found");

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: { userId_folderId: { userId, folderId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return { action: "removed" as const, message: "Removed from favorites" };
    }

    const favorite = await prisma.favorite.create({
      data: { userId, folderId },
      select: { id: true, createdAt: true },
    });

    return { action: "added" as const, id: favorite.id, message: "Added to favorites" };
  }

  throw new BadRequestError("Invalid favorite request");
}

/**
 * Remove a specific favorite by ID.
 */
export async function removeFavorite(userId: string, favoriteId: string) {
  const favorite = await prisma.favorite.findFirst({
    where: { id: favoriteId, userId },
  });

  if (!favorite) {
    throw new NotFoundError("Favorite not found");
  }

  await prisma.favorite.delete({ where: { id: favoriteId } });

  return { message: "Removed from favorites" };
}

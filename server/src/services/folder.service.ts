import { prisma } from "../config/database.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import { logActivity } from "./activity.service.js";
import { deleteFromCloudinary } from "./cloudinary.service.js";
import type { CreateFolderInput, RenameFolderInput } from "../schemas/folder.schema.js";

/**
 * List folders for a user within a given parent (null = root).
 */
export async function listFolders(userId: string, parentId: string | null) {
  return prisma.folder.findMany({
    where: {
      userId,
      parentId: parentId ?? null,
      isDeleted: false,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      parentId: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          children: { where: { isDeleted: false } },
          files: { where: { isDeleted: false } },
        },
      },
    },
  });
}

/**
 * Get folder details including children folders and files.
 */
export async function getFolderById(userId: string, folderId: string) {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId, isDeleted: false },
    select: {
      id: true,
      name: true,
      parentId: true,
      createdAt: true,
      updatedAt: true,
      children: {
        where: { isDeleted: false },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
          _count: {
            select: {
              children: { where: { isDeleted: false } },
              files: { where: { isDeleted: false } },
            },
          },
        },
      },
      files: {
        where: { isDeleted: false },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          originalName: true,
          mimeType: true,
          size: true,
          cloudinaryUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!folder) {
    throw new NotFoundError("Folder not found");
  }

  return {
    ...folder,
    files: folder.files.map((f: any) => ({ ...f, size: Number(f.size) })),
  };
}

/**
 * Create a new folder.
 */
export async function createFolder(userId: string, input: CreateFolderInput) {
  // If parentId is provided, verify it exists and belongs to the user
  if (input.parentId) {
    const parent = await prisma.folder.findFirst({
      where: { id: input.parentId, userId, isDeleted: false },
    });

    if (!parent) {
      throw new NotFoundError("Parent folder not found");
    }
  }

  // Check for duplicate folder name in the same parent
  const existing = await prisma.folder.findFirst({
    where: {
      name: input.name,
      userId,
      parentId: input.parentId ?? null,
      isDeleted: false,
    },
  });

  if (existing) {
    throw new BadRequestError("A folder with this name already exists in this location");
  }

  const folder = await prisma.folder.create({
    data: {
      name: input.name,
      userId,
      parentId: input.parentId ?? null,
    },
    select: {
      id: true,
      name: true,
      parentId: true,
      createdAt: true,
    },
  });

  await logActivity(userId, "CREATE_FOLDER", "FOLDER", folder.id, {
    name: folder.name,
  });

  return folder;
}

/**
 * Rename a folder.
 */
export async function renameFolder(
  userId: string,
  folderId: string,
  input: RenameFolderInput
) {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId, isDeleted: false },
  });

  if (!folder) {
    throw new NotFoundError("Folder not found");
  }

  // Check for duplicate name in same parent
  const existing = await prisma.folder.findFirst({
    where: {
      name: input.name,
      userId,
      parentId: folder.parentId,
      isDeleted: false,
      id: { not: folderId },
    },
  });

  if (existing) {
    throw new BadRequestError("A folder with this name already exists in this location");
  }

  const updated = await prisma.folder.update({
    where: { id: folderId },
    data: { name: input.name },
    select: {
      id: true,
      name: true,
      parentId: true,
      updatedAt: true,
    },
  });

  await logActivity(userId, "RENAME_FOLDER", "FOLDER", folderId, {
    oldName: folder.name,
    newName: input.name,
  });

  return updated;
}

/**
 * Soft delete a folder and all its children/files recursively.
 */
export async function deleteFolder(userId: string, folderId: string) {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId },
  });

  if (!folder) {
    throw new NotFoundError("Folder not found");
  }

  // Collect all child folder IDs recursively
  const folderIds = await collectChildFolderIds(folderId);
  folderIds.push(folderId);

  // Find all files in these folders
  const filesToDelete = await prisma.file.findMany({
    where: { folderId: { in: folderIds }, userId },
    select: {
      id: true,
      size: true,
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
    },
  });

  // Delete all files from Cloudinary and invalidate CDN cache
  for (const file of filesToDelete) {
    try {
      await deleteFromCloudinary(
        file.cloudinaryPublicId,
        file.cloudinaryResourceType as "image" | "video" | "raw"
      );
    } catch (err) {
      // Continue even if an individual Cloudinary delete fails
    }
  }

  const totalSize = filesToDelete.reduce((acc, f) => acc + Number(f.size), 0);
  const fileIds = filesToDelete.map((f) => f.id);

  // Delete DB records (shared links, favorites, files, folders) & update storage limit
  await prisma.$transaction([
    prisma.sharedLink.deleteMany({
      where: { fileId: { in: fileIds } },
    }),
    prisma.favorite.deleteMany({
      where: {
        OR: [
          { fileId: { in: fileIds } },
          { folderId: { in: folderIds } },
        ],
      },
    }),
    prisma.file.deleteMany({
      where: { folderId: { in: folderIds }, userId },
    }),
    prisma.folder.deleteMany({
      where: { id: { in: folderIds }, userId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { storageUsed: { decrement: totalSize } },
    }),
  ]);

  await logActivity(userId, "DELETE_FOLDER", "FOLDER", folderId, {
    name: folder.name,
  });

  return { message: "Folder and all contents deleted successfully" };
}

/**
 * Restore a soft-deleted folder.
 */
export async function restoreFolder(userId: string, folderId: string) {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId, isDeleted: true },
  });

  if (!folder) {
    throw new NotFoundError("Folder not found in trash");
  }

  // Recursively collect all child folder IDs
  const folderIds = await collectChildFolderIds(folderId);
  folderIds.push(folderId);

  await prisma.$transaction([
    prisma.folder.updateMany({
      where: { id: { in: folderIds }, userId },
      data: { isDeleted: false, deletedAt: null },
    }),
    prisma.file.updateMany({
      where: { folderId: { in: folderIds }, userId },
      data: { isDeleted: false, deletedAt: null },
    }),
  ]);

  await logActivity(userId, "RESTORE_FOLDER", "FOLDER", folderId, {
    name: folder.name,
  });

  return { message: "Folder restored successfully" };
}

/**
 * Get breadcrumb trail from root to the specified folder.
 */
export async function getBreadcrumb(userId: string, folderId: string) {
  const breadcrumb: Array<{ id: string; name: string }> = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder: { id: string; name: string; parentId: string | null } | null =
      await prisma.folder.findFirst({
        where: { id: currentId, userId },
        select: { id: true, name: true, parentId: true },
      });

    if (!folder) break;

    breadcrumb.unshift({ id: folder.id, name: folder.name });
    currentId = folder.parentId;
  }

  return breadcrumb;
}

/**
 * Recursively collect all child folder IDs for a given folder.
 */
async function collectChildFolderIds(folderId: string): Promise<string[]> {
  const children = await prisma.folder.findMany({
    where: { parentId: folderId },
    select: { id: true },
  });

  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    const grandchildren = await collectChildFolderIds(child.id);
    ids.push(...grandchildren);
  }

  return ids;
}

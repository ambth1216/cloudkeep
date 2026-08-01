import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import {
  BadRequestError,
  NotFoundError,
  PayloadTooLargeError,
} from "../utils/errors.js";
import {
  sanitizeFilename,
  getCloudinaryResourceType,
} from "../utils/helpers.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getSignedDownloadUrl,
} from "./cloudinary.service.js";
import { logActivity } from "./activity.service.js";
import type { RenameFileInput, MoveFileInput } from "../schemas/file.schema.js";

/**
 * List files for a user (optionally in a folder), with pagination.
 */
export async function listFiles(
  userId: string,
  folderId: string | null | undefined,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  const where: any = {
    userId,
    isDeleted: false,
  };

  if (folderId === "root") {
    where.folderId = null;
  } else if (folderId && folderId !== "all") {
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
        cloudinaryResourceType: true,
        folderId: true,
        createdAt: true,
        updatedAt: true,
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

/**
 * List trashed files for a user.
 */
export async function listTrashedFiles(
  userId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  const where = { userId, isDeleted: true };

  const [files, total] = await Promise.all([
    prisma.file.findMany({
      where,
      orderBy: { deletedAt: "desc" },
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
        deletedAt: true,
        createdAt: true,
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

/**
 * Get a single file by ID.
 */
export async function getFileById(userId: string, fileId: string) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId },
    select: {
      id: true,
      name: true,
      originalName: true,
      mimeType: true,
      size: true,
      cloudinaryUrl: true,
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
      folderId: true,
      isDeleted: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      folder: {
        select: { id: true, name: true },
      },
    },
  });

  if (!file) {
    throw new NotFoundError("File not found");
  }

  return { ...file, size: Number(file.size) };
}

/**
 * Upload a file to Cloudinary and create a DB record.
 */
export async function uploadFile(
  userId: string,
  file: Express.Multer.File,
  folderId?: string | null
) {
  // Check user storage limit
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { storageUsed: true, storageLimit: true },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const currentUsed = Number(user.storageUsed);
  const limit = Number(user.storageLimit);

  if (currentUsed + file.size > limit) {
    throw new PayloadTooLargeError(
      `Storage limit exceeded. You have ${formatBytes(limit - currentUsed)} remaining.`
    );
  }

  // Verify folder exists if provided
  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId, isDeleted: false },
    });

    if (!folder) {
      throw new NotFoundError("Target folder not found");
    }
  }

  const sanitizedName = sanitizeFilename(file.originalname);
  const resourceType = getCloudinaryResourceType(file.mimetype);

  // Upload to Cloudinary
  const cloudinaryResult = await uploadToCloudinary(file.buffer, {
    folder: `cloudkeep/${userId}`,
    publicId: `${Date.now()}_${sanitizedName}`,
    resourceType,
  });

  // Create file record and update storage used (in a transaction)
  const [dbFile] = await prisma.$transaction([
    prisma.file.create({
      data: {
        name: sanitizedName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: BigInt(file.size),
        cloudinaryPublicId: cloudinaryResult.publicId,
        cloudinaryUrl: cloudinaryResult.secureUrl,
        cloudinaryResourceType: resourceType,
        userId,
        folderId: folderId ?? null,
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        mimeType: true,
        size: true,
        cloudinaryUrl: true,
        cloudinaryResourceType: true,
        folderId: true,
        createdAt: true,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { storageUsed: { increment: BigInt(file.size) } },
    }),
  ]);

  await logActivity(userId, "UPLOAD", "FILE", dbFile.id, {
    name: sanitizedName,
    size: file.size,
    mimeType: file.mimetype,
  });

  return { ...dbFile, size: Number(dbFile.size) };
}

/**
 * Get a download URL for a file.
 */
export async function getDownloadFileBuffer(userId: string, fileId: string) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, isDeleted: false },
    select: {
      id: true,
      name: true,
      mimeType: true,
      cloudinaryUrl: true,
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
    },
  });

  if (!file) {
    throw new NotFoundError("File not found");
  }

  await logActivity(userId, "DOWNLOAD", "FILE", fileId, { name: file.name });

  const signedUrl = getSignedDownloadUrl(
    file.cloudinaryPublicId,
    file.cloudinaryResourceType as "image" | "video" | "raw",
    file.name
  );

  let response = await fetch(signedUrl);

  if (!response.ok) {
    response = await fetch(file.cloudinaryUrl);
  }

  if (!response.ok) {
    throw new NotFoundError("Unable to retrieve file from cloud storage");
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    filename: file.name,
    mimeType: file.mimeType,
  };
}

/**
 * Rename a file.
 */
export async function renameFile(
  userId: string,
  fileId: string,
  input: RenameFileInput
) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, isDeleted: false },
  });

  if (!file) {
    throw new NotFoundError("File not found");
  }

  const updated = await prisma.file.update({
    where: { id: fileId },
    data: { name: input.name },
    select: {
      id: true,
      name: true,
      updatedAt: true,
    },
  });

  await logActivity(userId, "RENAME", "FILE", fileId, {
    oldName: file.name,
    newName: input.name,
  });

  return updated;
}

/**
 * Soft delete a file.
 */
export async function softDeleteFile(userId: string, fileId: string) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, isDeleted: false },
    select: {
      id: true,
      name: true,
      size: true,
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
    },
  });

  if (!file) {
    throw new NotFoundError("File not found");
  }

  // Delete from Cloudinary and invalidate CDN cache
  try {
    await deleteFromCloudinary(
      file.cloudinaryPublicId,
      file.cloudinaryResourceType as "image" | "video" | "raw"
    );
  } catch (err) {
    // Continue DB update even if Cloudinary fails
  }

  // Update DB record and decrement user storage used
  await prisma.$transaction([
    prisma.file.update({
      where: { id: fileId },
      data: { isDeleted: true, deletedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { storageUsed: { decrement: file.size } },
    }),
  ]);

  await logActivity(userId, "DELETE", "FILE", fileId, { name: file.name });

  return { message: "File deleted successfully" };
}

/**
 * Restore a soft-deleted file.
 */
export async function restoreFile(userId: string, fileId: string) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, isDeleted: true },
  });

  if (!file) {
    throw new NotFoundError("File not found in trash");
  }

  await prisma.file.update({
    where: { id: fileId },
    data: { isDeleted: false, deletedAt: null },
  });

  await logActivity(userId, "RESTORE", "FILE", fileId, { name: file.name });

  return { message: "File restored successfully" };
}

/**
 * Permanently delete a file — removes from Cloudinary and database.
 */
export async function permanentDeleteFile(userId: string, fileId: string) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId },
    select: {
      id: true,
      name: true,
      size: true,
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
    },
  });

  if (!file) {
    throw new NotFoundError("File not found");
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(
    file.cloudinaryPublicId,
    file.cloudinaryResourceType as "image" | "video" | "raw"
  );

  // Delete from DB and decrement storage
  await prisma.$transaction([
    prisma.file.delete({ where: { id: fileId } }),
    prisma.user.update({
      where: { id: userId },
      data: { storageUsed: { decrement: file.size } },
    }),
  ]);

  await logActivity(userId, "PERMANENT_DELETE", "FILE", fileId, {
    name: file.name,
  });

  return { message: "File permanently deleted" };
}

/**
 * Move a file to a different folder.
 */
export async function moveFile(
  userId: string,
  fileId: string,
  input: MoveFileInput
) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, isDeleted: false },
  });

  if (!file) {
    throw new NotFoundError("File not found");
  }

  // Verify target folder if not root
  if (input.folderId) {
    const targetFolder = await prisma.folder.findFirst({
      where: { id: input.folderId, userId, isDeleted: false },
    });

    if (!targetFolder) {
      throw new NotFoundError("Target folder not found");
    }
  }

  const updated = await prisma.file.update({
    where: { id: fileId },
    data: { folderId: input.folderId },
    select: {
      id: true,
      name: true,
      folderId: true,
      updatedAt: true,
    },
  });

  await logActivity(userId, "MOVE", "FILE", fileId, {
    name: file.name,
    fromFolderId: file.folderId,
    toFolderId: input.folderId,
  });

  return updated;
}

/**
 * Copy a file — duplicates on Cloudinary and creates a new DB record.
 */
export async function copyFile(
  userId: string,
  fileId: string,
  folderId?: string | null
) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, isDeleted: false },
    select: {
      id: true,
      name: true,
      originalName: true,
      mimeType: true,
      size: true,
      cloudinaryPublicId: true,
      cloudinaryUrl: true,
      cloudinaryResourceType: true,
      folderId: true,
    },
  });

  if (!file) {
    throw new NotFoundError("File not found");
  }

  // Check storage limit
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { storageUsed: true, storageLimit: true },
  });

  if (!user) throw new NotFoundError("User not found");

  const fileSize = Number(file.size);
  if (Number(user.storageUsed) + fileSize > Number(user.storageLimit)) {
    throw new PayloadTooLargeError("Storage limit would be exceeded by this copy");
  }

  // Verify target folder if provided
  if (folderId) {
    const targetFolder = await prisma.folder.findFirst({
      where: { id: folderId, userId, isDeleted: false },
    });

    if (!targetFolder) {
      throw new NotFoundError("Target folder not found");
    }
  }

  // Create copy name
  const copyName = `Copy of ${file.name}`;

  // Create new DB record pointing to the same Cloudinary file
  // (Cloudinary doesn't charge for duplicate references)
  const [newFile] = await prisma.$transaction([
    prisma.file.create({
      data: {
        name: copyName,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        cloudinaryPublicId: file.cloudinaryPublicId,
        cloudinaryUrl: file.cloudinaryUrl,
        cloudinaryResourceType: file.cloudinaryResourceType,
        userId,
        folderId: folderId !== undefined ? folderId : file.folderId,
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        mimeType: true,
        size: true,
        cloudinaryUrl: true,
        folderId: true,
        createdAt: true,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { storageUsed: { increment: file.size } },
    }),
  ]);

  await logActivity(userId, "COPY", "FILE", newFile.id, {
    originalFileId: fileId,
    name: copyName,
  });

  return { ...newFile, size: Number(newFile.size) };
}

/** Format bytes to human-readable string (internal helper). */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

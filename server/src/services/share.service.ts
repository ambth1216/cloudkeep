import { prisma } from "../config/database.js";
import { NotFoundError } from "../utils/errors.js";
import { generateShareToken } from "../utils/helpers.js";
import { logActivity } from "./activity.service.js";
import { getSignedDownloadUrl } from "./cloudinary.service.js";
import type { CreateShareInput } from "../schemas/share.schema.js";

/**
 * Create a public share link for a file.
 */
export async function createShareLink(userId: string, input: CreateShareInput) {
  // Verify file exists and belongs to user
  const file = await prisma.file.findFirst({
    where: { id: input.fileId, userId, isDeleted: false },
  });

  if (!file) {
    throw new NotFoundError("File not found");
  }

  const token = generateShareToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

  const sharedLink = await prisma.sharedLink.create({
    data: {
      token,
      fileId: input.fileId,
      userId,
      expiresAt,
    },
    select: {
      id: true,
      token: true,
      expiresAt: true,
      isActive: true,
      downloadCount: true,
      createdAt: true,
      file: {
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
        },
      },
    },
  });

  await logActivity(userId, "SHARE", "FILE", input.fileId, {
    shareToken: token,
    expiresAt: expiresAt.toISOString(),
  });

  return {
    ...sharedLink,
    file: {
      ...sharedLink.file,
      size: Number(sharedLink.file.size),
    },
  };
}

/**
 * List all shared links created by a user.
 */
export async function listSharedLinks(userId: string) {
  const links = await prisma.sharedLink.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      token: true,
      expiresAt: true,
      isActive: true,
      downloadCount: true,
      createdAt: true,
      file: {
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
        },
      },
    },
  });

  return links.map((link: any) => ({
    ...link,
    isExpired: new Date() > link.expiresAt,
    file: {
      ...link.file,
      size: Number(link.file.size),
    },
  }));
}

/**
 * Deactivate a share link.
 */
export async function revokeShareLink(userId: string, linkId: string) {
  const link = await prisma.sharedLink.findFirst({
    where: { id: linkId, userId },
  });

  if (!link) {
    throw new NotFoundError("Share link not found");
  }

  await prisma.sharedLink.update({
    where: { id: linkId },
    data: { isActive: false },
  });

  return { message: "Share link revoked successfully" };
}

/**
 * Access a shared file by its public token (no authentication required).
 * Returns file info and download URL if the link is valid and not expired.
 */
export async function accessSharedFileBuffer(token: string) {
  const link = await prisma.sharedLink.findUnique({
    where: { token },
    select: {
      id: true,
      isActive: true,
      expiresAt: true,
      downloadCount: true,
      file: {
        select: {
          id: true,
          name: true,
          mimeType: true,
          cloudinaryUrl: true,
          cloudinaryPublicId: true,
          cloudinaryResourceType: true,
          isDeleted: true,
        },
      },
    },
  });

  if (!link || !link.isActive || new Date() > link.expiresAt || link.file.isDeleted) {
    throw new NotFoundError("Share link is invalid, expired, or file has been deleted");
  }

  // Increment download count
  await prisma.sharedLink.update({
    where: { id: link.id },
    data: { downloadCount: { increment: 1 } },
  });

  const signedUrl = getSignedDownloadUrl(
    link.file.cloudinaryPublicId,
    link.file.cloudinaryResourceType as "image" | "video" | "raw",
    link.file.name
  );

  let response = await fetch(signedUrl);
  if (!response.ok) {
    response = await fetch(link.file.cloudinaryUrl);
  }

  if (!response.ok) {
    throw new NotFoundError("Unable to retrieve file content");
  }

  const arrayBuffer = await response.arrayBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    filename: link.file.name,
    mimeType: link.file.mimeType,
  };
}

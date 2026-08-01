import crypto from "node:crypto";

/**
 * Format bytes into human-readable file size.
 */
export function formatFileSize(bytes: number | bigint): string {
  const size = Number(bytes);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let value = size;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

/**
 * Generate a cryptographically secure URL-safe token for share links.
 */
export function generateShareToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Map MIME type to Cloudinary resource type.
 * - image/* → "image"
 * - video/* → "video"
 * - everything else → "raw"
 */
export function getCloudinaryResourceType(
  mimeType: string
): "image" | "video" | "raw" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw";
}

/**
 * Sanitize a filename — remove path traversal characters and limit length.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\:*?"<>|]/g, "_")
    .replace(/\.{2,}/g, ".")
    .substring(0, 255);
}

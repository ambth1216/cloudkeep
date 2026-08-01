import { Readable } from "node:stream";

import { cloudinary } from "../config/cloudinary.js";
import { logger } from "../config/logger.js";
import type { UploadApiResponse } from "cloudinary";

interface UploadOptions {
  folder: string;
  publicId?: string;
  resourceType: "image" | "video" | "raw" | "auto";
}

interface UploadResult {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  bytes: number;
  format: string;
}

/**
 * Upload a file buffer to Cloudinary via stream.
 * No files are stored locally — buffer goes directly to Cloudinary.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: UploadOptions
): Promise<UploadResult> {
  return new Promise<UploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: options.resourceType,
        use_filename: true,
        unique_filename: true,
      },
      (error, result?: UploadApiResponse) => {
        if (error) {
          logger.error({ error }, "Cloudinary upload failed");
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload returned no result"));
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          resourceType: result.resource_type,
          bytes: result.bytes,
          format: result.format,
        });
      }
    );

    // Convert buffer to readable stream and pipe to upload
    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
}

/**
 * Delete a file from Cloudinary by its public ID.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw"
): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    logger.info({ publicId, result }, "File deleted from Cloudinary");
  } catch (error) {
    logger.error({ error, publicId }, "Failed to delete from Cloudinary");
    throw error;
  }
}

/**
 * Generate a signed download URL for a file stored in Cloudinary.
 * The URL expires after the specified duration (default: 1 hour).
 */
export function getSignedDownloadUrl(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw",
  _filename?: string
): string {
  const ext = publicId.includes(".") ? publicId.split(".").pop() || "" : "";
  return cloudinary.utils.private_download_url(publicId, ext, {
    resource_type: resourceType,
    type: "upload",
    attachment: true,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });
}

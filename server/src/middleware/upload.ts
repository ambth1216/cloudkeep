import multer from "multer";

import { env } from "../config/env.js";

/**
 * Multer middleware configured with memory storage.
 * Files are buffered in memory (Buffer), NOT saved to disk,
 * then streamed directly to Cloudinary.
 */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // 50 MB default
  },
});

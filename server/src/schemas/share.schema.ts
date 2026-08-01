import { z } from "zod";

export const createShareSchema = z.object({
  fileId: z
    .string()
    .uuid("Invalid file ID"),
  expiresInDays: z
    .number()
    .int()
    .min(1, "Expiry must be at least 1 day")
    .max(90, "Expiry must not exceed 90 days")
    .optional()
    .default(7),
});

export type CreateShareInput = z.infer<typeof createShareSchema>;

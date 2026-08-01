import { z } from "zod";

export const renameFileSchema = z.object({
  name: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must not exceed 255 characters")
    .trim(),
});

export const moveFileSchema = z.object({
  folderId: z
    .string()
    .uuid("Invalid folder ID")
    .nullable(),
});

export const copyFileSchema = z.object({
  folderId: z
    .string()
    .uuid("Invalid folder ID")
    .nullable()
    .optional(),
});

export type RenameFileInput = z.infer<typeof renameFileSchema>;
export type MoveFileInput = z.infer<typeof moveFileSchema>;
export type CopyFileInput = z.infer<typeof copyFileSchema>;

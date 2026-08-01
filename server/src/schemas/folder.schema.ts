import { z } from "zod";

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(255, "Folder name must not exceed 255 characters")
    .trim(),
  parentId: z
    .string()
    .uuid("Invalid parent folder ID")
    .nullable()
    .optional(),
});

export const renameFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(255, "Folder name must not exceed 255 characters")
    .trim(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type RenameFolderInput = z.infer<typeof renameFolderSchema>;

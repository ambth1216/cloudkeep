import type { Request, Response } from "express";

import * as folderService from "../services/folder.service.js";
import type {
  CreateFolderInput,
  RenameFolderInput,
} from "../schemas/folder.schema.js";

/**
 * GET /api/folders
 */
export async function listFolders(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const parentId = (req.query["parentId"] as string | undefined) ?? null;

  const folders = await folderService.listFolders(userId, parentId);

  res.status(200).json({
    success: true,
    data: folders,
  });
}

/**
 * GET /api/folders/:id
 */
export async function getFolder(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const folderId = req.params.id as string;

  const folder = await folderService.getFolderById(userId, folderId);

  res.status(200).json({
    success: true,
    data: folder,
  });
}

/**
 * POST /api/folders
 */
export async function createFolder(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const input = req.body as CreateFolderInput;

  const folder = await folderService.createFolder(userId, input);

  res.status(201).json({
    success: true,
    message: "Folder created successfully",
    data: folder,
  });
}

/**
 * PATCH /api/folders/:id/rename
 */
export async function renameFolder(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const folderId = req.params.id as string;
  const input = req.body as RenameFolderInput;

  const folder = await folderService.renameFolder(userId, folderId, input);

  res.status(200).json({
    success: true,
    message: "Folder renamed successfully",
    data: folder,
  });
}

/**
 * DELETE /api/folders/:id
 */
export async function deleteFolder(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const folderId = req.params.id as string;

  const result = await folderService.deleteFolder(userId, folderId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
}

/**
 * POST /api/folders/:id/restore
 */
export async function restoreFolder(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const folderId = req.params.id as string;

  const result = await folderService.restoreFolder(userId, folderId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
}

/**
 * GET /api/folders/:id/breadcrumb
 */
export async function getBreadcrumb(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const folderId = req.params.id as string;

  const breadcrumb = await folderService.getBreadcrumb(userId, folderId);

  res.status(200).json({
    success: true,
    data: breadcrumb,
  });
}

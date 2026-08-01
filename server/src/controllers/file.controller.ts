import type { Request, Response } from "express";

import * as fileService from "../services/file.service.js";
import { BadRequestError } from "../utils/errors.js";
import type {
  RenameFileInput,
  MoveFileInput,
  CopyFileInput,
} from "../schemas/file.schema.js";

/**
 * GET /api/files
 */
export async function listFiles(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const folderId = req.query["folderId"] as string | undefined;
  const page = parseInt(req.query["page"] as string) || 1;
  const limit = parseInt(req.query["limit"] as string) || 20;

  const result = await fileService.listFiles(userId, folderId, page, limit);

  res.status(200).json({
    success: true,
    data: result.files,
    pagination: result.pagination,
  });
}

/**
 * GET /api/files/trash
 */
export async function listTrashedFiles(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const page = parseInt(req.query["page"] as string) || 1;
  const limit = parseInt(req.query["limit"] as string) || 20;

  const result = await fileService.listTrashedFiles(userId, page, limit);

  res.status(200).json({
    success: true,
    data: result.files,
    pagination: result.pagination,
  });
}

/**
 * GET /api/files/:id
 */
export async function getFile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const fileId = req.params.id as string;

  const file = await fileService.getFileById(userId, fileId);

  res.status(200).json({
    success: true,
    data: file,
  });
}

/**
 * POST /api/files/upload
 */
export async function uploadFile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  if (!req.file) {
    throw new BadRequestError("No file provided");
  }

  const folderId = (req.body as { folderId?: string }).folderId || null;

  const file = await fileService.uploadFile(userId, req.file, folderId);

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: file,
  });
}

/**
 * GET /api/files/:id/download
 */
export async function downloadFile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const fileId = req.params.id as string;

  const result = await fileService.getDownloadFileBuffer(userId, fileId);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(result.filename)}"`
  );
  res.setHeader("Content-Type", result.mimeType || "application/octet-stream");
  res.setHeader("Content-Length", result.buffer.length);

  res.status(200).send(result.buffer);
}

/**
 * PATCH /api/files/:id/rename
 */
export async function renameFile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const fileId = req.params.id as string;
  const input = req.body as RenameFileInput;

  const file = await fileService.renameFile(userId, fileId, input);

  res.status(200).json({
    success: true,
    message: "File renamed successfully",
    data: file,
  });
}

/**
 * DELETE /api/files/:id
 */
export async function deleteFile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const fileId = req.params.id as string;

  const result = await fileService.softDeleteFile(userId, fileId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
}

/**
 * POST /api/files/:id/restore
 */
export async function restoreFile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const fileId = req.params.id as string;

  const result = await fileService.restoreFile(userId, fileId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
}

/**
 * DELETE /api/files/:id/permanent
 */
export async function permanentDeleteFile(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const fileId = req.params.id as string;

  const result = await fileService.permanentDeleteFile(userId, fileId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
}

/**
 * POST /api/files/:id/move
 */
export async function moveFile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const fileId = req.params.id as string;
  const input = req.body as MoveFileInput;

  const file = await fileService.moveFile(userId, fileId, input);

  res.status(200).json({
    success: true,
    message: "File moved successfully",
    data: file,
  });
}

/**
 * POST /api/files/:id/copy
 */
export async function copyFile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const fileId = req.params.id as string;
  const input = req.body as CopyFileInput;

  const file = await fileService.copyFile(userId, fileId, input?.folderId);

  res.status(201).json({
    success: true,
    message: "File copied successfully",
    data: file,
  });
}

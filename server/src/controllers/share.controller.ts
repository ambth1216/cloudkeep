import type { Request, Response } from "express";

import * as shareService from "../services/share.service.js";
import type { CreateShareInput } from "../schemas/share.schema.js";

/**
 * POST /api/share
 */
export async function createShareLink(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const input = req.body as CreateShareInput;

  const link = await shareService.createShareLink(userId, input);

  res.status(201).json({
    success: true,
    message: "Share link created successfully",
    data: link,
  });
}

/**
 * GET /api/share
 */
export async function listSharedLinks(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;

  const links = await shareService.listSharedLinks(userId);

  res.status(200).json({
    success: true,
    data: links,
  });
}

/**
 * DELETE /api/share/:id
 */
export async function revokeShareLink(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const linkId = req.params.id as string;

  const result = await shareService.revokeShareLink(userId, linkId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
}

/**
 * GET /api/share/public/:token (no auth required)
 */
export async function accessSharedFile(
  req: Request,
  res: Response
): Promise<void> {
  const token = req.params.token as string;

  const result = await shareService.accessSharedFileBuffer(token);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(result.filename)}"`
  );
  res.setHeader("Content-Type", result.mimeType || "application/octet-stream");
  res.setHeader("Content-Length", result.buffer.length);

  res.status(200).send(result.buffer);
}

import type { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";

import { logger } from "../config/logger.js";
import { AppError } from "../utils/errors.js";
import type { ApiErrorResponse } from "../types/index.js";

/**
 * Global error handling middleware.
 * Handles AppError, Prisma errors, Multer errors, Zod validation errors,
 * and unknown errors.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Custom AppError ──
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err, url: req.url, method: req.method }, "Non-operational error");
    }

    const response: ApiErrorResponse = {
      success: false,
      message: err.message,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // ── Zod validation error ──
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "body";
      if (!errors[key]) {
        errors[key] = [];
      }
      errors[key].push(issue.message);
    }

    const response: ApiErrorResponse = {
      success: false,
      message: "Validation failed",
      errors,
    };

    res.status(400).json(response);
    return;
  }

  // ── Multer errors ──
  if (err instanceof MulterError) {
    let message = "File upload error";
    let statusCode = 400;

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File size exceeds the maximum allowed limit of 50 MB";
        statusCode = 413;
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files uploaded";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field";
        break;
    }

    const response: ApiErrorResponse = {
      success: false,
      message,
    };

    res.status(statusCode).json(response);
    return;
  }

  // ── Prisma known request errors ──
  if (err.constructor?.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as Error & { code: string; meta?: { target?: string[] } };

    let message = "Database error";
    let statusCode = 400;

    if (prismaErr.code === "P2002") {
      const target = prismaErr.meta?.target?.join(", ") ?? "field";
      message = `A record with this ${target} already exists`;
      statusCode = 409;
    } else if (prismaErr.code === "P2025") {
      message = "Record not found";
      statusCode = 404;
    }

    const response: ApiErrorResponse = {
      success: false,
      message,
    };

    res.status(statusCode).json(response);
    return;
  }

  // ── Unknown errors ──
  logger.error({ err, url: req.url, method: req.method }, "Unhandled error");

  const response: ApiErrorResponse = {
    success: false,
    message:
      process.env["NODE_ENV"] === "development"
        ? err.message
        : "Internal server error",
  };

  res.status(500).json(response);
}

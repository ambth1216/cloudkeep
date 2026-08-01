import type { Request, Response, NextFunction } from "express";

import { UnauthorizedError } from "../utils/errors.js";
import { verifyToken } from "../utils/token.js";

/**
 * JWT authentication middleware.
 * Extracts token from Authorization header (Bearer <token>),
 * verifies it, and attaches user payload to req.user.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (typeof req.query["token"] === "string") {
    token = req.query["token"];
  }

  if (!token) {
    throw new UnauthorizedError("Missing or invalid authorization header");
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

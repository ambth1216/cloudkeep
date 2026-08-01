import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export interface TokenPayload {
  id: string;
  email: string;
}

/**
 * Generate a JWT access token (24h expiry).
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "24h" });
}

/**
 * Verify and decode a JWT token.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

import type { Request, Response } from "express";

import * as authService from "../services/auth.service.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  const input = req.body as RegisterInput;
  const result = await authService.register(input);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: result,
  });
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginInput;
  const result = await authService.login(input);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
}

/**
 * POST /api/auth/logout
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  // JWT is stateless — logout is handled client-side by removing the token.
  // This endpoint exists for API completeness.
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const user = await authService.getProfile(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
}

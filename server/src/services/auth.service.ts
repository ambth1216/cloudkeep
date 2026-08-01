import bcrypt from "bcrypt";

import { prisma } from "../config/database.js";
import { ConflictError, UnauthorizedError } from "../utils/errors.js";
import { generateToken } from "../utils/token.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";

const SALT_ROUNDS = 12;

/**
 * Register a new user.
 * Hashes the password and creates a user record.
 * Returns the user data and a JWT token.
 */
export async function register(input: RegisterInput) {
  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      storageUsed: true,
      storageLimit: true,
      createdAt: true,
    },
  });

  const token = generateToken({ id: user.id, email: user.email });

  return {
    user: {
      ...user,
      storageUsed: Number(user.storageUsed),
      storageLimit: Number(user.storageLimit),
    },
    token,
  };
}

/**
 * Login a user.
 * Verifies email and password, returns user data and JWT token.
 */
export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      storageUsed: true,
      storageLimit: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = generateToken({ id: user.id, email: user.email });

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: {
      ...userWithoutPassword,
      storageUsed: Number(userWithoutPassword.storageUsed),
      storageLimit: Number(userWithoutPassword.storageLimit),
    },
    token,
  };
}

/**
 * Get the current user's profile.
 */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      storageUsed: true,
      storageLimit: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  return {
    ...user,
    storageUsed: Number(user.storageUsed),
    storageLimit: Number(user.storageLimit),
  };
}

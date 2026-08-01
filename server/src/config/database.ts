import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

import { env } from "./env.js";

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

/**
 * Gracefully disconnect Prisma and close the pg pool.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  await pool.end();
}

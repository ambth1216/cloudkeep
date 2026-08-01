import { prisma } from "../config/database.js";
import type { Prisma } from "@prisma/client";
import type { ActivityAction, EntityType } from "../types/index.js";

/**
 * Log a user activity to the ActivityLog table.
 */
export async function logActivity(
  userId: string,
  action: ActivityAction,
  entityType: EntityType,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });
}

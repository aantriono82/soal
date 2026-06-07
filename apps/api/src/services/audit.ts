import { db } from "../db/client";
import { auditLogs } from "../db/schema";

export async function logAudit(input: {
  userId?: number | null;
  action: string;
  entityType: string;
  entityId: string | number;
  metadata?: unknown;
}) {
  await db.insert(auditLogs).values({
    userId: input.userId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: String(input.entityId),
    metadata: JSON.stringify(input.metadata ?? {})
  });
}

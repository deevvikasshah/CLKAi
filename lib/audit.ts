import { prisma } from "@/lib/prisma";

interface AuditInput {
  actorUserId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

/**
 * Writes an immutable audit trail entry. Call this for every sensitive
 * action listed in the security brief: logins, failed logins, role
 * changes, store publish/unpublish, price changes, offer changes, policy
 * updates, data exports, refunds, repair-status changes, user
 * activation/deactivation.
 */
export async function writeAuditLog(input: AuditInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      ipAddress: input.ipAddress ?? null,
    },
  });
}

import { prisma } from "@/lib/prisma";
import { getSession, type SessionPayload } from "@/lib/auth";
import { ROLES } from "@/lib/roles";

export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError("Not signed in.");
  return session;
}

export async function requireRole(...roles: string[]): Promise<SessionPayload> {
  const session = await requireSession();
  if (!roles.includes(session.role)) {
    throw new ForbiddenError("You do not have permission to perform this action.");
  }
  return session;
}

/**
 * Enforces that a Store Manager can only act on their own assigned store(s).
 * Super Admin and Ops Admin bypass the scoping check. This is the control
 * that prevents one store's manager from reading/editing another store's
 * data (IDOR) — call it on every store-scoped admin route, not just the
 * store CRUD ones (repair bookings, enquiries, inventory, etc. too).
 */
export async function requireStoreAccess(storeId: string): Promise<SessionPayload> {
  const session = await requireSession();

  if (session.role === ROLES.SUPER_ADMIN || session.role === ROLES.OPS_ADMIN) {
    return session;
  }

  if (session.role !== ROLES.STORE_MANAGER) {
    throw new ForbiddenError("This action is restricted to store staff.");
  }

  const assignment = await prisma.storeAssignment.findUnique({
    where: { userId_storeId: { userId: session.userId, storeId } },
  });

  if (!assignment) {
    throw new ForbiddenError("You are not assigned to this store.");
  }

  return session;
}

export async function getAssignedStoreIds(userId: string): Promise<string[]> {
  const assignments = await prisma.storeAssignment.findMany({
    where: { userId },
    select: { storeId: true },
  });
  return assignments.map((a) => a.storeId);
}

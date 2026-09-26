"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getAssignedStoreIds } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { repairStatusFlow } from "@/lib/repairConstants";

async function assertCanManageBooking(bookingId: string) {
  const session = await getSession();
  if (!session) throw new Error("Not signed in.");

  const booking = await prisma.repairBooking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Repair booking not found.");

  if (session.role === ROLES.SUPER_ADMIN || session.role === ROLES.OPS_ADMIN || session.role === ROLES.REPAIR_MANAGER) {
    return { session, booking };
  }

  if (session.role === ROLES.STORE_MANAGER) {
    const assigned = await getAssignedStoreIds(session.userId);
    if (!assigned.includes(booking.storeId)) throw new Error("You do not have access to this repair booking.");
    return { session, booking };
  }

  throw new Error("You do not have permission to manage repair bookings.");
}

export async function updateRepairStatus(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").slice(0, 1000);
  const estimateAmount = formData.get("estimateAmount");
  const diagnosticFee = formData.get("diagnosticFee");
  const warrantyPeriodText = formData.get("warrantyPeriodText");

  if (!(repairStatusFlow as readonly string[]).includes(status)) throw new Error("Invalid status.");

  const { session } = await assertCanManageBooking(bookingId);

  await prisma.repairBooking.update({
    where: { id: bookingId },
    data: {
      status,
      estimateAmount: estimateAmount ? Number(estimateAmount) : undefined,
      diagnosticFee: diagnosticFee ? Number(diagnosticFee) : undefined,
      warrantyPeriodText: warrantyPeriodText ? String(warrantyPeriodText) : undefined,
    },
  });

  await prisma.repairStatusHistory.create({
    data: { repairBookingId: bookingId, status, note: note || null, changedByUserId: session.userId },
  });

  await writeAuditLog({
    actorUserId: session.userId,
    action: "repair.status_change",
    entityType: "RepairBooking",
    entityId: bookingId,
    metadata: { status },
  });

  revalidatePath(`/admin/repairs/${bookingId}`);
  revalidatePath("/admin/repairs");
}

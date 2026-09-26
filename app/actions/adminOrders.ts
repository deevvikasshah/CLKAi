"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { ROLES } from "@/lib/roles";

const ORDER_ROLES = [ROLES.SUPER_ADMIN, ROLES.OPS_ADMIN, ROLES.FINANCE_MANAGER];

export async function updateOrderStatus(formData: FormData) {
  const session = await requireRole(...ORDER_ROLES);
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = ["placed", "confirmed", "shipped", "delivered", "cancelled", "return_requested", "returned"];
  if (!allowed.includes(status)) throw new Error("Invalid status.");

  await prisma.order.update({ where: { id: orderId }, data: { status } });
  await writeAuditLog({ actorUserId: session.userId, action: "order.status_change", entityType: "Order", entityId: orderId, metadata: { status } });

  revalidatePath("/admin/orders");
}

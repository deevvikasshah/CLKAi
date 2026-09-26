"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { ROLES } from "@/lib/roles";

const ENQUIRY_ROLES = [ROLES.SUPER_ADMIN, ROLES.OPS_ADMIN, ROLES.SALES_EXECUTIVE, ROLES.SUPPORT_EXECUTIVE];

export async function updateEnquiryStatus(formData: FormData) {
  const session = await requireRole(...ENQUIRY_ROLES);
  const enquiryId = String(formData.get("enquiryId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["new", "in_progress", "closed"].includes(status)) throw new Error("Invalid status.");

  await prisma.enquiry.update({ where: { id: enquiryId }, data: { status, assignedToUserId: session.userId } });
  await writeAuditLog({ actorUserId: session.userId, action: "enquiry.status_change", entityType: "Enquiry", entityId: enquiryId, metadata: { status } });

  revalidatePath("/admin/enquiries");
}

export async function updateCorporateEnquiryStatus(formData: FormData) {
  const session = await requireRole(...ENQUIRY_ROLES);
  const enquiryId = String(formData.get("enquiryId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["new", "in_progress", "closed"].includes(status)) throw new Error("Invalid status.");

  await prisma.corporateEnquiry.update({ where: { id: enquiryId }, data: { status } });
  await writeAuditLog({ actorUserId: session.userId, action: "corporate_enquiry.status_change", entityType: "CorporateEnquiry", entityId: enquiryId, metadata: { status } });

  revalidatePath("/admin/enquiries");
}

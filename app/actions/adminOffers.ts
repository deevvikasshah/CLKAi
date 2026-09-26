"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { ROLES } from "@/lib/roles";

const OFFER_ROLES = [ROLES.SUPER_ADMIN, ROLES.OPS_ADMIN];

const offerSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  scopeType: z.enum(["product", "brand", "store", "seasonal", "bank", "exchange"]),
  termsText: z.string().min(1, "Terms and conditions are required for every offer."),
  startsAt: z.string().min(1, "Start date is required."),
  endsAt: z.string().min(1, "End date is required."),
});

export async function createOffer(formData: FormData) {
  const session = await requireRole(...OFFER_ROLES);

  const parsed = offerSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    scopeType: formData.get("scopeType"),
    termsText: formData.get("termsText"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the offer details.");
  const data = parsed.data;

  const startsAt = new Date(data.startsAt);
  const endsAt = new Date(data.endsAt);
  if (endsAt <= startsAt) throw new Error("End date must be after the start date.");

  const offer = await prisma.offer.create({
    data: {
      title: data.title,
      description: data.description || null,
      scopeType: data.scopeType,
      termsText: data.termsText,
      startsAt,
      endsAt,
      active: true,
    },
  });

  await writeAuditLog({ actorUserId: session.userId, action: "offer.create", entityType: "Offer", entityId: offer.id });
  revalidatePath("/admin/offers");
  revalidatePath("/offers");
}

export async function deactivateOffer(formData: FormData) {
  const session = await requireRole(...OFFER_ROLES);
  const offerId = String(formData.get("offerId") ?? "");

  await prisma.offer.update({ where: { id: offerId }, data: { active: false } });
  await writeAuditLog({ actorUserId: session.userId, action: "offer.deactivate", entityType: "Offer", entityId: offerId });

  revalidatePath("/admin/offers");
  revalidatePath("/offers");
}

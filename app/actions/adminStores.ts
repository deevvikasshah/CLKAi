"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, requireStoreAccess } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { ROLES } from "@/lib/roles";
import { storeAdminSchema, storeManagerEditableSchema, slugify } from "@/lib/storeValidation";

function readServices(formData: FormData): string[] {
  return formData.getAll("services").map(String);
}

function toFormObject(formData: FormData) {
  return {
    storeName: formData.get("storeName"),
    storeCode: formData.get("storeCode"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2") || undefined,
    locality: formData.get("locality") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || "",
    mapUrl: formData.get("mapUrl") || "",
    storeManagerName: formData.get("storeManagerName") || undefined,
    pickupAvailable: formData.get("pickupAvailable") || undefined,
    repairAvailable: formData.get("repairAvailable") || undefined,
    corporateSupportAvailable: formData.get("corporateSupportAvailable") || undefined,
    operationalState: formData.get("operationalState"),
    services: readServices(formData),
  };
}

export async function createStore(formData: FormData) {
  const session = await requireRole(ROLES.SUPER_ADMIN, ROLES.OPS_ADMIN);

  const parsed = storeAdminSchema.safeParse(toFormObject(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Please check the store details.");
  }
  const data = parsed.data;
  const slug = slugify(data.storeName);

  const [dupeName, dupeCode, dupeSlug] = await Promise.all([
    prisma.store.findFirst({ where: { storeName: data.storeName } }),
    prisma.store.findUnique({ where: { storeCode: data.storeCode } }),
    prisma.store.findUnique({ where: { slug } }),
  ]);
  if (dupeName) throw new Error("A store with this name already exists.");
  if (dupeCode) throw new Error("A store with this store code already exists.");
  if (dupeSlug) throw new Error("A store with this name (slug) already exists. Try a more specific name.");

  const store = await prisma.store.create({
    data: {
      storeName: data.storeName,
      slug,
      storeCode: data.storeCode,
      status: "draft",
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || null,
      locality: data.locality || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      mapUrl: data.mapUrl || null,
      storeManagerName: data.storeManagerName || null,
      pickupAvailable: data.pickupAvailable === "on",
      repairAvailable: data.repairAvailable === "on",
      corporateSupportAvailable: data.corporateSupportAvailable === "on",
      operationalState: data.operationalState,
      servicesJson: JSON.stringify(data.services ?? []),
      isVerified: false,
    },
  });

  await writeAuditLog({ actorUserId: session.userId, action: "store.create", entityType: "Store", entityId: store.id });
  revalidatePath("/admin/stores");
  redirect(`/admin/stores/${store.id}`);
}

export async function updateStore(formData: FormData) {
  const storeId = String(formData.get("storeId") ?? "");
  if (!storeId) throw new Error("Missing store id.");

  const session = await requireStoreAccess(storeId);
  const isFullAdmin = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.OPS_ADMIN;

  if (isFullAdmin) {
    const parsed = storeAdminSchema.safeParse(toFormObject(formData));
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the store details.");
    const data = parsed.data;

    const dupeName = await prisma.store.findFirst({ where: { storeName: data.storeName, id: { not: storeId } } });
    if (dupeName) throw new Error("A store with this name already exists.");
    const dupeCode = await prisma.store.findFirst({ where: { storeCode: data.storeCode, id: { not: storeId } } });
    if (dupeCode) throw new Error("A store with this store code already exists.");

    await prisma.store.update({
      where: { id: storeId },
      data: {
        storeName: data.storeName,
        storeCode: data.storeCode,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        locality: data.locality || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        mapUrl: data.mapUrl || null,
        storeManagerName: data.storeManagerName || null,
        pickupAvailable: data.pickupAvailable === "on",
        repairAvailable: data.repairAvailable === "on",
        corporateSupportAvailable: data.corporateSupportAvailable === "on",
        operationalState: data.operationalState,
        servicesJson: JSON.stringify(data.services ?? []),
      },
    });
  } else {
    // Store Manager: operational fields only (enforced by the schema itself
    // accepting a narrower field set — address/name/code cannot be sent).
    const parsed = storeManagerEditableSchema.safeParse({
      phone: formData.get("phone") || undefined,
      whatsapp: formData.get("whatsapp") || undefined,
      email: formData.get("email") || "",
      storeManagerName: formData.get("storeManagerName") || undefined,
      operationalState: formData.get("operationalState"),
      services: readServices(formData),
      pickupAvailable: formData.get("pickupAvailable") || undefined,
      repairAvailable: formData.get("repairAvailable") || undefined,
      corporateSupportAvailable: formData.get("corporateSupportAvailable") || undefined,
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the store details.");
    const data = parsed.data;

    await prisma.store.update({
      where: { id: storeId },
      data: {
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        storeManagerName: data.storeManagerName || null,
        pickupAvailable: data.pickupAvailable === "on",
        repairAvailable: data.repairAvailable === "on",
        corporateSupportAvailable: data.corporateSupportAvailable === "on",
        operationalState: data.operationalState,
        servicesJson: JSON.stringify(data.services ?? []),
      },
    });
  }

  await writeAuditLog({ actorUserId: session.userId, action: "store.update", entityType: "Store", entityId: storeId });
  revalidatePath(`/admin/stores/${storeId}`);
  revalidatePath("/admin/stores");
}

export async function publishStore(formData: FormData) {
  const storeId = String(formData.get("storeId") ?? "");
  const session = await requireRole(ROLES.SUPER_ADMIN);

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Store not found.");
  if (!store.addressLine1 || !store.city || !store.state || !store.pincode) {
    throw new Error("Address, city, state and pincode are required before publishing.");
  }

  await prisma.store.update({ where: { id: storeId }, data: { status: "published" } });
  await writeAuditLog({ actorUserId: session.userId, action: "store.publish", entityType: "Store", entityId: storeId });

  revalidatePath("/admin/stores");
  revalidatePath(`/admin/stores/${storeId}`);
  revalidatePath("/stores");
  revalidatePath("/");
}

export async function unpublishStore(formData: FormData) {
  const storeId = String(formData.get("storeId") ?? "");
  const session = await requireRole(ROLES.SUPER_ADMIN);

  await prisma.store.update({ where: { id: storeId }, data: { status: "draft" } });
  await writeAuditLog({ actorUserId: session.userId, action: "store.unpublish", entityType: "Store", entityId: storeId });

  revalidatePath("/admin/stores");
  revalidatePath(`/admin/stores/${storeId}`);
  revalidatePath("/stores");
  revalidatePath("/");
}

export async function markStoreVerified(formData: FormData) {
  const storeId = String(formData.get("storeId") ?? "");
  const session = await requireRole(ROLES.SUPER_ADMIN, ROLES.OPS_ADMIN);

  await prisma.store.update({ where: { id: storeId }, data: { isVerified: true } });
  await writeAuditLog({ actorUserId: session.userId, action: "store.mark_verified", entityType: "Store", entityId: storeId });

  revalidatePath(`/admin/stores/${storeId}`);
  revalidatePath("/stores");
}

export async function archiveStore(formData: FormData) {
  const storeId = String(formData.get("storeId") ?? "");
  const session = await requireRole(ROLES.SUPER_ADMIN, ROLES.OPS_ADMIN);

  await prisma.store.update({ where: { id: storeId }, data: { status: "archived" } });
  await writeAuditLog({ actorUserId: session.userId, action: "store.archive", entityType: "Store", entityId: storeId });

  revalidatePath("/admin/stores");
  revalidatePath("/stores");
}

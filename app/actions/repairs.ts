"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rateLimit";
import { deviceTypes, issueTypes, serviceModes } from "@/lib/repairConstants";

const schema = z.object({
  deviceType: z.enum(deviceTypes.map((d) => d.value) as [string, ...string[]]),
  brand: z.string().optional(),
  model: z.string().optional(),
  issueType: z.enum(issueTypes.map((i) => i.value) as [string, ...string[]]),
  issueDescription: z.string().max(2000).optional(),
  storeId: z.string().min(1, "Please select a store."),
  serviceMode: z.enum(serviceModes.map((s) => s.value) as [string, ...string[]]),
  customerName: z.string().min(1, "Name is required."),
  customerPhone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number."),
  customerEmail: z.string().email().optional().or(z.literal("")),
  consentDataDiagnostics: z.literal("on", {
    errorMap: () => ({ message: "Please confirm the data-diagnostics consent to proceed." }),
  }),
});

function generateReferenceNumber(): string {
  return `RPR${Date.now().toString(36).toUpperCase()}${nanoid(4).toUpperCase()}`;
}

export async function bookRepair(formData: FormData) {
  const ip = getClientIp(headers());
  const limited = rateLimit(`repair:${ip}`, RATE_LIMITS.REPAIR_BOOKING.limit, RATE_LIMITS.REPAIR_BOOKING.windowMs);
  if (!limited.allowed) {
    throw new Error("Too many repair requests from this connection. Please wait a minute and try again.");
  }

  const parsed = schema.safeParse({
    deviceType: formData.get("deviceType"),
    brand: formData.get("brand") || undefined,
    model: formData.get("model") || undefined,
    issueType: formData.get("issueType"),
    issueDescription: formData.get("issueDescription") || undefined,
    storeId: formData.get("storeId"),
    serviceMode: formData.get("serviceMode"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail") || "",
    consentDataDiagnostics: formData.get("consentDataDiagnostics"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Please check the repair booking details.");
  }

  const store = await prisma.store.findUnique({ where: { id: parsed.data.storeId } });
  if (!store || store.status !== "published" || !store.repairAvailable) {
    throw new Error("The selected store is not currently accepting repair bookings.");
  }

  if (parsed.data.serviceMode === "pickup_drop") {
    const services: string[] = store.servicesJson ? JSON.parse(store.servicesJson) : [];
    if (!services.includes("pickup_drop")) {
      throw new Error("Pickup and drop is not available at the selected store. Please choose another option.");
    }
  }

  const referenceNumber = generateReferenceNumber();

  const booking = await prisma.repairBooking.create({
    data: {
      referenceNumber,
      deviceType: parsed.data.deviceType,
      brand: parsed.data.brand,
      model: parsed.data.model,
      issueType: parsed.data.issueType,
      issueDescription: parsed.data.issueDescription,
      storeId: parsed.data.storeId,
      serviceMode: parsed.data.serviceMode,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || null,
      consentDataDiagnostics: true,
      status: "request_received",
    },
  });

  await prisma.repairStatusHistory.create({
    data: { repairBookingId: booking.id, status: "request_received", note: "Repair request submitted online." },
  });

  await prisma.consentRecord.create({
    data: {
      purpose: "repair_diagnostics",
      policyVersion: "v0-draft",
      sourcePage: "/repairs",
      customerIdentifier: parsed.data.customerPhone,
      consentGiven: true,
    },
  });

  // Reference number only — the phone number stays out of the URL (and
  // therefore browser history / referrer headers / server access logs).
  // The customer re-enters it once on the tracking page to view status.
  redirect(`/track-repair?ref=${referenceNumber}&justBooked=1`);
}

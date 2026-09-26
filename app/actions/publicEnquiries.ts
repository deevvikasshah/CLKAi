"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rateLimit";
import { siteConfig } from "@/lib/siteConfig";

const corporateSchema = z.object({
  organisationName: z.string().min(1, "Organisation name is required."),
  contactPerson: z.string().min(1, "Contact person is required."),
  workEmail: z.string().email("Enter a valid work email."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number."),
  city: z.string().min(1, "City is required."),
  gstin: z.string().optional(),
  productCategory: z.string().min(1, "Product category is required."),
  preferredBrands: z.string().optional(),
  approxQuantity: z.string().optional(),
  budgetRange: z.string().optional(),
  requiredDeliveryDate: z.string().optional(),
  requirementDescription: z.string().min(1, "Please describe your requirement."),
  consentFollowUp: z.literal("on").optional(),
});

export async function submitCorporateEnquiry(formData: FormData) {
  const ip = getClientIp(headers());
  const limited = rateLimit(`corporate-enquiry:${ip}`, RATE_LIMITS.CONTACT_FORM.limit, RATE_LIMITS.CONTACT_FORM.windowMs);
  if (!limited.allowed) throw new Error("Too many requests. Please wait a minute and try again.");

  const parsed = corporateSchema.safeParse({
    organisationName: formData.get("organisationName"),
    contactPerson: formData.get("contactPerson"),
    workEmail: formData.get("workEmail"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    gstin: formData.get("gstin") || undefined,
    productCategory: formData.get("productCategory"),
    preferredBrands: formData.get("preferredBrands") || undefined,
    approxQuantity: formData.get("approxQuantity") || undefined,
    budgetRange: formData.get("budgetRange") || undefined,
    requiredDeliveryDate: formData.get("requiredDeliveryDate") || undefined,
    requirementDescription: formData.get("requirementDescription"),
    consentFollowUp: formData.get("consentFollowUp") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the enquiry details.");
  const data = parsed.data;

  await prisma.corporateEnquiry.create({
    data: {
      organisationName: data.organisationName,
      contactPerson: data.contactPerson,
      workEmail: data.workEmail,
      phone: data.phone,
      city: data.city,
      gstin: data.gstin || null,
      productCategory: data.productCategory,
      preferredBrands: data.preferredBrands || null,
      approxQuantity: data.approxQuantity || null,
      budgetRange: data.budgetRange || null,
      requiredDeliveryDate: data.requiredDeliveryDate ? new Date(data.requiredDeliveryDate) : null,
      requirementDescription: data.requirementDescription,
      consentFollowUp: data.consentFollowUp === "on",
    },
  });

  await prisma.consentRecord.create({
    data: {
      purpose: "corporate_enquiry_follow_up",
      policyVersion: siteConfig.policyVersion,
      sourcePage: "/corporate",
      customerIdentifier: data.workEmail,
      consentGiven: data.consentFollowUp === "on",
    },
  });

  redirect("/corporate?submitted=1");
}

const contactSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().optional(),
  message: z.string().min(1, "Please enter a message."),
  marketingConsent: z.literal("on").optional(),
});

export async function submitContactForm(formData: FormData) {
  const ip = getClientIp(headers());
  const limited = rateLimit(`contact-form:${ip}`, RATE_LIMITS.CONTACT_FORM.limit, RATE_LIMITS.CONTACT_FORM.windowMs);
  if (!limited.allowed) throw new Error("Too many requests. Please wait a minute and try again.");

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
    marketingConsent: formData.get("marketingConsent") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the form.");
  const data = parsed.data;

  await prisma.enquiry.create({
    data: {
      name: data.name,
      phone: data.phone || "",
      email: data.email,
      message: data.message,
      sourcePage: "/contact",
      type: "contact",
      consentMarketing: data.marketingConsent === "on",
    },
  });

  await prisma.consentRecord.create({
    data: {
      purpose: "marketing",
      policyVersion: siteConfig.policyVersion,
      sourcePage: "/contact",
      customerIdentifier: data.email,
      consentGiven: data.marketingConsent === "on",
    },
  });

  redirect("/contact?submitted=1");
}

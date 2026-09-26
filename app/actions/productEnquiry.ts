"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rateLimit";

const schema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  name: z.string().min(1, "Name is required."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number."),
  message: z.string().optional(),
});

export async function submitProductEnquiry(formData: FormData) {
  const ip = getClientIp(headers());
  const limited = rateLimit(`product-enquiry:${ip}`, RATE_LIMITS.PRODUCT_ENQUIRY.limit, RATE_LIMITS.PRODUCT_ENQUIRY.windowMs);
  if (!limited.allowed) throw new Error("Too many requests. Please wait a minute and try again.");

  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the enquiry details.");
  const data = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) throw new Error("Product not found.");

  await prisma.enquiry.create({
    data: {
      name: data.name,
      phone: data.phone,
      message: data.message || null,
      sourcePage: `/product/${data.productSlug}`,
      type: "product",
      productId: data.productId,
      consentMarketing: false,
    },
  });

  redirect(`/product/${data.productSlug}?enquirySubmitted=1`);
}

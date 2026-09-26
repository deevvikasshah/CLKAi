import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rateLimit";
import { siteConfig } from "@/lib/siteConfig";

const schema = z.object({
  email: z.string().email(),
  marketingConsent: z.union([z.literal("on"), z.literal("true")]).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limited = rateLimit(`newsletter:${ip}`, RATE_LIMITS.CONTACT_FORM.limit, RATE_LIMITS.CONTACT_FORM.windowMs);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const form = await req.formData();
  const parsed = schema.safeParse({
    email: form.get("email"),
    marketingConsent: form.get("marketingConsent") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const consentGiven = Boolean(parsed.data.marketingConsent);

  await prisma.consentRecord.create({
    data: {
      purpose: "newsletter_marketing",
      policyVersion: siteConfig.policyVersion,
      sourcePage: "/",
      customerIdentifier: parsed.data.email,
      consentGiven,
    },
  });

  return NextResponse.redirect(new URL("/?subscribed=1", req.url), 303);
}

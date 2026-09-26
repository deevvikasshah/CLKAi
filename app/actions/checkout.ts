"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rateLimit";

const schema = z.object({
  fullName: z.string().min(1, "Name is required."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number."),
  email: z.string().email().optional().or(z.literal("")),
  line1: z.string().min(1, "Address is required."),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
});

function generateOrderNumber(): string {
  return `CLK${Date.now().toString(36).toUpperCase()}${nanoid(4).toUpperCase()}`;
}

export async function placeOrder(formData: FormData) {
  const ip = getClientIp(headers());
  const limited = rateLimit(`checkout:${ip}`, RATE_LIMITS.CHECKOUT.limit, RATE_LIMITS.CHECKOUT.windowMs);
  if (!limited.allowed) {
    throw new Error("Too many checkout attempts. Please wait a minute and try again.");
  }

  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    line1: formData.get("line1"),
    line2: formData.get("line2") || "",
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Please check the delivery details.");
  }

  const cart = await getCartWithItems();
  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  // Recompute prices from the database — never trust client-submitted totals.
  const subtotal = cart.items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const tax = 0; // GST display/calculation is intentionally left at 0 until CLKAi confirms applicable rates and registration.
  const shipping = 0; // Shipping rules are not yet defined by CLKAi.
  const total = subtotal + tax + shipping;

  const session = await getSession();

  const address = session
    ? await prisma.address.create({
        data: {
          userId: session.userId,
          line1: parsed.data.line1,
          line2: parsed.data.line2 || null,
          city: parsed.data.city,
          state: parsed.data.state,
          pincode: parsed.data.pincode,
          phone: parsed.data.phone,
        },
      })
    : null;

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.userId,
      guestEmail: session ? null : parsed.data.email || null,
      guestPhone: session ? null : parsed.data.phone,
      subtotal,
      tax,
      shipping,
      total,
      addressId: address?.id,
      status: "placed",
      items: {
        create: cart.items.map((item) => ({
          variantId: item.variantId,
          productTitleSnapshot: item.variant.product.title,
          quantity: item.quantity,
          price: item.variant.price,
        })),
      },
    },
  });

  const paymentProvider = getPaymentProvider();
  const paymentResult = await paymentProvider.createPaymentIntent({ orderId: order.id, amount: total, currency: "INR" });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: paymentProvider.name,
      providerRefId: paymentResult.providerRefId,
      amount: total,
      status: paymentResult.status,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: paymentResult.status === "captured" ? "paid" : paymentResult.status === "failed" ? "failed" : "authorized",
      paymentProvider: paymentProvider.name,
      paymentRef: paymentResult.providerRefId,
      status: paymentResult.status === "captured" ? "confirmed" : "placed",
    },
  });

  // Clear the cart now that the order has been created.
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  redirect(`/order/${orderNumber}`);
}

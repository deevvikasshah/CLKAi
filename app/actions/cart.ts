"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, getCartIdentity } from "@/lib/cart";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rateLimit";

/**
 * Confirms `itemId` belongs to the caller's own cart before it's mutated —
 * without this, any signed-in user (or guest with a cart cookie) could
 * pass another cart's item id and edit/delete someone else's cart (IDOR).
 */
async function assertOwnsCartItem(itemId: string): Promise<void> {
  const identity = await getCartIdentity();
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item) throw new Error("Cart item not found.");

  const owns = identity.userId
    ? item.cart.userId === identity.userId
    : identity.sessionToken
      ? item.cart.sessionToken === identity.sessionToken
      : false;

  if (!owns) throw new Error("You do not have access to this cart item.");
}

function checkRateLimit(action: string) {
  const ip = getClientIp(headers());
  const result = rateLimit(`cart:${action}:${ip}`, RATE_LIMITS.DEFAULT_API.limit, RATE_LIMITS.DEFAULT_API.windowMs);
  if (!result.allowed) throw new Error("Too many requests. Please slow down.");
}

export async function addToCart(formData: FormData) {
  checkRateLimit("add");

  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  if (!variantId) throw new Error("Missing product variant.");

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw new Error("Product variant not found.");

  const cart = await getOrCreateCart();

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, variantId, quantity },
  });

  revalidatePath("/cart");

  // Only ever redirect to a known internal path we set ourselves (never the
  // raw form value) — an unchecked redirect target would be an open redirect.
  if (formData.get("redirectTo") === "/checkout") {
    redirect("/checkout");
  }
}

export async function updateCartItemQuantity(formData: FormData) {
  checkRateLimit("update");

  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Math.max(0, Number(formData.get("quantity") ?? 1));
  if (!itemId) throw new Error("Missing cart item.");
  await assertOwnsCartItem(itemId);

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => null);
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } }).catch(() => null);
  }

  revalidatePath("/cart");
}

export async function removeCartItem(formData: FormData) {
  checkRateLimit("remove");

  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) throw new Error("Missing cart item.");
  await assertOwnsCartItem(itemId);

  await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => null);
  revalidatePath("/cart");
}

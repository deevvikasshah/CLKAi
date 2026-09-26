import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { nanoid } from "nanoid";

const CART_COOKIE = "clkai_cart";

/**
 * Returns the current cart's identity (logged-in user id, or a guest
 * session token read from cookies) without creating anything — safe to
 * call from Server Components.
 */
export async function getCartIdentity(): Promise<{ userId?: string; sessionToken?: string }> {
  const session = await getSession();
  if (session) return { userId: session.userId };

  const token = cookies().get(CART_COOKIE)?.value;
  return token ? { sessionToken: token } : {};
}

/**
 * Finds or creates the current cart, issuing a guest cart cookie when
 * needed. Only callable from a Server Action or Route Handler (cookie
 * writes are not allowed from Server Components).
 */
export async function getOrCreateCart() {
  const session = await getSession();

  if (session) {
    const existing = await prisma.cart.findFirst({ where: { userId: session.userId } });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId: session.userId } });
  }

  const existingToken = cookies().get(CART_COOKIE)?.value;
  if (existingToken) {
    const existing = await prisma.cart.findUnique({ where: { sessionToken: existingToken } });
    if (existing) return existing;
  }

  const token = nanoid(32);
  cookies().set(CART_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return prisma.cart.create({ data: { sessionToken: token } });
}

export async function getCartWithItems() {
  const identity = await getCartIdentity();
  if (!identity.userId && !identity.sessionToken) return null;

  const cart = await prisma.cart.findFirst({
    where: identity.userId ? { userId: identity.userId } : { sessionToken: identity.sessionToken },
    include: {
      items: {
        include: { variant: { include: { product: { include: { brand: true } } } } },
      },
    },
  });

  return cart;
}

export function computeCartTotals(items: { quantity: number; variant: { price: number } }[]) {
  const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  return { subtotal };
}

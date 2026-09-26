"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getOrCreateWishlist(userId: string) {
  const existing = await prisma.wishlist.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.wishlist.create({ data: { userId } });
}

export async function addToWishlist(formData: FormData) {
  const session = await getSession();
  const productSlug = String(formData.get("productSlug") ?? "");

  if (!session) {
    redirect(`/login?next=/product/${productSlug}`);
  }

  const variantId = String(formData.get("variantId") ?? "");
  if (!variantId) throw new Error("Missing product variant.");

  const wishlist = await getOrCreateWishlist(session.userId);

  await prisma.wishlistItem.upsert({
    where: { wishlistId_variantId: { wishlistId: wishlist.id, variantId } },
    update: {},
    create: { wishlistId: wishlist.id, variantId },
  });

  revalidatePath(`/product/${productSlug}`);
  revalidatePath("/account/wishlist");
}

export async function removeFromWishlist(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) throw new Error("Missing wishlist item.");

  const item = await prisma.wishlistItem.findUnique({ where: { id: itemId }, include: { wishlist: true } });
  if (!item || item.wishlist.userId !== session.userId) {
    throw new Error("You do not have access to this wishlist item.");
  }

  await prisma.wishlistItem.delete({ where: { id: itemId } });
  revalidatePath("/account/wishlist");
}

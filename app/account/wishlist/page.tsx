import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Money } from "@/components/ui/Money";
import { removeFromWishlist } from "@/app/actions/wishlist";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/wishlist");

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.userId },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  const items = wishlist?.items ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Wishlist</h1>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ink-500">You haven&rsquo;t added anything to your wishlist yet.</p>
      ) : (
        <div className="mt-6 divide-y divide-ink-100 rounded-lg border border-ink-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <Link href={`/product/${item.variant.product.slug}`} className="text-sm font-semibold text-ink-900 hover:text-brand-600">
                  {item.variant.product.title}
                </Link>
                <Money amount={item.variant.price} className="mt-1 block text-sm text-ink-700" />
              </div>
              <form action={removeFromWishlist}>
                <input type="hidden" name="itemId" value={item.id} />
                <button type="submit" className="text-xs font-semibold text-ink-500 hover:text-red-600 focus-ring">
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

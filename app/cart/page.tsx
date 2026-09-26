import Link from "next/link";
import { getCartWithItems, computeCartTotals } from "@/lib/cart";
import { Money } from "@/components/ui/Money";
import { updateCartItemQuantity, removeCartItem } from "@/app/actions/cart";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const cart = await getCartWithItems();
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink-900">Your cart is empty</h1>
        <p className="text-sm text-ink-500">Browse the shop to find laptops, smartphones and more.</p>
        <Link
          href="/shop"
          className="mt-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const { subtotal } = computeCartTotals(items);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Your cart</h1>

      <div className="mt-6 divide-y divide-ink-100 rounded-lg border border-ink-100">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-ink-50 text-[10px] text-ink-500">
              Image
            </div>
            <div className="flex-1">
              <Link href={`/product/${item.variant.product.slug}`} className="text-sm font-semibold text-ink-900 hover:text-brand-600">
                {item.variant.product.title}
              </Link>
              <p className="text-xs text-ink-500">
                {item.variant.product.brand.name} · {item.variant.variantName}
              </p>
              <Money amount={item.variant.price} className="mt-1 block text-sm font-semibold text-ink-900" />
            </div>

            <form action={updateCartItemQuantity} className="flex items-center gap-2">
              <input type="hidden" name="itemId" value={item.id} />
              <label htmlFor={`qty-${item.id}`} className="sr-only">
                Quantity
              </label>
              <input
                id={`qty-${item.id}`}
                name="quantity"
                type="number"
                min={1}
                max={10}
                defaultValue={item.quantity}
                className="w-16 rounded-md border border-ink-300 px-2 py-1.5 text-sm focus-ring"
              />
              <button type="submit" className="text-xs font-semibold text-brand-600 hover:text-brand-500 focus-ring">
                Update
              </button>
            </form>

            <form action={removeCartItem}>
              <input type="hidden" name="itemId" value={item.id} />
              <button type="submit" className="text-xs font-semibold text-ink-500 hover:text-red-600 focus-ring">
                Remove
              </button>
            </form>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-end gap-3">
        <div className="flex items-baseline gap-2 text-lg font-bold text-ink-900">
          Subtotal <Money amount={subtotal} />
        </div>
        <p className="text-xs text-ink-500">Tax and shipping are calculated at checkout.</p>
        <Link
          href="/checkout"
          className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

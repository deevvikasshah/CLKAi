import { redirect } from "next/navigation";
import { getCartWithItems, computeCartTotals } from "@/lib/cart";
import { getSession } from "@/lib/auth";
import { Money } from "@/components/ui/Money";
import { placeOrder } from "@/app/actions/checkout";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const cart = await getCartWithItems();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const session = await getSession();
  const { subtotal } = computeCartTotals(cart.items);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <form action={placeOrder} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-ink-900">Delivery details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="fullName" required />
            <Field label="Phone number" name="phone" required inputMode="numeric" placeholder="10-digit mobile number" />
          </div>

          {!session && <Field label="Email (optional)" name="email" type="email" />}

          <Field label="Address line 1" name="line1" required />
          <Field label="Address line 2 (optional)" name="line2" />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" name="city" required />
            <Field label="State" name="state" required />
            <Field label="Pincode" name="pincode" required inputMode="numeric" />
          </div>

          <p className="text-xs text-ink-500">
            Your delivery details are used only to fulfil this order. See our{" "}
            <a href="/policies/privacy" className="underline hover:text-brand-600">
              Privacy Policy
            </a>
            .
          </p>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
          >
            Place order
          </button>
        </form>

        <div className="rounded-lg border border-ink-100 p-5">
          <h2 className="text-sm font-semibold text-ink-900">Order summary</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-700">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="line-clamp-1">
                  {item.variant.product.title} × {item.quantity}
                </span>
                <Money amount={item.variant.price * item.quantity} />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-ink-100 pt-3 text-base font-bold text-ink-900">
            <span>Total</span>
            <Money amount={subtotal} />
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Tax and shipping will be confirmed once CLKAi finalises applicable rates.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring"
        {...rest}
      />
    </div>
  );
}

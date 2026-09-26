import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Money } from "@/components/ui/Money";

export const metadata = { title: "Order confirmation" };

const statusLabels: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return requested",
  returned: "Returned",
};

export default async function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true, address: true },
  });

  if (!order) notFound();

  // An order placed while signed in belongs to that account — anyone else
  // (including a guest who merely guesses the order number) must sign in
  // as that customer to view it. A guest-checkout order has no account to
  // check against, so its unguessable order number is itself the access
  // token, same as most guest order-confirmation flows.
  if (order.userId) {
    const session = await getSession();
    if (!session || session.userId !== order.userId) {
      redirect(`/login?next=/order/${order.orderNumber}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {order.paymentStatus === "paid" ? "Payment received" : "Order placed"}
        </span>
        <h1 className="text-2xl font-bold text-ink-900">Thank you — order {order.orderNumber}</h1>
        <p className="text-sm text-ink-500">Status: {statusLabels[order.status] ?? order.status}</p>
      </div>

      <div className="mt-8 rounded-lg border border-ink-100 p-5">
        <h2 className="text-sm font-semibold text-ink-900">Items</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-700">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>
                {item.productTitleSnapshot} × {item.quantity}
              </span>
              <Money amount={item.price * item.quantity} />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-ink-100 pt-3 text-base font-bold text-ink-900">
          <span>Total</span>
          <Money amount={order.total} />
        </div>
      </div>

      {order.address && (
        <div className="mt-6 rounded-lg border border-ink-100 p-5 text-sm text-ink-700">
          <h2 className="text-sm font-semibold text-ink-900">Delivery address</h2>
          <p className="mt-2">
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ""}
            <br />
            {order.address.city}, {order.address.state} {order.address.pincode}
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-ink-500">
        Keep your order number for reference. For questions, use the{" "}
        <a href="/contact" className="underline hover:text-brand-600 focus-ring">
          Contact
        </a>{" "}
        page.
      </p>
    </div>
  );
}

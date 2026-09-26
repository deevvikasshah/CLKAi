import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Money } from "@/components/ui/Money";
import { updateOrderStatus } from "@/app/actions/adminOrders";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const statusOptions = ["placed", "confirmed", "shipped", "delivered", "cancelled", "return_requested", "returned"];

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, PERMISSIONS.MANAGE_FINANCE) && !hasPermission(session.role, PERMISSIONS.MANAGE_ORDERS)) {
    redirect("/admin");
  }

  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Orders</h1>

      <div className="mt-6 divide-y divide-ink-100 rounded-lg border border-ink-100">
        {orders.length === 0 && <p className="p-4 text-sm text-ink-500">No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">{o.orderNumber}</p>
              <p className="text-xs text-ink-500">
                {o.guestPhone ?? "Registered customer"} · Payment: {o.paymentStatus} · <Money amount={o.total} />
              </p>
            </div>
            <form action={updateOrderStatus} className="flex items-center gap-2">
              <input type="hidden" name="orderId" value={o.id} />
              <select name="status" defaultValue={o.status} className="rounded-md border border-ink-300 px-2 py-1.5 text-xs focus-ring">
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="submit" className="text-xs font-semibold text-brand-600 hover:text-brand-500 focus-ring">
                Update
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

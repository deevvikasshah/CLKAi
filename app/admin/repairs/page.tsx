import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAssignedStoreIds } from "@/lib/authz";
import { ROLES, canManageRepairs } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { repairStatusLabels, type RepairStatus } from "@/lib/repairConstants";

export const metadata = { title: "Repair Bookings" };
export const dynamic = "force-dynamic";

export default async function AdminRepairsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManageRepairs(session.role)) redirect("/admin");

  const where =
    session.role === ROLES.STORE_MANAGER
      ? { storeId: { in: await getAssignedStoreIds(session.userId) } }
      : {};

  const bookings = await prisma.repairBooking.findMany({
    where,
    include: { store: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Repair Bookings</h1>

      <div className="mt-6 divide-y divide-ink-100 rounded-lg border border-ink-100">
        {bookings.length === 0 && <p className="p-5 text-sm text-ink-500">No repair bookings yet.</p>}
        {bookings.map((b) => (
          <Link key={b.id} href={`/admin/repairs/${b.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-ink-50">
            <div>
              <p className="text-sm font-semibold text-ink-900">
                {b.referenceNumber} · {b.customerName}
              </p>
              <p className="text-xs text-ink-500">
                {b.store.storeName} · {b.deviceType} · {b.issueType}
              </p>
            </div>
            <span className="rounded border border-ink-200 px-2 py-1 text-xs font-medium text-ink-700">
              {repairStatusLabels[b.status as RepairStatus] ?? b.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

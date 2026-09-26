import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAssignedStoreIds } from "@/lib/authz";
import { ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Manage Stores" };

const statusColors: Record<string, string> = {
  draft: "text-amber-700 border-amber-300",
  published: "text-emerald-700 border-emerald-300",
  archived: "text-ink-500 border-ink-300",
};

export default async function AdminStoresPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isFullAdmin = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.OPS_ADMIN;
  const isStoreManager = session.role === ROLES.STORE_MANAGER;

  if (!isFullAdmin && !isStoreManager) redirect("/admin");

  const storeFilter = isStoreManager
    ? { id: { in: await getAssignedStoreIds(session.userId) } }
    : {};

  const stores = await prisma.store.findMany({ where: storeFilter, orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Manage Stores</h1>
        {isFullAdmin && (
          <Link
            href="/admin/stores/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
          >
            + New store
          </Link>
        )}
      </div>

      <div className="mt-6 divide-y divide-ink-100 rounded-lg border border-ink-100">
        {stores.length === 0 && <p className="p-5 text-sm text-ink-500">No stores yet.</p>}
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/admin/stores/${store.id}`}
            className="flex items-center justify-between gap-4 p-4 hover:bg-ink-50"
          >
            <div>
              <p className="text-sm font-semibold text-ink-900">{store.storeName}</p>
              <p className="text-xs text-ink-500">
                {store.city} · {store.storeCode}
                {!store.isVerified && " · pending verification"}
              </p>
            </div>
            <span className={`rounded border px-2 py-1 text-xs font-medium ${statusColors[store.status] ?? ""}`}>
              {store.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

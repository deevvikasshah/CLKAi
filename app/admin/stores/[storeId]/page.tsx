import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAssignedStoreIds } from "@/lib/authz";
import { ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { StoreForm } from "@/components/admin/StoreForm";
import { updateStore, publishStore, unpublishStore, markStoreVerified, archiveStore } from "@/app/actions/adminStores";

export const metadata = { title: "Edit Store" };

export default async function EditStorePage({ params }: { params: { storeId: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const isFullAdmin = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.OPS_ADMIN;
  const isStoreManager = session.role === ROLES.STORE_MANAGER;
  if (!isFullAdmin && !isStoreManager) redirect("/admin");

  if (isStoreManager) {
    const assigned = await getAssignedStoreIds(session.userId);
    if (!assigned.includes(params.storeId)) redirect("/admin/stores");
  }

  const store = await prisma.store.findUnique({ where: { id: params.storeId } });
  if (!store) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{store.storeName}</h1>
          <p className="text-sm text-ink-500">
            Status: <span className="font-medium">{store.status}</span>
            {!store.isVerified && " · pending verification by CLKAi"}
          </p>
        </div>
      </div>

      {isFullAdmin && (
        <div className="mt-4 flex flex-wrap gap-3">
          {store.status === "published" ? (
            session.role === ROLES.SUPER_ADMIN && (
              <form action={unpublishStore}>
                <input type="hidden" name="storeId" value={store.id} />
                <button type="submit" className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-900 hover:border-red-500 focus-ring">
                  Unpublish
                </button>
              </form>
            )
          ) : (
            session.role === ROLES.SUPER_ADMIN && (
              <form action={publishStore}>
                <input type="hidden" name="storeId" value={store.id} />
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 focus-ring">
                  Publish
                </button>
              </form>
            )
          )}

          {!store.isVerified && (
            <form action={markStoreVerified}>
              <input type="hidden" name="storeId" value={store.id} />
              <button type="submit" className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring">
                Mark details as verified
              </button>
            </form>
          )}

          {store.status !== "archived" && (
            <form action={archiveStore}>
              <input type="hidden" name="storeId" value={store.id} />
              <button type="submit" className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-500 hover:border-red-500 hover:text-red-600 focus-ring">
                Archive
              </button>
            </form>
          )}
        </div>
      )}

      <div className="mt-8">
        <StoreForm action={updateStore} store={store} restrictedToOperationalFields={isStoreManager} />
      </div>
    </div>
  );
}

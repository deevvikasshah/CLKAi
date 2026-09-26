import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { StoreForm } from "@/components/admin/StoreForm";
import { createStore } from "@/app/actions/adminStores";

export const metadata = { title: "New Store" };

export default async function NewStorePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== ROLES.SUPER_ADMIN && session.role !== ROLES.OPS_ADMIN) redirect("/admin/stores");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">New store</h1>
      <p className="mt-1 text-sm text-ink-500">
        New stores are created as a Draft. They will not appear publicly until a Super Admin publishes them.
      </p>

      <div className="mt-6">
        <StoreForm action={createStore} />
      </div>
    </div>
  );
}

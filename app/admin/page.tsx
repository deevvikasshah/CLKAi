import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isAdminRole, hasPermission, PERMISSIONS, canManageRepairs } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  ops_admin: "Operations Admin",
  store_manager: "Store Manager",
  catalog_manager: "Catalog Manager",
  repair_manager: "Repair Manager",
  sales_executive: "Sales Executive",
  support_executive: "Customer Support Executive",
  finance_manager: "Finance / Order Manager",
};

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (!isAdminRole(session.role)) redirect("/");

  const [storeCount, draftStoreCount, productCount, openRepairs, newEnquiries] = await Promise.all([
    prisma.store.count({ where: { status: "published" } }),
    prisma.store.count({ where: { status: "draft" } }),
    prisma.product.count({ where: { status: "published" } }),
    prisma.repairBooking.count({ where: { status: { notIn: ["completed", "cancelled"] } } }),
    prisma.enquiry.count({ where: { status: "new" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm text-ink-500">Signed in as</p>
      <h1 className="text-2xl font-bold text-ink-900">
        {session.name} · {roleLabels[session.role] ?? session.role}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published stores" value={storeCount} />
        <StatCard label="Draft stores" value={draftStoreCount} />
        <StatCard label="Published products" value={productCount} />
        <StatCard label="Open repair bookings" value={openRepairs} />
        <StatCard label="New enquiries" value={newEnquiries} />
      </div>

      <nav className="mt-8 flex flex-wrap gap-3">
        {(hasPermission(session.role, PERMISSIONS.MANAGE_STORES) || hasPermission(session.role, PERMISSIONS.MANAGE_STORE_OWN)) && (
          <AdminNavLink href="/admin/stores" label="Manage Stores" />
        )}
        {hasPermission(session.role, PERMISSIONS.MANAGE_PRODUCTS) && <AdminNavLink href="/admin/products" label="Manage Products" />}
        {hasPermission(session.role, PERMISSIONS.MANAGE_BRANDS) && <AdminNavLink href="/admin/brands" label="Manage Brands" />}
        {hasPermission(session.role, PERMISSIONS.MANAGE_OFFERS) && <AdminNavLink href="/admin/offers" label="Manage Offers" />}
        {canManageRepairs(session.role) && <AdminNavLink href="/admin/repairs" label="Repair Bookings" />}
        {hasPermission(session.role, PERMISSIONS.RESPOND_ENQUIRIES) && <AdminNavLink href="/admin/enquiries" label="Enquiries" />}
        {(hasPermission(session.role, PERMISSIONS.MANAGE_FINANCE) || hasPermission(session.role, PERMISSIONS.MANAGE_ORDERS)) && (
          <AdminNavLink href="/admin/orders" label="Orders" />
        )}
        {hasPermission(session.role, PERMISSIONS.VIEW_AUDIT_LOG) && <AdminNavLink href="/admin/audit-log" label="Audit Log" />}
      </nav>

      <form action="/api/auth/logout" method="post" className="mt-4">
        <button
          type="submit"
          className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

function AdminNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
    >
      {label}
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-white p-4">
      <p className="text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}

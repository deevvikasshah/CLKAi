import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { toggleBrandEnabled, createBrand } from "@/app/actions/adminCatalog";

export const metadata = { title: "Manage Brands" };
export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, PERMISSIONS.MANAGE_BRANDS)) redirect("/admin");

  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Manage Brands</h1>
      <p className="mt-1 text-sm text-ink-500">
        Disabled brands never appear on the storefront, in filters, or in product listings.
      </p>

      <form action={createBrand} className="mt-6 flex gap-3">
        <input
          name="name"
          placeholder="New brand name"
          required
          className="flex-1 rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring">
          Add brand
        </button>
      </form>

      <div className="mt-6 divide-y divide-ink-100 rounded-lg border border-ink-100">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between p-4">
            <span className="text-sm font-medium text-ink-900">
              {brand.name}
              {brand.slug === "dell" && (
                <span className="ml-2 text-xs text-ink-500">(disabled by default per CLKAi policy)</span>
              )}
            </span>
            <form action={toggleBrandEnabled}>
              <input type="hidden" name="brandId" value={brand.id} />
              <button
                type="submit"
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  brand.enabled ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500"
                }`}
              >
                {brand.enabled ? "Enabled" : "Disabled"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Money } from "@/components/ui/Money";

export const metadata = { title: "Manage Products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, PERMISSIONS.MANAGE_PRODUCTS)) redirect("/admin");

  const products = await prisma.product.findMany({
    include: { brand: true, variants: { orderBy: { price: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Manage Products</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 focus-ring">
          + New product
        </Link>
      </div>

      <div className="mt-6 divide-y divide-ink-100 rounded-lg border border-ink-100">
        {products.map((p) => (
          <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-ink-50">
            <div>
              <p className="text-sm font-semibold text-ink-900">{p.title}</p>
              <p className="text-xs text-ink-500">
                {p.brand.name} · SKU {p.sku}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {p.variants[0] && <Money amount={p.variants[0].price} className="text-sm text-ink-700" />}
              <span className="rounded border border-ink-200 px-2 py-1 text-xs font-medium text-ink-700">{p.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

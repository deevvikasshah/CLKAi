import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/app/actions/adminCatalog";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, PERMISSIONS.MANAGE_PRODUCTS)) redirect("/admin");

  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">New product</h1>
      <div className="mt-6">
        <ProductForm action={createProduct} brands={brands} categories={categories} />
      </div>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/app/actions/adminCatalog";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: { productId: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, PERMISSIONS.MANAGE_PRODUCTS)) redirect("/admin");

  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.productId }, include: { variants: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">{product.title}</h1>
      <div className="mt-6">
        <ProductForm action={updateProduct} brands={brands} categories={categories} product={product} />
      </div>
    </div>
  );
}

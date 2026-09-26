import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Brands" };
export const revalidate = 60;

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { status: "published" } } } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Brands</h1>
      <p className="mt-1 text-sm text-ink-500">Brands currently sold by CLKAi.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/shop?brand=${brand.slug}`}
            className="flex flex-col items-center gap-1 rounded-lg border border-ink-100 px-4 py-6 text-center transition-shadow hover:shadow-cardHover focus-ring"
          >
            <span className="text-base font-semibold text-ink-900">{brand.name}</span>
            <span className="text-xs text-ink-500">{brand._count.products} products</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

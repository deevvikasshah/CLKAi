import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getShopProducts, getAvailableBrandsForFilter, getCategories, type SortOption } from "@/lib/catalog";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopFilterBar } from "@/components/storefront/ShopFilterBar";
import { EmptyResults } from "@/components/storefront/EmptyResults";

interface CategoryShopPageProps {
  params: { category: string };
  searchParams: {
    brand?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
  };
}

export async function generateMetadata({ params }: CategoryShopPageProps) {
  const category = await prisma.category.findUnique({ where: { slug: params.category } });
  return { title: category?.name ?? "Shop" };
}

export default async function CategoryShopPage({ params, searchParams }: CategoryShopPageProps) {
  const category = await prisma.category.findUnique({ where: { slug: params.category } });
  if (!category) notFound();

  const brandSlugs = Array.isArray(searchParams.brand)
    ? searchParams.brand
    : searchParams.brand
      ? [searchParams.brand]
      : [];

  const [products, brands, categories] = await Promise.all([
    getShopProducts({
      categorySlug: params.category,
      brandSlugs,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      condition: searchParams.condition === "new" || searchParams.condition === "refurbished" ? searchParams.condition : undefined,
      sort: (searchParams.sort as SortOption) ?? "relevance",
    }),
    getAvailableBrandsForFilter(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">{category.name}</h1>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <ShopFilterBar
          categorySlug={params.category}
          categories={categories}
          brands={brands}
          selectedBrandSlugs={brandSlugs}
          minPrice={searchParams.minPrice}
          maxPrice={searchParams.maxPrice}
          condition={searchParams.condition}
          sort={searchParams.sort}
          basePath={`/shop/${params.category}`}
        />

        <div className="flex-1">
          {products.length === 0 ? (
            <EmptyResults />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

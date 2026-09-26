import { getShopProducts, getAvailableBrandsForFilter, getCategories, type SortOption } from "@/lib/catalog";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopFilterBar } from "@/components/storefront/ShopFilterBar";
import { EmptyResults } from "@/components/storefront/EmptyResults";

export const metadata = { title: "Shop" };

interface ShopPageProps {
  searchParams: {
    category?: string;
    brand?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const brandSlugs = Array.isArray(searchParams.brand)
    ? searchParams.brand
    : searchParams.brand
      ? [searchParams.brand]
      : [];

  const [products, brands, categories] = await Promise.all([
    getShopProducts({
      categorySlug: searchParams.category,
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
      <h1 className="text-2xl font-bold text-ink-900">Shop</h1>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <ShopFilterBar
          categories={categories}
          brands={brands}
          selectedBrandSlugs={brandSlugs}
          minPrice={searchParams.minPrice}
          maxPrice={searchParams.maxPrice}
          condition={searchParams.condition}
          sort={searchParams.sort}
          basePath="/shop"
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

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductCardData } from "@/components/storefront/ProductCard";

export type SortOption = "relevance" | "newest" | "price_asc" | "price_desc" | "best_sellers";

export interface ShopFilters {
  categorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  condition?: "new" | "refurbished";
  sort?: SortOption;
}

const SORT_ORDER: Record<SortOption, Prisma.ProductOrderByWithRelationInput | undefined> = {
  relevance: { createdAt: "desc" },
  newest: { createdAt: "desc" },
  price_asc: undefined, // applied after fetch, since price lives on the variant
  price_desc: undefined,
  best_sellers: { isBestSeller: "desc" },
};

export async function getShopProducts(filters: ShopFilters) {
  const where: Prisma.ProductWhereInput = {
    status: "published",
    brand: { enabled: true },
  };

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.brandSlugs?.length) {
    where.brand = { enabled: true, slug: { in: filters.brandSlugs } };
  }
  if (filters.condition) {
    where.condition = filters.condition;
  }

  const products = await prisma.product.findMany({
    where,
    include: { brand: true, variants: { orderBy: { price: "asc" } } },
    orderBy: SORT_ORDER[filters.sort ?? "relevance"],
  });

  let cards: ProductCardData[] = products
    .map((p): ProductCardData | null => {
      const variant = p.variants[0];
      if (!variant) return null;
      return {
        slug: p.slug,
        title: p.title,
        brandName: p.brand.name,
        price: variant.price,
        mrp: variant.mrp,
        inStock: true,
        condition: p.condition === "refurbished" ? "refurbished" : ("new" as const),
      };
    })
    .filter((c): c is ProductCardData => c !== null);

  if (filters.minPrice !== undefined) {
    cards = cards.filter((c) => c.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    cards = cards.filter((c) => c.price <= filters.maxPrice!);
  }
  if (filters.sort === "price_asc") cards = [...cards].sort((a, b) => a.price - b.price);
  if (filters.sort === "price_desc") cards = [...cards].sort((a, b) => b.price - a.price);

  return cards;
}

export async function getAvailableBrandsForFilter() {
  return prisma.brand.findMany({ where: { enabled: true }, orderBy: { name: "asc" } });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

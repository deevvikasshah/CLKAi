import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Revalidate periodically rather than fully static or fully dynamic — admin
// changes (new products, offers, store publish) show up within a minute
// without paying per-request DB cost on every homepage view.
export const revalidate = 60;
import { ProductCard, type ProductCardData } from "@/components/storefront/ProductCard";
import { StoreCard, type StoreCardData } from "@/components/storefront/StoreCard";

const categoryGrid = [
  { name: "Laptops", href: "/shop/laptops" },
  { name: "Smartphones", href: "/shop/smartphones" },
  { name: "Tablets", href: "/shop/tablets" },
  { name: "Accessories", href: "/shop/accessories" },
  { name: "Gaming", href: "/shop/gaming" },
  { name: "Networking", href: "/shop/networking" },
  { name: "Repairs", href: "/repairs" },
];

const whyChooseClkai = [
  {
    title: "Multi-brand catalogue",
    description: "Laptops, smartphones, tablets and accessories from the brands CLKAi carries in-store.",
  },
  {
    title: "Store pickup and repairs under one roof",
    description: "Buy online and collect at a store, or bring a device in for diagnosis and repair.",
  },
  {
    title: "Maharashtra store network",
    description: "Physical stores across Mumbai, Pune and Nashik, with more locations planned.",
  },
];

function toProductCard(product: {
  slug: string;
  title: string;
  condition: string;
  brand: { name: string };
  variants: { price: number; mrp: number | null }[];
}): ProductCardData | null {
  const variant = product.variants[0];
  if (!variant) return null;
  return {
    slug: product.slug,
    title: product.title,
    brandName: product.brand.name,
    price: variant.price,
    mrp: variant.mrp,
    inStock: true,
    condition: product.condition === "refurbished" ? "refurbished" : "new",
  };
}

export default async function HomePage() {
  const [featured, newArrivals, bestSellers, brands, stores] = await Promise.all([
    prisma.product.findMany({
      where: { status: "published", isFeatured: true },
      include: { brand: true, variants: { orderBy: { price: "asc" }, take: 1 } },
      take: 8,
    }),
    prisma.product.findMany({
      where: { status: "published", isNewArrival: true },
      include: { brand: true, variants: { orderBy: { price: "asc" }, take: 1 } },
      take: 8,
    }),
    prisma.product.findMany({
      where: { status: "published", isBestSeller: true },
      include: { brand: true, variants: { orderBy: { price: "asc" }, take: 1 } },
      take: 8,
    }),
    prisma.brand.findMany({ where: { enabled: true }, take: 12 }),
    prisma.store.findMany({ where: { status: "published" }, take: 6 }),
  ]);

  const featuredCards = featured.map(toProductCard).filter(Boolean) as ProductCardData[];
  const newArrivalCards = newArrivals.map(toProductCard).filter(Boolean) as ProductCardData[];
  const bestSellerCards = bestSellers.map(toProductCard).filter(Boolean) as ProductCardData[];
  const storeCards: StoreCardData[] = stores.map((s) => ({
    slug: s.slug,
    storeName: s.storeName,
    city: s.city,
    locality: s.locality,
    addressLine1: s.addressLine1,
    operationalState: s.operationalState,
    isVerified: s.isVerified,
    mapUrl: s.mapUrl,
    phone: s.phone,
    whatsapp: s.whatsapp,
  }));

  return (
    <>
      <section className="border-b border-ink-100 bg-ink-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Laptops, smartphones, tablets, accessories and trusted repairs.
            </h1>
            <p className="max-w-lg text-base text-ink-700">
              CLKAi stocks technology across categories at stores in Mumbai, Pune and Nashik,
              with online ordering and in-store repair services.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
              >
                Shop Now
              </Link>
              <Link
                href="/shop/laptops"
                className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
              >
                Shop Laptops
              </Link>
              <Link
                href="/shop/smartphones"
                className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
              >
                Shop Smartphones
              </Link>
              <Link
                href="/repairs"
                className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
              >
                Book a Repair
              </Link>
              <Link
                href="/stores"
                className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
              >
                Find a Store
              </Link>
            </div>
          </div>
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-ink-200 bg-white text-sm text-ink-500">
            Banner image/video pending
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-ink-900">Shop by category</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categoryGrid.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="flex flex-col items-center gap-2 rounded-lg border border-ink-100 bg-white p-4 text-center transition-shadow hover:shadow-cardHover focus-ring"
            >
              <span className="text-sm font-medium text-ink-900">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {featuredCards.length > 0 && (
        <ProductRow title="Featured products" products={featuredCards} />
      )}
      {newArrivalCards.length > 0 && (
        <ProductRow title="New arrivals" products={newArrivalCards} />
      )}
      {bestSellerCards.length > 0 && (
        <ProductRow title="Best sellers" products={bestSellerCards} />
      )}

      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-ink-900">Brands we carry</h2>
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {brands.map((brand) => (
              <span key={brand.id} className="text-base font-semibold text-ink-700">
                {brand.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-ink-100 bg-ink-50">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-xl font-bold text-ink-900">Need a repair?</h2>
            <p className="mt-1 text-sm text-ink-700">
              Book a diagnosis for a laptop, smartphone or tablet at your nearest CLKAi store.
            </p>
          </div>
          <Link
            href="/repairs"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
          >
            Book Repair
          </Link>
        </div>
      </section>

      {storeCards.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink-900">Find a CLKAi store near you</h2>
            <Link href="/stores" className="text-sm font-semibold text-brand-600 hover:text-brand-500 focus-ring">
              View all stores
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storeCards.map((store) => (
              <StoreCard key={store.slug} store={store} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-ink-900">Why choose CLKAi</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          {whyChooseClkai.map((item) => (
            <div key={item.title}>
              <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-xl font-bold text-ink-900">Buying for a business or institution?</h2>
            <p className="mt-1 text-sm text-ink-700">
              Get volume pricing and deployment support for bulk technology purchases.
            </p>
          </div>
          <Link
            href="/corporate"
            className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
          >
            Corporate / Bulk Enquiry
          </Link>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}

function ProductRow({ title, products }: { title: string; products: ProductCardData[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold text-ink-900">{title}</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-ink-100 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold text-ink-900">Stay updated</h2>
        <p className="mt-1 text-sm text-ink-500">
          Get notified about new arrivals and genuine offers at CLKAi.
        </p>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start" action="/api/newsletter" method="post">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-ink-300 px-4 py-2.5 text-sm focus-ring sm:max-w-xs"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
          >
            Subscribe
          </button>
        </form>
        <label className="mt-3 flex items-start gap-2 text-xs text-ink-500">
          <input type="checkbox" name="marketingConsent" className="mt-0.5" />
          I&rsquo;d like to receive marketing emails from CLKAi. This is optional.
        </label>
      </div>
    </section>
  );
}

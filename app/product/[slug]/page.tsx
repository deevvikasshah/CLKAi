import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Money } from "@/components/ui/Money";
import { ProductCard, type ProductCardData } from "@/components/storefront/ProductCard";
import { CompareToggle } from "@/components/storefront/CompareToggle";
import { addToCart } from "@/app/actions/cart";
import { addToWishlist } from "@/app/actions/wishlist";
import { submitProductEnquiry } from "@/app/actions/productEnquiry";

interface ProductPageProps {
  params: { slug: string };
  searchParams?: { enquirySubmitted?: string };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  return { title: product?.title ?? "Product not found" };
}

export default async function ProductDetailPage({ params, searchParams }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, status: "published" },
    include: {
      brand: true,
      category: true,
      variants: { orderBy: { price: "asc" } },
      specifications: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) notFound();

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const boxContents: string[] = product.boxContentsJson ? JSON.parse(product.boxContentsJson) : [];

  const specGroups = product.specifications.reduce<Record<string, { key: string; value: string }[]>>(
    (acc, spec) => {
      acc[spec.groupName] = acc[spec.groupName] ?? [];
      acc[spec.groupName].push({ key: spec.specKey, value: spec.specValue });
      return acc;
    },
    {}
  );

  const relatedRaw = await prisma.product.findMany({
    where: { status: "published", categoryId: product.categoryId, id: { not: product.id } },
    include: { brand: true, variants: { orderBy: { price: "asc" }, take: 1 } },
    take: 4,
  });
  const related: ProductCardData[] = relatedRaw
    .map((p): ProductCardData | null => {
      const v = p.variants[0];
      if (!v) return null;
      return {
        slug: p.slug,
        title: p.title,
        brandName: p.brand.name,
        price: v.price,
        mrp: v.mrp,
        inStock: true,
        condition: p.condition === "refurbished" ? "refurbished" : ("new" as const),
      };
    })
    .filter((c): c is ProductCardData => c !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-ink-500">
        <a href="/shop" className="hover:text-brand-600">
          Shop
        </a>{" "}
        /{" "}
        <a href={`/shop/${product.category.slug}`} className="hover:text-brand-600">
          {product.category.name}
        </a>{" "}
        / <span>{product.title}</span>
      </nav>

      <div className="mt-4 grid gap-10 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-lg border border-ink-100 bg-ink-50 text-sm text-ink-500">
          Product image pending
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <span className="text-sm text-ink-500">{product.brand.name}</span>
            <h1 className="text-2xl font-bold text-ink-900">{product.title}</h1>
            {product.modelNumber && (
              <p className="mt-1 text-xs text-ink-500">Model: {product.modelNumber} · SKU: {product.sku}</p>
            )}
          </div>

          {product.condition === "refurbished" && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">Refurbished{product.refurbishedGrade ? ` — ${product.refurbishedGrade}` : ""}</p>
              <p className="mt-1">
                {product.warrantyText ?? "Warranty details for this refurbished unit will be confirmed by the store."}
              </p>
            </div>
          )}

          {defaultVariant && (
            <div className="flex items-baseline gap-3">
              <Money amount={defaultVariant.price} className="text-2xl font-bold text-ink-900" />
              {defaultVariant.mrp && defaultVariant.mrp > defaultVariant.price && (
                <span className="text-sm text-ink-500 line-through">
                  <Money amount={defaultVariant.mrp} />
                </span>
              )}
            </div>
          )}

          {product.variants.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-ink-900">Variant</span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <span
                    key={v.id}
                    className="rounded-md border border-ink-300 px-3 py-1.5 text-sm text-ink-700"
                  >
                    {v.variantName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {defaultVariant && (
              <>
                <form action={addToCart}>
                  <input type="hidden" name="variantId" value={defaultVariant.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
                  >
                    Add to Cart
                  </button>
                </form>
                <form action={addToCart}>
                  <input type="hidden" name="variantId" value={defaultVariant.id} />
                  <input type="hidden" name="redirectTo" value="/checkout" />
                  <button
                    type="submit"
                    className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
                  >
                    Buy Now
                  </button>
                </form>
                <form action={addToWishlist}>
                  <input type="hidden" name="variantId" value={defaultVariant.id} />
                  <input type="hidden" name="productSlug" value={product.slug} />
                  <button
                    type="submit"
                    className="rounded-lg border border-ink-300 px-4 py-2.5 text-sm font-medium text-ink-700 hover:border-brand-500 focus-ring"
                  >
                    Wishlist
                  </button>
                </form>
              </>
            )}
            <CompareToggle productSlug={product.slug} />
          </div>

          {product.warrantyText && (
            <p className="text-sm text-ink-500">Warranty: {product.warrantyText}</p>
          )}

          {searchParams?.enquirySubmitted === "1" ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Thank you — your enquiry has been received. A member of the CLKAi team will get in touch.
            </p>
          ) : (
            <details className="rounded-md border border-ink-200 p-3">
              <summary className="cursor-pointer text-sm font-medium text-ink-900">Product enquiry</summary>
              <form action={submitProductEnquiry} className="mt-3 flex flex-col gap-3">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="productSlug" value={product.slug} />
                <input
                  name="name"
                  placeholder="Your name"
                  required
                  className="rounded-lg border border-ink-300 px-3 py-2 text-sm focus-ring"
                />
                <input
                  name="phone"
                  placeholder="10-digit mobile number"
                  required
                  inputMode="numeric"
                  className="rounded-lg border border-ink-300 px-3 py-2 text-sm focus-ring"
                />
                <textarea
                  name="message"
                  placeholder="Your question (optional)"
                  rows={2}
                  className="rounded-lg border border-ink-300 px-3 py-2 text-sm focus-ring"
                />
                <button type="submit" className="self-start rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 focus-ring">
                  Send enquiry
                </button>
              </form>
            </details>
          )}
        </div>
      </div>

      {product.description && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink-900">Description</h2>
          <p className="mt-2 text-sm text-ink-700">{product.description}</p>
        </section>
      )}

      {boxContents.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">Box contents</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-ink-700">
            {boxContents.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {Object.keys(specGroups).length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">Specifications</h2>
          <div className="mt-3 grid gap-6 sm:grid-cols-2">
            {Object.entries(specGroups).map(([group, specs]) => (
              <div key={group}>
                <h3 className="text-sm font-semibold text-ink-900">{group}</h3>
                <dl className="mt-2 divide-y divide-ink-100 text-sm">
                  {specs.map((s) => (
                    <div key={s.key} className="flex justify-between gap-4 py-1.5">
                      <dt className="text-ink-500">{s.key}</dt>
                      <dd className="text-right text-ink-900">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink-900">Related products</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

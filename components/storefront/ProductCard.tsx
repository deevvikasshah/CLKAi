import Link from "next/link";
import { Money } from "@/components/ui/Money";

export interface ProductCardData {
  slug: string;
  title: string;
  brandName: string;
  shortSpec?: string;
  price: number;
  mrp?: number | null;
  inStock: boolean;
  condition: "new" | "refurbished";
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const discountPct =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-lg border border-ink-100 bg-white p-4 transition-shadow hover:shadow-cardHover focus-ring"
    >
      <div className="mb-3 flex aspect-square items-center justify-center rounded-md bg-ink-50 text-xs text-ink-500">
        Product image pending
      </div>

      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>{product.brandName}</span>
        {product.condition === "refurbished" && (
          <span className="rounded border border-ink-300 px-1.5 py-0.5 font-medium text-ink-700">
            Refurbished
          </span>
        )}
      </div>

      <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-ink-900 group-hover:text-brand-600">
        {product.title}
      </h3>

      {product.shortSpec && <p className="mt-1 text-xs text-ink-500">{product.shortSpec}</p>}

      <div className="mt-2 flex items-baseline gap-2">
        <Money amount={product.price} className="text-base font-bold text-ink-900" />
        {product.mrp && product.mrp > product.price && (
          <span className="text-xs text-ink-500 line-through">
            <Money amount={product.mrp} />
          </span>
        )}
        {discountPct !== null && (
          <span className="text-xs font-semibold text-emerald-700">{discountPct}% off</span>
        )}
      </div>

      <span className={`mt-2 text-xs font-medium ${product.inStock ? "text-emerald-700" : "text-ink-500"}`}>
        {product.inStock ? "In stock" : "Out of stock"}
      </span>
    </Link>
  );
}

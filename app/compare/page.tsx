import { prisma } from "@/lib/prisma";
import { Money } from "@/components/ui/Money";

export const metadata = { title: "Compare products" };

interface ComparePageProps {
  searchParams: { slugs?: string };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const slugs = (searchParams.slugs ?? "").split(",").filter(Boolean).slice(0, 4);

  if (slugs.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-ink-900">Compare products</h1>
        <p className="mt-2 text-sm text-ink-500">
          Add products to compare from the shop or a product page, then come back here.
        </p>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, status: "published" },
    include: { brand: true, variants: { orderBy: { price: "asc" }, take: 1 }, specifications: true },
  });

  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => p.specifications.map((s) => s.specKey)))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Compare products</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 text-left text-ink-500"></th>
              {products.map((p) => (
                <th key={p.id} className="border-b border-ink-100 px-3 py-2 text-left">
                  <a href={`/product/${p.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {p.title}
                  </a>
                  <p className="text-xs text-ink-500">{p.brand.name}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 text-ink-500">Price</td>
              {products.map((p) => (
                <td key={p.id} className="border-b border-ink-100 px-3 py-2">
                  {p.variants[0] ? <Money amount={p.variants[0].price} /> : "—"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 text-ink-500">Condition</td>
              {products.map((p) => (
                <td key={p.id} className="border-b border-ink-100 px-3 py-2 capitalize">
                  {p.condition}
                </td>
              ))}
            </tr>
            {allSpecKeys.map((key) => (
              <tr key={key}>
                <td className="py-2 text-ink-500">{key}</td>
                {products.map((p) => {
                  const spec = p.specifications.find((s) => s.specKey === key);
                  return (
                    <td key={p.id} className="border-b border-ink-100 px-3 py-2">
                      {spec?.specValue ?? "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

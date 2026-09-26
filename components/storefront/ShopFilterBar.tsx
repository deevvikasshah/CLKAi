export interface ShopFilterBarProps {
  categorySlug?: string;
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
  selectedBrandSlugs: string[];
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  sort?: string;
  basePath: string;
}

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "best_sellers", label: "Best sellers" },
];

export function ShopFilterBar({
  categorySlug,
  categories,
  brands,
  selectedBrandSlugs,
  minPrice,
  maxPrice,
  condition,
  sort,
  basePath,
}: ShopFilterBarProps) {
  return (
    <form method="get" action={basePath} className="flex flex-col gap-6 lg:w-64 lg:shrink-0">
      {!categorySlug && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-ink-900">Category</legend>
          {categories.map((c) => (
            <label key={c.slug} className="flex items-center gap-2 text-sm text-ink-700">
              <input type="radio" name="category" value={c.slug} defaultChecked={categorySlug === c.slug} />
              {c.name}
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-ink-900">Brand</legend>
        {brands.map((b) => (
          <label key={b.slug} className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              name="brand"
              value={b.slug}
              defaultChecked={selectedBrandSlugs.includes(b.slug)}
            />
            {b.name}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-ink-900">Price range (₹)</legend>
        <div className="flex items-center gap-2">
          <label htmlFor="minPrice" className="sr-only">
            Minimum price
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            placeholder="Min"
            defaultValue={minPrice}
            className="w-full rounded-md border border-ink-300 px-2 py-1.5 text-sm focus-ring"
          />
          <span className="text-ink-500">–</span>
          <label htmlFor="maxPrice" className="sr-only">
            Maximum price
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            placeholder="Max"
            defaultValue={maxPrice}
            className="w-full rounded-md border border-ink-300 px-2 py-1.5 text-sm focus-ring"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-ink-900">Condition</legend>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="radio" name="condition" value="" defaultChecked={!condition} />
          All
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="radio" name="condition" value="new" defaultChecked={condition === "new"} />
          New
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="radio" name="condition" value="refurbished" defaultChecked={condition === "refurbished"} />
          Refurbished
        </label>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="sort" className="text-sm font-semibold text-ink-900">
          Sort by
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={sort ?? "relevance"}
          className="rounded-md border border-ink-300 px-2 py-1.5 text-sm focus-ring"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
      >
        Apply filters
      </button>
    </form>
  );
}

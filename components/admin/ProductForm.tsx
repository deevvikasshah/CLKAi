interface ProductFormProps {
  action: (formData: FormData) => void;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    title: string;
    brandId: string;
    categoryId: string;
    sku: string;
    modelNumber: string | null;
    description: string | null;
    condition: string;
    refurbishedGrade: string | null;
    warrantyText: string | null;
    status: string;
    isFeatured: boolean;
    isBestSeller: boolean;
    isNewArrival: boolean;
    variants: { price: number; mrp: number | null }[];
  };
}

export function ProductForm({ action, brands, categories, product }: ProductFormProps) {
  const defaultVariant = product?.variants[0];

  return (
    <form action={action} className="flex flex-col gap-5">
      {product && <input type="hidden" name="productId" value={product.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-ink-700">
          Title
        </label>
        <input id="title" name="title" required defaultValue={product?.title} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="brandId" className="text-sm font-medium text-ink-700">
            Brand
          </label>
          <select id="brandId" name="brandId" required defaultValue={product?.brandId} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring">
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoryId" className="text-sm font-medium text-ink-700">
            Category
          </label>
          <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sku" className="text-sm font-medium text-ink-700">
            SKU
          </label>
          <input id="sku" name="sku" required defaultValue={product?.sku} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="modelNumber" className="text-sm font-medium text-ink-700">
            Model number (optional)
          </label>
          <input id="modelNumber" name="modelNumber" defaultValue={product?.modelNumber ?? ""} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-ink-700">
          Description (optional)
        </label>
        <textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ""} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-sm font-medium text-ink-700">
            Price (₹)
          </label>
          <input id="price" name="price" type="number" min={0} step="0.01" required defaultValue={defaultVariant?.price} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mrp" className="text-sm font-medium text-ink-700">
            MRP (optional, ₹)
          </label>
          <input id="mrp" name="mrp" type="number" min={0} step="0.01" defaultValue={defaultVariant?.mrp ?? ""} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="condition" className="text-sm font-medium text-ink-700">
            Condition
          </label>
          <select id="condition" name="condition" defaultValue={product?.condition ?? "new"} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring">
            <option value="new">New</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-ink-700">
            Status
          </label>
          <select id="status" name="status" defaultValue={product?.status ?? "draft"} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="refurbishedGrade" className="text-sm font-medium text-ink-700">
            Refurbished grade (if applicable)
          </label>
          <input id="refurbishedGrade" name="refurbishedGrade" defaultValue={product?.refurbishedGrade ?? ""} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="warrantyText" className="text-sm font-medium text-ink-700">
            Warranty text (optional)
          </label>
          <input id="warrantyText" name="warrantyText" defaultValue={product?.warrantyText ?? ""} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>
      </div>

      <fieldset className="flex flex-wrap gap-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-700">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} />
          Featured
        </label>
        <label className="flex items-center gap-1.5 text-sm text-ink-700">
          <input type="checkbox" name="isBestSeller" defaultChecked={product?.isBestSeller} />
          Best seller
        </label>
        <label className="flex items-center gap-1.5 text-sm text-ink-700">
          <input type="checkbox" name="isNewArrival" defaultChecked={product?.isNewArrival} />
          New arrival
        </label>
      </fieldset>

      <button type="submit" className="mt-2 self-start rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring">
        {product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}

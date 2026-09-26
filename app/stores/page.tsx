import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { StoreLocatorResults } from "@/components/storefront/StoreLocatorResults";

export const metadata = { title: "Store Locator" };

const serviceFilterOptions = [
  { value: "sales", label: "Sales" },
  { value: "laptop_repair", label: "Laptop repair" },
  { value: "smartphone_repair", label: "Smartphone repair" },
  { value: "tablet_repair", label: "Tablet repair" },
  { value: "pickup_drop", label: "Pickup and drop" },
  { value: "corporate_support", label: "Corporate support" },
  { value: "store_pickup", label: "Store pickup" },
];

interface StoresPageProps {
  searchParams: { q?: string; city?: string; service?: string | string[] };
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const services = Array.isArray(searchParams.service)
    ? searchParams.service
    : searchParams.service
      ? [searchParams.service]
      : [];

  const where: Prisma.StoreWhereInput = { status: "published" };

  if (searchParams.q) {
    const q = searchParams.q;
    where.OR = [
      { storeName: { contains: q } },
      { city: { contains: q } },
      { locality: { contains: q } },
      { pincode: { contains: q } },
      { state: { contains: q } },
    ];
  }
  if (searchParams.city) {
    where.city = searchParams.city;
  }

  const stores = await prisma.store.findMany({ where, orderBy: { city: "asc" } });
  const filteredStores = services.length
    ? stores.filter((s) => {
        const storeServices: string[] = s.servicesJson ? JSON.parse(s.servicesJson) : [];
        return services.every((svc) => storeServices.includes(svc));
      })
    : stores;

  const cities = await prisma.store.findMany({
    where: { status: "published" },
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });

  const storeCards = filteredStores.map((s) => ({
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
    latitude: s.latitude,
    longitude: s.longitude,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Find Your Nearest CLKAi</h1>
      <p className="mt-1 text-sm text-ink-500">Five locations. One technology destination.</p>

      <form method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-medium text-ink-700">
            Search by name, area, city or pincode
          </label>
          <input
            id="q"
            name="q"
            defaultValue={searchParams.q}
            className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-medium text-ink-700">
            City
          </label>
          <select
            id="city"
            name="city"
            defaultValue={searchParams.city ?? ""}
            className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="flex flex-wrap gap-3">
          <legend className="sr-only">Filter by service</legend>
          {serviceFilterOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 text-sm text-ink-700">
              <input type="checkbox" name="service" value={opt.value} defaultChecked={services.includes(opt.value)} />
              {opt.label}
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
        >
          Search
        </button>
      </form>

      <div className="mt-8">
        {storeCards.length === 0 ? (
          <p className="rounded-lg border border-ink-100 bg-ink-50 px-6 py-12 text-center text-sm text-ink-500">
            No stores match your search. Try a different city or clear the filters.
          </p>
        ) : (
          <StoreLocatorResults stores={storeCards} />
        )}
      </div>
    </div>
  );
}

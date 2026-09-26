import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store || store.status !== "published") return { title: "Store not found" };
  return { title: `${store.storeName} — ${store.city}` };
}

const stateLabel: Record<string, string> = {
  open: "Open",
  closed: "Closed",
  temporarily_closed: "Temporarily Closed",
  coming_soon: "Coming Soon",
};

const serviceLabel: Record<string, string> = {
  sales: "Sales",
  laptop_repair: "Laptop repair",
  smartphone_repair: "Smartphone repair",
  tablet_repair: "Tablet repair",
  pickup_drop: "Pickup and drop",
  corporate_support: "Corporate support",
  store_pickup: "Store pickup",
};

export default async function StoreDetailPage({ params }: { params: { slug: string } }) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store || store.status !== "published") notFound();

  const services: string[] = store.servicesJson ? JSON.parse(store.servicesJson) : [];
  const images: string[] = store.storeImagesJson ? JSON.parse(store.storeImagesJson) : [];

  const structuredData = store.isVerified
    ? {
        "@context": "https://schema.org",
        "@type": "ElectronicsStore",
        name: store.storeName,
        address: {
          "@type": "PostalAddress",
          streetAddress: store.addressLine1,
          addressLocality: store.city,
          addressRegion: store.state,
          postalCode: store.pincode,
          addressCountry: "IN",
        },
        ...(store.phone ? { telephone: store.phone } : {}),
        ...(store.mapUrl ? { hasMap: store.mapUrl } : {}),
      }
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}

      <span className="rounded border border-ink-200 px-2 py-1 text-xs font-medium text-ink-700">
        {stateLabel[store.operationalState] ?? store.operationalState}
      </span>
      <h1 className="mt-2 text-2xl font-bold text-ink-900">{store.storeName}</h1>
      <p className="text-sm text-ink-500">
        {store.locality ? `${store.locality}, ` : ""}
        {store.city}, {store.state}
      </p>

      {!store.isVerified && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Store details pending verification by CLKAi.
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((src) => (
            <div key={src} className="flex aspect-square items-center justify-center rounded-md bg-ink-50 text-xs text-ink-500">
              Store image
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Address</h2>
          <p className="mt-1 text-sm text-ink-700">
            {store.addressLine1}
            {store.addressLine2 ? `, ${store.addressLine2}` : ""}
            <br />
            {store.city}, {store.state} {store.pincode}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink-900">Contact</h2>
          <ul className="mt-1 flex flex-col gap-1 text-sm text-ink-700">
            {store.phone && <li>Phone: {store.phone}</li>}
            {store.email && <li>Email: {store.email}</li>}
            {!store.phone && !store.email && <li className="text-ink-500">Contact details pending verification.</li>}
          </ul>
        </div>

        {services.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Services</h2>
            <ul className="mt-1 flex flex-wrap gap-2">
              {services.map((s) => (
                <li key={s} className="rounded-full border border-ink-200 px-3 py-1 text-xs text-ink-700">
                  {serviceLabel[s] ?? s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {store.openingHoursJson && (
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Opening hours</h2>
            <dl className="mt-1 text-sm text-ink-700">
              {Object.entries(JSON.parse(store.openingHoursJson) as Record<string, string>).map(([day, hours]) => (
                <div key={day} className="flex justify-between gap-4">
                  <dt className="capitalize text-ink-500">{day}</dt>
                  <dd>{hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {store.mapUrl && (
          <a
            href={store.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
          >
            Get Directions
          </a>
        )}
        {store.phone && (
          <a
            href={`tel:${store.phone}`}
            className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
          >
            Call
          </a>
        )}
        {buildWhatsAppUrl(store.whatsapp, `Hi CLKAi, I'd like to know more about your ${store.storeName} store.`) && (
          <a
            href={buildWhatsAppUrl(store.whatsapp, `Hi CLKAi, I'd like to know more about your ${store.storeName} store.`)!}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
          >
            WhatsApp Store
          </a>
        )}
        {store.repairAvailable && (
          <a
            href="/repairs"
            className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring"
          >
            Book a Repair Here
          </a>
        )}
      </div>
    </div>
  );
}

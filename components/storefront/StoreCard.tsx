import Link from "next/link";

export interface StoreCardData {
  slug: string;
  storeName: string;
  city: string;
  locality: string | null;
  addressLine1: string;
  operationalState: string;
  isVerified: boolean;
  mapUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
}

const stateLabel: Record<string, string> = {
  open: "Open",
  closed: "Closed",
  temporarily_closed: "Temporarily Closed",
  coming_soon: "Coming Soon",
};

export function StoreCard({ store }: { store: StoreCardData }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink-900">{store.storeName}</h3>
          <span className="text-xs text-ink-500">
            {store.locality ? `${store.locality}, ` : ""}
            {store.city}
          </span>
        </div>
        <span className="whitespace-nowrap rounded border border-ink-200 px-2 py-1 text-xs font-medium text-ink-700">
          {stateLabel[store.operationalState] ?? store.operationalState}
        </span>
      </div>

      <p className="text-sm text-ink-500">{store.addressLine1}</p>

      {!store.isVerified && (
        <p className="text-xs italic text-ink-500">Store details pending verification by CLKAi.</p>
      )}

      <div className="mt-1 flex flex-wrap gap-3">
        <Link
          href={`/stores/${store.slug}`}
          className="text-sm font-semibold text-brand-600 hover:text-brand-500 focus-ring"
        >
          View store
        </Link>
        {store.mapUrl && (
          <a
            href={store.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-ink-700 hover:text-brand-600 focus-ring"
          >
            Directions
          </a>
        )}
        {store.phone && (
          <a href={`tel:${store.phone}`} className="text-sm font-semibold text-ink-700 hover:text-brand-600 focus-ring">
            Call
          </a>
        )}
      </div>
    </div>
  );
}

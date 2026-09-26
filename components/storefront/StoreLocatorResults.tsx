"use client";

import { useMemo, useState } from "react";
import { StoreCard, type StoreCardData } from "@/components/storefront/StoreCard";
import { GeoDistanceSort } from "@/components/storefront/GeoDistanceSort";

interface StoreWithCoords extends StoreCardData {
  latitude: number | null;
  longitude: number | null;
}

export function StoreLocatorResults({ stores }: { stores: StoreWithCoords[] }) {
  const [distances, setDistances] = useState<Record<string, number> | null>(null);

  const sorted = useMemo(() => {
    if (!distances) return stores;
    return [...stores].sort((a, b) => {
      const da = distances[a.slug] ?? Infinity;
      const db = distances[b.slug] ?? Infinity;
      return da - db;
    });
  }, [stores, distances]);

  return (
    <div className="flex flex-col gap-4">
      <GeoDistanceSort stores={stores} onDistances={setDistances} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((store) => (
          <div key={store.slug}>
            <StoreCard store={store} />
            {distances?.[store.slug] !== undefined && (
              <p className="mt-1 text-xs text-ink-500">{distances[store.slug].toFixed(1)} km away</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

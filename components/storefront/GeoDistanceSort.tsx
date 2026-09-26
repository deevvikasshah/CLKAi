"use client";

import { useState } from "react";

export interface GeoStore {
  slug: string;
  latitude: number | null;
  longitude: number | null;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Requests browser geolocation only on explicit user click (never on page
 * load) and reports distances via a callback rather than owning the store
 * list — search results stay fully usable whether permission is granted,
 * denied, or never asked.
 */
export function GeoDistanceSort({
  stores,
  onDistances,
}: {
  stores: GeoStore[];
  onDistances: (distances: Record<string, number>) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "denied" | "unsupported">("idle");

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distances: Record<string, number> = {};
        for (const store of stores) {
          if (store.latitude !== null && store.longitude !== null) {
            distances[store.slug] = haversineKm(latitude, longitude, store.latitude, store.longitude);
          }
        }
        onDistances(distances);
        setStatus("idle");
      },
      () => setStatus("denied"),
      { timeout: 8000 }
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={requestLocation}
        className="self-start rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-ink-700 hover:border-brand-500 focus-ring"
      >
        {status === "loading" ? "Locating…" : "Use My Location"}
      </button>
      {status === "denied" && (
        <p className="text-xs text-ink-500">
          Location access was denied. You can still search stores by name, city, area or pincode.
        </p>
      )}
      {status === "unsupported" && (
        <p className="text-xs text-ink-500">Your browser does not support location access.</p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "clkai_compare";

function readCompareList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CompareBar() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readCompareList());
    const handler = () => setSlugs(readCompareList());
    window.addEventListener("clkai-compare-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("clkai-compare-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  if (slugs.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white px-4 py-3 shadow-cardHover">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <span className="text-sm text-ink-700">{slugs.length} product(s) selected to compare</span>
        <Link
          href={`/compare?slugs=${slugs.join(",")}`}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
        >
          Compare now
        </Link>
      </div>
    </div>
  );
}

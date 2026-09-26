"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "clkai_compare";
const MAX_COMPARE = 4;

function readCompareList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCompareList(slugs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    window.dispatchEvent(new Event("clkai-compare-change"));
  } catch {
    // localStorage unavailable (private mode, etc.) — compare is a
    // convenience feature, so we degrade silently rather than error.
  }
}

export function CompareToggle({ productSlug }: { productSlug: string }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(readCompareList().includes(productSlug));
  }, [productSlug]);

  function toggle() {
    const current = readCompareList();
    if (current.includes(productSlug)) {
      writeCompareList(current.filter((s) => s !== productSlug));
      setChecked(false);
      return;
    }
    if (current.length >= MAX_COMPARE) {
      alert(`You can compare up to ${MAX_COMPARE} products at a time.`);
      return;
    }
    writeCompareList([...current, productSlug]);
    setChecked(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={checked}
      className={`rounded-lg border px-4 py-2.5 text-sm font-medium focus-ring ${
        checked ? "border-brand-500 text-brand-600" : "border-ink-300 text-ink-700 hover:border-brand-500"
      }`}
    >
      {checked ? "Added to Compare" : "Compare"}
    </button>
  );
}

import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export function Logo() {
  if (siteConfig.logoStatus === "official") {
    // Swap this block for an <Image> of the supplied logo file once available.
    return (
      <Link href="/" className="text-xl font-bold tracking-tight text-ink-900">
        {siteConfig.brandName}
      </Link>
    );
  }

  return (
    <Link href="/" className="group flex flex-col leading-tight focus-ring">
      <span className="text-xl font-bold tracking-tight text-ink-900">
        {siteConfig.brandName}
      </span>
      <span className="text-[10px] font-medium text-ink-500 group-hover:text-brand-600">
        {siteConfig.logoPlaceholderLabel}
      </span>
    </Link>
  );
}

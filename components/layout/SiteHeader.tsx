import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

const primaryNav = [
  { label: "Shop", href: "/shop" },
  { label: "Laptops", href: "/shop/laptops" },
  { label: "Smartphones", href: "/shop/smartphones" },
  { label: "Tablets", href: "/shop/tablets" },
  { label: "Accessories", href: "/shop/accessories" },
  { label: "Brands", href: "/brands" },
  { label: "Offers", href: "/offers" },
  { label: "Repairs & Services", href: "/repairs" },
  { label: "Store Locator", href: "/stores" },
  { label: "Corporate / Bulk Enquiry", href: "/corporate" },
  { label: "About CLKAi", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-5 overflow-x-auto lg:flex" aria-label="Primary">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-ink-700 hover:text-brand-600 focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/track-repair"
            className="hidden text-sm font-medium text-ink-700 hover:text-brand-600 focus-ring sm:inline"
          >
            Track Repair
          </Link>
          <Link href="/cart" className="text-sm font-medium text-ink-700 hover:text-brand-600 focus-ring">
            Cart
          </Link>
          <Link
            href="/account"
            className="rounded-lg border border-ink-300 px-3 py-1.5 text-sm font-semibold text-ink-900 hover:border-brand-500 hover:text-brand-600 focus-ring"
          >
            Account
          </Link>
        </div>
      </div>
    </header>
  );
}

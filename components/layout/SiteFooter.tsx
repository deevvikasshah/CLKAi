import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

const footerLinks = [
  { label: "About CLKAi", href: "/about" },
  { label: "Store Locator", href: "/stores" },
  { label: "Contact", href: "/contact" },
  { label: "Repairs & Services", href: "/repairs" },
  { label: "Shipping Policy", href: "/policies/shipping" },
  { label: "Return and Refund Policy", href: "/policies/returns" },
  { label: "Cancellation Policy", href: "/policies/cancellation" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms of Use", href: "/policies/terms" },
  { label: "Cookie Policy", href: "/policies/cookies" },
  { label: "Warranty Information", href: "/policies/warranty" },
  { label: "Repair Service Terms", href: "/policies/repair-terms" },
  { label: "Security / Responsible Disclosure", href: "/security" },
  { label: "Sitemap", href: "/sitemap.xml" },
  { label: "Help / Support", href: "/contact" },
];

export function SiteFooter() {
  const socialLinks = Object.entries(siteConfig.social).filter(([, url]) => Boolean(url));

  return (
    <footer className="border-t border-ink-100 bg-ink-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-lg font-bold text-ink-900">{siteConfig.brandName}</span>
            <p className="mt-2 text-sm text-ink-500">
              Laptops, smartphones, tablets, accessories and trusted repairs across Maharashtra.
            </p>
          </div>

          {[footerLinks.slice(0, 5), footerLinks.slice(5, 10), footerLinks.slice(10)].map(
            (group, i) => (
              <ul key={i} className="flex flex-col gap-2">
                {group.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-500 hover:text-brand-600 focus-ring">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-8 flex gap-4 border-t border-ink-100 pt-6">
            {socialLinks.map(([platform, url]) => (
              <a
                key={platform}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink-500 hover:text-brand-600 focus-ring"
              >
                {platform}
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2 border-t border-ink-100 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.
          </span>
          {siteConfig.legal.gstin && <span>GSTIN: {siteConfig.legal.gstin}</span>}
        </div>
      </div>
    </footer>
  );
}

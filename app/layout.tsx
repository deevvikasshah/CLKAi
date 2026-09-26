import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CompareBar } from "@/components/storefront/CompareBar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CLKAi — Laptops, Smartphones, Tablets, Accessories & Repairs",
    template: "%s | CLKAi",
  },
  description:
    "CLKAi is a multi-store electronics retailer in Maharashtra offering laptops, smartphones, tablets, accessories, networking products and repair services.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "CLKAi",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className="flex min-h-screen flex-col bg-white font-sans text-ink-900 antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CompareBar />
      </body>
    </html>
  );
}

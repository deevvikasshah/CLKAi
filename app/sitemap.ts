import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticRoutes = [
  "",
  "/shop",
  "/brands",
  "/offers",
  "/repairs",
  "/stores",
  "/corporate",
  "/about",
  "/contact",
  "/track-repair",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, stores, categories, policies] = await Promise.all([
    prisma.product.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    // Only verified, published stores are indexable — draft/unverified
    // placeholders must not be presented to search engines as real.
    prisma.store.findMany({
      where: { status: "published", isVerified: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.contentPage.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    ...staticRoutes.map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date() })),
    ...categories.map((c) => ({ url: `${siteUrl}/shop/${c.slug}` })),
    ...products.map((p) => ({ url: `${siteUrl}/product/${p.slug}`, lastModified: p.updatedAt })),
    ...stores.map((s) => ({ url: `${siteUrl}/stores/${s.slug}`, lastModified: s.updatedAt })),
    ...policies.map((p) => ({ url: `${siteUrl}/policies/${p.slug}`, lastModified: p.updatedAt })),
  ];
}

/**
 * SAMPLE / DEMO DATA — clearly marked, removable before launch.
 *
 * Every store record below is a placeholder pending verification by
 * CLKAi (see brief section "STORE LOCATOR"). Every product/price is
 * illustrative catalogue data for demoing the platform, not real CLKAi
 * inventory or pricing. Delete all of this via `npm run db:reset` (or a
 * fresh migration) before connecting real business data.
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SAMPLE data — remove before production launch.");

  // --- Admin users (demo credentials — rotate before launch) -------------
  const users = [
    { name: "Super Admin (Demo)", email: "superadmin@demo.clkai.local", role: "super_admin" },
    { name: "Ops Admin (Demo)", email: "opsadmin@demo.clkai.local", role: "ops_admin" },
    { name: "Store Manager – Pune (Demo)", email: "storemanager.pune@demo.clkai.local", role: "store_manager" },
    { name: "Catalog Manager (Demo)", email: "catalog@demo.clkai.local", role: "catalog_manager" },
    { name: "Repair Manager (Demo)", email: "repair@demo.clkai.local", role: "repair_manager" },
    { name: "Sales Executive (Demo)", email: "sales@demo.clkai.local", role: "sales_executive" },
    { name: "Support Executive (Demo)", email: "support@demo.clkai.local", role: "support_executive" },
    { name: "Finance Manager (Demo)", email: "finance@demo.clkai.local", role: "finance_manager" },
  ];
  const passwordHash = await hashPassword("ChangeMe!2024");

  const createdUsers: Record<string, string> = {};
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, role: u.role, passwordHash },
    });
    createdUsers[u.role] = user.id;
  }

  // --- Stores (placeholders pending verification) -------------------------
  const storeDefs = [
    { storeName: "CLKAi – Mumbai Store 1", slug: "mumbai-store-1", storeCode: "MUM-01", city: "Mumbai", state: "Maharashtra" },
    { storeName: "CLKAi – Mumbai Store 2", slug: "mumbai-store-2", storeCode: "MUM-02", city: "Mumbai", state: "Maharashtra" },
    { storeName: "CLKAi – Pune Store 1", slug: "pune-store-1", storeCode: "PUN-01", city: "Pune", state: "Maharashtra" },
    { storeName: "CLKAi – Pune Store 2", slug: "pune-store-2", storeCode: "PUN-02", city: "Pune", state: "Maharashtra" },
    { storeName: "CLKAi – Nashik Store 1", slug: "nashik-store-1", storeCode: "NAS-01", city: "Nashik", state: "Maharashtra" },
  ];

  const stores = [];
  for (const s of storeDefs) {
    const store = await prisma.store.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        storeName: s.storeName,
        slug: s.slug,
        storeCode: s.storeCode,
        status: "published",
        addressLine1: "Address pending verification by CLKAi",
        city: s.city,
        state: s.state,
        pincode: "000000",
        operationalState: "coming_soon",
        isVerified: false,
        pickupAvailable: true,
        repairAvailable: true,
        servicesJson: JSON.stringify(["sales", "laptop_repair", "smartphone_repair"]),
      },
    });
    stores.push(store);
  }

  await prisma.storeAssignment.upsert({
    where: { userId_storeId: { userId: createdUsers.store_manager, storeId: stores[2].id } },
    update: {},
    create: { userId: createdUsers.store_manager, storeId: stores[2].id },
  });

  // --- Brands (Dell explicitly disabled by default, per brief) ------------
  const brandDefs = [
    { name: "HP", slug: "hp" },
    { name: "Lenovo", slug: "lenovo" },
    { name: "ASUS", slug: "asus" },
    { name: "Acer", slug: "acer" },
    { name: "Samsung", slug: "samsung" },
    { name: "Xiaomi", slug: "xiaomi" },
    { name: "OPPO", slug: "oppo" },
    { name: "vivo", slug: "vivo" },
    { name: "Dell", slug: "dell", enabled: false },
  ];
  const brands: Record<string, string> = {};
  for (const b of brandDefs) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { enabled: b.enabled ?? true },
      create: { name: b.name, slug: b.slug, enabled: b.enabled ?? true },
    });
    brands[b.slug] = brand.id;
  }

  // --- Categories ----------------------------------------------------------
  const categoryDefs = [
    { name: "Laptops", slug: "laptops" },
    { name: "Smartphones", slug: "smartphones" },
    { name: "Tablets", slug: "tablets" },
    { name: "Accessories", slug: "accessories" },
    { name: "Gaming", slug: "gaming" },
    { name: "Networking", slug: "networking" },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoryDefs) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug },
    });
    categories[c.slug] = category.id;
  }

  // --- Sample products (illustrative catalogue data, not real inventory) --
  const productDefs = [
    {
      title: "14-inch Laptop, Core i5, 16GB RAM, 512GB SSD",
      slug: "sample-laptop-i5-16gb-512gb",
      brand: "hp",
      category: "laptops",
      sku: "DEMO-LAP-001",
      price: 62990,
      mrp: 68990,
      featured: true,
      bestSeller: true,
    },
    {
      title: "13-inch Laptop, Ryzen 5, 8GB RAM, 512GB SSD",
      slug: "sample-laptop-ryzen5-8gb-512gb",
      brand: "lenovo",
      category: "laptops",
      sku: "DEMO-LAP-002",
      price: 54990,
      mrp: 59990,
      newArrival: true,
    },
    {
      title: "6.5-inch Smartphone, 8GB/128GB",
      slug: "sample-smartphone-8gb-128gb",
      brand: "xiaomi",
      category: "smartphones",
      sku: "DEMO-PHN-001",
      price: 17999,
      mrp: 19999,
      featured: true,
    },
    {
      title: "6.7-inch Smartphone, 12GB/256GB",
      slug: "sample-smartphone-12gb-256gb",
      brand: "samsung",
      category: "smartphones",
      sku: "DEMO-PHN-002",
      price: 34999,
      mrp: 37999,
      bestSeller: true,
    },
    {
      title: "10.4-inch Tablet, Wi-Fi, 64GB",
      slug: "sample-tablet-wifi-64gb",
      brand: "samsung",
      category: "tablets",
      sku: "DEMO-TAB-001",
      price: 15999,
      mrp: 17999,
      newArrival: true,
    },
    {
      title: "Wireless Earbuds with Charging Case",
      slug: "sample-wireless-earbuds",
      brand: "xiaomi",
      category: "accessories",
      sku: "DEMO-ACC-001",
      price: 2499,
      mrp: 2999,
      featured: true,
    },
  ];

  for (const p of productDefs) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        brandId: brands[p.brand],
        categoryId: categories[p.category],
        sku: p.sku,
        status: "published",
        isFeatured: Boolean(p.featured),
        isBestSeller: Boolean(p.bestSeller),
        isNewArrival: Boolean(p.newArrival),
        description: "Sample catalogue entry for demo purposes.",
      },
    });

    await prisma.productVariant.upsert({
      where: { sku: `${p.sku}-V1` },
      update: {},
      create: {
        productId: product.id,
        variantName: "Standard",
        sku: `${p.sku}-V1`,
        price: p.price,
        mrp: p.mrp,
        isDefault: true,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Demo admin logins (password: ChangeMe!2024):");
  for (const u of users) console.log(`  ${u.role.padEnd(16)} ${u.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { ROLES } from "@/lib/roles";
import { slugify } from "@/lib/storeValidation";

const CATALOG_ROLES = [ROLES.SUPER_ADMIN, ROLES.OPS_ADMIN, ROLES.CATALOG_MANAGER];

export async function toggleBrandEnabled(formData: FormData) {
  const session = await requireRole(...CATALOG_ROLES);
  const brandId = String(formData.get("brandId") ?? "");
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) throw new Error("Brand not found.");

  const nextEnabled = !brand.enabled;
  await prisma.brand.update({ where: { id: brandId }, data: { enabled: nextEnabled } });

  await writeAuditLog({
    actorUserId: session.userId,
    action: nextEnabled ? "brand.enable" : "brand.disable",
    entityType: "Brand",
    entityId: brandId,
    metadata: { brandName: brand.name },
  });

  revalidatePath("/admin/brands");
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function createBrand(formData: FormData) {
  const session = await requireRole(...CATALOG_ROLES);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Brand name is required.");

  const slug = slugify(name);
  const dupe = await prisma.brand.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (dupe) throw new Error("A brand with this name already exists.");

  const brand = await prisma.brand.create({ data: { name, slug, enabled: true } });
  await writeAuditLog({ actorUserId: session.userId, action: "brand.create", entityType: "Brand", entityId: brand.id });

  revalidatePath("/admin/brands");
}

const productSchema = z.object({
  title: z.string().min(1, "Title is required."),
  brandId: z.string().min(1, "Brand is required."),
  categoryId: z.string().min(1, "Category is required."),
  sku: z.string().min(1, "SKU is required."),
  modelNumber: z.string().optional(),
  description: z.string().optional(),
  condition: z.enum(["new", "refurbished"]),
  refurbishedGrade: z.string().optional(),
  warrantyText: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  price: z.coerce.number().positive("Price must be greater than 0."),
  mrp: z.coerce.number().optional(),
  isFeatured: z.literal("on").optional(),
  isBestSeller: z.literal("on").optional(),
  isNewArrival: z.literal("on").optional(),
});

function toProductFormObject(formData: FormData) {
  return {
    title: formData.get("title"),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    sku: formData.get("sku"),
    modelNumber: formData.get("modelNumber") || undefined,
    description: formData.get("description") || undefined,
    condition: formData.get("condition"),
    refurbishedGrade: formData.get("refurbishedGrade") || undefined,
    warrantyText: formData.get("warrantyText") || undefined,
    status: formData.get("status"),
    price: formData.get("price"),
    mrp: formData.get("mrp") || undefined,
    isFeatured: formData.get("isFeatured") || undefined,
    isBestSeller: formData.get("isBestSeller") || undefined,
    isNewArrival: formData.get("isNewArrival") || undefined,
  };
}

export async function createProduct(formData: FormData) {
  const session = await requireRole(...CATALOG_ROLES);
  const parsed = productSchema.safeParse(toProductFormObject(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the product details.");
  const data = parsed.data;

  const slug = slugify(data.title);
  const [dupeSku, dupeSlug] = await Promise.all([
    prisma.product.findUnique({ where: { sku: data.sku } }),
    prisma.product.findUnique({ where: { slug } }),
  ]);
  if (dupeSku) throw new Error("A product with this SKU already exists.");
  if (dupeSlug) throw new Error("A product with this title already exists. Try a more specific title.");

  const product = await prisma.product.create({
    data: {
      title: data.title,
      slug,
      brandId: data.brandId,
      categoryId: data.categoryId,
      sku: data.sku,
      modelNumber: data.modelNumber || null,
      description: data.description || null,
      condition: data.condition,
      refurbishedGrade: data.condition === "refurbished" ? data.refurbishedGrade || null : null,
      warrantyText: data.warrantyText || null,
      status: data.status,
      isFeatured: data.isFeatured === "on",
      isBestSeller: data.isBestSeller === "on",
      isNewArrival: data.isNewArrival === "on",
      variants: {
        create: {
          variantName: "Standard",
          sku: `${data.sku}-V1`,
          price: data.price,
          mrp: data.mrp || null,
          isDefault: true,
        },
      },
    },
  });

  await writeAuditLog({ actorUserId: session.userId, action: "product.create", entityType: "Product", entityId: product.id });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(formData: FormData) {
  const session = await requireRole(...CATALOG_ROLES);
  const productId = String(formData.get("productId") ?? "");
  if (!productId) throw new Error("Missing product id.");

  const parsed = productSchema.safeParse(toProductFormObject(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the product details.");
  const data = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id: productId }, include: { variants: true } });
  if (!existing) throw new Error("Product not found.");

  const dupeSku = await prisma.product.findFirst({ where: { sku: data.sku, id: { not: productId } } });
  if (dupeSku) throw new Error("A product with this SKU already exists.");

  await prisma.product.update({
    where: { id: productId },
    data: {
      title: data.title,
      brandId: data.brandId,
      categoryId: data.categoryId,
      sku: data.sku,
      modelNumber: data.modelNumber || null,
      description: data.description || null,
      condition: data.condition,
      refurbishedGrade: data.condition === "refurbished" ? data.refurbishedGrade || null : null,
      warrantyText: data.warrantyText || null,
      status: data.status,
      isFeatured: data.isFeatured === "on",
      isBestSeller: data.isBestSeller === "on",
      isNewArrival: data.isNewArrival === "on",
    },
  });

  const defaultVariant = existing.variants.find((v) => v.isDefault) ?? existing.variants[0];
  if (defaultVariant) {
    await prisma.productVariant.update({
      where: { id: defaultVariant.id },
      data: { price: data.price, mrp: data.mrp || null },
    });
  }

  await writeAuditLog({
    actorUserId: session.userId,
    action: "product.update",
    entityType: "Product",
    entityId: productId,
    metadata: { newPrice: data.price },
  });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

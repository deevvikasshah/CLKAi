import { z } from "zod";

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const storeAdminSchema = z.object({
  storeName: z.string().min(1, "Store name is required."),
  storeCode: z.string().min(1, "Store code is required."),
  addressLine1: z.string().min(1, "Address is required."),
  addressLine2: z.string().optional(),
  locality: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  mapUrl: z.string().url().optional().or(z.literal("")),
  storeManagerName: z.string().optional(),
  pickupAvailable: z.literal("on").optional(),
  repairAvailable: z.literal("on").optional(),
  corporateSupportAvailable: z.literal("on").optional(),
  operationalState: z.enum(["open", "closed", "temporarily_closed", "coming_soon"]),
  services: z.array(z.string()).optional(),
});

// Fields a Store Manager may edit on their own assigned store — operational
// detail only, never identity/address fields that affect the SEO-friendly
// store page's canonical facts or duplicate-prevention checks.
export const storeManagerEditableSchema = z.object({
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  storeManagerName: z.string().optional(),
  operationalState: z.enum(["open", "closed", "temporarily_closed", "coming_soon"]),
  services: z.array(z.string()).optional(),
  pickupAvailable: z.literal("on").optional(),
  repairAvailable: z.literal("on").optional(),
  corporateSupportAvailable: z.literal("on").optional(),
});

export const availableServiceOptions = [
  "sales",
  "laptop_repair",
  "smartphone_repair",
  "tablet_repair",
  "pickup_drop",
  "corporate_support",
  "store_pickup",
];

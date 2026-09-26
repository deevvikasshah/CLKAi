/**
 * Editable business configuration. Every value here is a placeholder until
 * CLKAi supplies verified information — never fabricate a value in this
 * file, and never let a component render an unverified value as if it
 * were confirmed (use the `*_pending` flags to guard display).
 */
export const siteConfig = {
  brandName: "CLKAi",
  logoStatus: "placeholder" as "placeholder" | "official", // flip once the real logo file is supplied
  logoPlaceholderLabel: "Official CLKAi logo to be added.",

  contact: {
    phone: null as string | null,
    whatsapp: null as string | null,
    email: null as string | null,
    registeredAddress: null as string | null,
  },

  security: {
    // Responsible-disclosure contact. Set once CLKAi designates one —
    // never invent an address here.
    disclosureEmail: null as string | null,
  },

  legal: {
    gstin: null as string | null, // only render if non-null AND approved for public display
  },

  social: {
    instagram: null as string | null,
    facebook: null as string | null,
    linkedin: null as string | null,
  },

  policyVersion: "v0-draft", // bump whenever a legal page's substance changes; recorded on every consent capture
};

export const repairWarrantyFallback =
  "Repair warranty terms will be confirmed by the store after device diagnosis.";

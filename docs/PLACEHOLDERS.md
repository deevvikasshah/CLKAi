# Placeholders CLKAi Must Replace Before Launch

Every item below is either a placeholder value or sample/demo data. None of
it should reach production as-is.

## Business configuration (`lib/siteConfig.ts`)

- [ ] `logoStatus` — currently `"placeholder"`; the header shows "Official
      CLKAi logo to be added." Flip to `"official"` and add the real logo
      once supplied.
- [ ] `contact.phone`, `contact.whatsapp`, `contact.email`,
      `contact.registeredAddress` — all `null`. The Contact page shows an
      honest "details pending" message until these are set.
- [ ] `security.disclosureEmail` — `null`. The Security page points to the
      general Contact page until this is set.
- [ ] `legal.gstin` — `null`. Set only once CLKAi confirms a valid GSTIN
      approved for public display.
- [ ] `social.instagram` / `.facebook` / `.linkedin` — all `null`. Footer
      only shows social links that are actually set.
- [ ] `policyVersion` — currently `"v0-draft"`. Bump this string every time
      a legal policy's substance changes; it's recorded on every consent
      capture for audit purposes.

## Store data (`prisma/seed.ts`)

Five placeholder stores, all marked `isVerified: false` (shown to customers
as "Store details pending verification by CLKAi"):

- [ ] CLKAi – Mumbai Store 1 / Store 2
- [ ] CLKAi – Pune Store 1 / Store 2
- [ ] CLKAi – Nashik Store 1

Each has a placeholder address (`"Address pending verification by
CLKAi"`), pincode `000000`, no phone/email/coordinates, and
`operationalState: "coming_soon"`. Replace every field with CLKAi-verified
data via `/admin/stores/[storeId]`, then mark it verified and published.

Do not run `npm run db:seed` against a production database — instead, add
real stores through the admin UI once launched, or write a separate,
real-data seed script.

## Demo staff accounts (`prisma/seed.ts`)

Eight demo accounts (one per role), all sharing the password
`ChangeMe!2024`:

- [ ] Rotate or remove every demo account's password before any non-developer
      has access to the production deployment.
- [ ] Create real staff accounts with real names/emails for launch.

## Sample product catalogue (`prisma/seed.ts`)

Six illustrative products (sample laptops, smartphones, a tablet, wireless
earbuds) with placeholder SKUs (`DEMO-*`), illustrative prices, and no real
images. These exist to demo the platform's catalogue features, not as real
CLKAi inventory.

- [ ] Remove all `DEMO-*` products before launch (or replace with real
      catalogue data) via `/admin/products`.

## Legal policy pages (`lib/legalContentSeed.ts`)

All 8 policy pages are honest placeholder text with `needsLegalReview:
true` — see `docs/PRIVACY-LEGAL-CHECKLIST.md` for the full list and what
needs legal review.

## Product/store images

- [ ] No product or store images exist anywhere — every product card, PDP,
      and store page shows a text placeholder ("Product image pending" /
      "Store image"). Real images require both real photography/product
      shots AND a file-upload feature to be built (see README's "not built
      yet" section) or, as an interim step, image URL fields to be
      populated manually via the admin forms once hosted images exist
      somewhere.

## Infrastructure placeholders (`.env.example`)

- [ ] `SESSION_SECRET` — generate a real random value per environment;
      never reuse the one in this repo's local `.env`.
- [ ] `NEXT_PUBLIC_SITE_URL` — set to the real production domain.
- [ ] `PAYMENT_PROVIDER` + gateway keys — unset (mock provider active)
      until CLKAi selects and configures a real gateway.
- [ ] `GOOGLE_MAPS_API_KEY` — unset. If added, must be restricted by HTTP
      referrer and API scope before use.
- [ ] Object storage vars — unset; needed once file uploads are built.

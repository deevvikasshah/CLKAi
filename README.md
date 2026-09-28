# CLKAi Platform

Multi-store ecommerce and repair-service platform for CLKAi, an electronics
retailer operating in Mumbai, Pune and Nashik, Maharashtra.


## Stack

- **Next.js 14 (App Router)** + TypeScript + Tailwind CSS — full-stack, one
  deployable app (no separate backend service to run or pay for).
- **Prisma** ORM, **SQLite** in development (zero infra), designed to swap to
  **Postgres** in production (Neon or Supabase's free/low tier — affordable,
  no server to manage) by changing one env var and one line in
  `prisma/schema.prisma`. See `docs/DEPLOYMENT.md`.
- Custom session auth (`jose` JWT in an HttpOnly cookie + `bcryptjs`), not a
  third-party auth framework — kept deliberately simple.
- Server Actions for all mutations (cart, checkout, repair booking, admin
  CRUD) rather than a hand-rolled JSON API — gets Next's built-in
  origin-check CSRF protection for free and works with JavaScript disabled.
- A gateway-agnostic `PaymentProvider` interface (`lib/payments/`) with a
  mock provider for development; swap in Razorpay/Cashfree/PayU/PhonePe once
  CLKAi has a merchant account, without touching checkout code.

## Getting started

```bash
npm install
cp .env.example .env        # then fill in SESSION_SECRET (see the file)
npm run db:migrate          # creates prisma/dev.db and applies the schema
npm run db:seed             # SAMPLE data — see docs/PLACEHOLDERS.md
npm run dev
```

Demo admin logins are printed by the seed script (password `ChangeMe!2024`
for all of them — rotate before anyone but you uses this).

## Documentation

- `docs/DEPLOYMENT.md` — how to take this to production (Postgres, hosting,
  env vars, payment/maps keys).
- `docs/ADMIN-GUIDE.md` — walkthroughs for adding a product, an offer, a
  repair service catalogue entry, and a new store.
- `docs/SECURITY-CHECKLIST.md` — what's done, what's pending, before launch.
- `docs/PRIVACY-LEGAL-CHECKLIST.md` — India privacy/consumer-law items that
  need a qualified legal review before public launch.
- `docs/TESTING-CHECKLISTS.md` — ecommerce, repair booking, store publishing,
  performance and accessibility test checklists.
- `docs/PLACEHOLDERS.md` — every placeholder value in this codebase that
  CLKAi must replace with real, verified information before launch.

## What is deliberately not built yet

These are documented gaps, not oversights — each is blocked on either a
business decision or infrastructure CLKAi hasn't provided, and building a
fake version of any of them would violate the "never invent" requirement
this project was built under:

- **Real payment gateway** — no merchant account/keys exist yet; the mock
  provider lets checkout be fully built and tested.
- **File uploads for product/store images** — product and store images are
  URL fields today, not an upload pipeline. No object storage credentials
  exist yet to build this against safely.
- **Password reset / email** — no transactional email provider configured.
- **CAPTCHA / bot protection** — no provider key configured.
- **Admin MFA** — schema fields (`mfaEnabled`, `mfaSecret`) exist; the TOTP
  enrollment/verification UI is not built.
- **Full multi-variant product editor** — the schema supports multiple
  variants per product (size/color/storage combinations with independent
  pricing and stock); the admin UI currently edits only a product's single
  default variant. Creating additional variants requires a direct database
  edit today.

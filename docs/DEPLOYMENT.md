# Deployment

## 1. Database: move from SQLite (dev) to Postgres (production)

1. Create a free/low-cost Postgres instance — Neon or Supabase both have a
   free tier suitable for launch traffic.
2. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   to:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   No other schema changes are needed — every field type used in this
   schema was chosen to work identically on both connectors.
3. Set `DATABASE_URL` to the Postgres connection string.
4. Run `npx prisma migrate deploy` against the new database (this replays
   the existing migration history; do **not** run `migrate dev` in
   production).
5. Do **not** run `npm run db:seed` against production — that script is
   sample/demo data only (see `docs/PLACEHOLDERS.md`).

## 2. Hosting

This is a standard Next.js app — deploy to Vercel, or any Node hosting that
runs `npm run build && npm run start`. No separate backend server, message
queue, or container orchestration is required.

## 3. Required environment variables

See `.env.example` for the full list with explanations. At minimum for
production:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Postgres connection string (see above) |
| `SESSION_SECRET` | Random, 32+ characters. Generate with `openssl rand -base64 48`. Rotating this invalidates all active sessions. |
| `NEXT_PUBLIC_SITE_URL` | The real production domain, no trailing slash. Used for canonical URLs, Open Graph, and the sitemap. |
| `ENABLE_HSTS` | Set to `1` only after confirming the production deployment serves every request over HTTPS end-to-end. |

Optional, once CLKAi has the relevant account/keys:

| Variable | Notes |
|---|---|
| `PAYMENT_PROVIDER` + gateway keys | See `lib/payments/`. Currently only `mock` is implemented. |
| `GOOGLE_MAPS_API_KEY` | **Restrict this key** in Google Cloud Console (HTTP referrer + Maps JavaScript API scope) before using it anywhere. Never commit an unrestricted key. |
| Object storage vars | Needed once a file-upload feature is built (see README's "not built yet" section). |

## 4. Before going live

Run through, in order:

1. `docs/SECURITY-CHECKLIST.md`
2. `docs/PRIVACY-LEGAL-CHECKLIST.md`
3. `docs/TESTING-CHECKLISTS.md`
4. `docs/PLACEHOLDERS.md` — confirm every item has been replaced with real,
   verified CLKAi data.

## 5. Known framework-level risk to resolve before launch

`npm audit` flags several Next.js CVEs (Server Action DoS, RSC cache
poisoning/confusion) whose fixes only landed in Next 15/16 — 14.2.35 (used
here) is the latest available 14.x patch. Most of the flagged advisories
don't apply to this app's actual surface (no middleware, no `next/image`
usage, no custom server, no i18n), but the Server Action-related ones do,
given how heavily this app uses them. Plan a deliberate major-version
upgrade (with full regression testing — Server Action signatures and some
APIs changed between 14 and 15/16) before or shortly after public launch.

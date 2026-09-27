# Security Launch Checklist

Status reflects what's actually implemented and verified in this codebase
as of the last commit, not aspirational goals. Never mark an item done
without checking it against the running app.

## Done

- [x] HTTPS/HSTS: HSTS header ships behind `ENABLE_HSTS=1`, to be set only
      once HTTPS is confirmed end-to-end in production (`next.config.js`).
- [x] Security headers: CSP, X-Content-Type-Options, X-Frame-Options,
      Permissions-Policy, Referrer-Policy — verified present on live
      responses, not just declared in config.
- [x] Passwords hashed with bcrypt (12 rounds), never stored plaintext.
- [x] Session cookie is HttpOnly, Secure, SameSite=Lax — verified on the
      wire, not just in source.
- [x] Server-side RBAC for all 8 staff roles (`lib/roles.ts`,
      `lib/authz.ts`) — verified with real logins against every role's
      allowed/denied routes.
- [x] Store-scoped IDOR prevention: a Store Manager cannot open, edit, or
      manage repair bookings for a store they aren't assigned to — verified
      live, not just by code review.
- [x] Cart/wishlist ownership checks: mutating another cart's item or
      another account's wishlist item is rejected server-side
      (`assertOwnsCartItem`, wishlist owner check).
- [x] Order confirmation IDOR: an order tied to an account requires that
      account's session to view; a guest order's unguessable order number
      is its own access token (standard pattern for guest checkout).
- [x] Zod validation on every form-backed Server Action (checkout, repair
      booking, corporate/contact enquiries, product enquiry, store/product
      admin forms).
- [x] Rate limiting on login, checkout, repair booking, contact/corporate
      forms, product enquiry, newsletter, and a default limit on cart
      mutations (`lib/rateLimit.ts`). Verified live — 5 failed logins trip
      a 429.
- [x] Audit logging on every sensitive admin action (login
      success/failure, store publish/unpublish/verify/archive, product
      create/update, brand enable/disable, offer create/deactivate, repair
      status change, order status change, enquiry status change).
- [x] Generic "invalid email or password" on login failure — doesn't leak
      whether an account exists.
- [x] Server Actions used for all mutations, not a hand-rolled JSON API —
      gets Next's built-in Server Action origin-check CSRF protection.
- [x] Secrets via environment variables only; `.env` is git-ignored;
      `.env.example` contains no real secrets.
- [x] Dependency lockfile (`package-lock.json`) committed.
- [x] Dell is disabled by default at the data layer, not just hidden in the
      UI — verified via a direct DB query, not just "the page doesn't show
      it."

## Pending — needs infrastructure or a business decision CLKAi hasn't provided

- [ ] **Real payment gateway.** Mock provider only; wire a real gateway
      (Razorpay/Cashfree/PayU/PhonePe) once CLKAi has a merchant account.
      Never store raw card/UPI/CVV/OTP data regardless of gateway chosen —
      use that gateway's hosted checkout/tokenization.
- [ ] **CAPTCHA / bot protection** on public forms (contact, repair
      booking, corporate enquiry, newsletter). No provider key configured.
- [ ] **Password reset flow.** No transactional email provider configured;
      building this without one means either it doesn't work or a fake
      "email sent" message — neither is acceptable.
- [ ] **Admin MFA.** Schema fields exist (`mfaEnabled`, `mfaSecret`); TOTP
      enrollment/verification UI is not built.
- [ ] **File upload validation** (extension + MIME + magic-byte signature
      check, size limits, executable-file rejection, safe renaming, storage
      outside the web root). No upload feature exists yet to validate —
      build this alongside the upload feature, not before it.
- [ ] **Independent penetration test** before public launch and after any
      major feature change, per the original brief. Nothing in this
      checklist substitutes for one.
- [ ] **Major Next.js version upgrade** (14 → 15/16) to close the
      framework-level CVEs `npm audit` flags for Server Actions/RSC caching
      — see `docs/DEPLOYMENT.md` §5. This is a deliberate, tested migration,
      not a patch-level bump.
- [ ] **Rate limiter durability.** Current limiter is in-memory
      (single-instance only, by design — see `lib/rateLimit.ts`'s own
      comment). If CLKAi scales to multiple server instances, swap it for a
      shared store (e.g. Upstash Redis) so limits apply across instances.
- [ ] **Uptime/error monitoring** and an incident-response contact — set up
      once a hosting provider is chosen (Vercel Analytics/Sentry or
      equivalent).
- [ ] **Encrypted backups + restoration test** for the production database
      — depends on the chosen Postgres provider's backup tooling.

## Verify again after any major feature change

- [ ] Re-run the RBAC test matrix (all 8 roles × their allowed/denied
      admin routes) if `lib/roles.ts` or any `requireRole`/`requireStoreAccess`
      call site changes.
- [ ] Re-check every new form-backed Server Action has: Zod validation,
      a rate limit, and (if it touches another user's data) an ownership
      check.

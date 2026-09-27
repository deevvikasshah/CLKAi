# Testing Checklists

Items marked [x] were actually run against the live app during
development (not just asserted) — see the commit history for the specific
verification runs. Items marked [ ] are what to run before each launch and
after major changes.

## Ecommerce testing

- [x] Browse shop with category/brand/price/condition filters and sorting.
- [x] Add to cart (guest and, separately, while signed in).
- [x] Update quantity / remove item in cart.
- [x] Guest checkout end-to-end: address form validation (Indian mobile
      format, 6-digit pincode) → order created → mock payment captured →
      confirmation page.
- [x] Order confirmation page requires login for an account-linked order;
      a guest order's link works without one.
- [x] Wishlist requires login; redirects there otherwise.
- [x] Compare: select up to 4 products across pages, view side-by-side
      spec table.
- [ ] Re-run full checkout once a real payment gateway is wired in place
      of the mock provider — this is the highest-risk swap in the whole
      app and needs its own dedicated test pass (success, failure,
      webhook signature verification, refund).
- [ ] Test with JavaScript disabled — Server Actions should still work for
      cart/checkout/wishlist since they're plain form submissions.

## Repair booking testing

- [x] Full booking flow: device type → issue type → store → service mode →
      contact → required data-diagnostics consent → reference number.
- [x] Reference number + phone number lookup on `/track-repair` shows the
      correct status timeline.
- [x] Wrong phone number for a valid reference number is rejected with a
      generic message (doesn't confirm the reference number is real).
- [x] Admin repair status updates flow through to the public tracking page.
- [x] Store Manager can update bookings only for their assigned store(s);
      attempting another store's booking redirects them away.
- [ ] Test "pickup and drop" rejection when the selected store doesn't
      offer that service (the server-side re-check exists — add an
      automated test or manual click-through before launch).

## New-store publishing testing

- [x] Create store → confirm it's Draft and invisible on `/stores`.
- [x] Publish (Super Admin only) → confirm it appears in the Store Locator,
      its own `/stores/[slug]` page, and the repair-booking store selector.
- [x] Confirm a Store Manager assigned to a different store cannot open
      this store's edit page (redirected to `/admin/stores`).
- [x] Confirm duplicate store name / store code is rejected on create.
- [ ] Confirm the store also appears correctly filtered by city and by
      service in `/stores` once it has real coordinates and services set.
- [ ] Test "Use My Location" distance sort with a real browser location
      grant and with it denied — search must remain fully usable either
      way (implemented; needs a manual click-through per browser/OS
      before launch, since geolocation permission UX varies).

## Performance & accessibility testing

- [x] `npm run build` produces no unexpected fully-static (non-revalidating)
      pages that read from the database — this exact class of bug was
      caught and fixed once already (`/repairs` was serving a build-time
      cached store list; see Phase 5's commit).
- [x] Every interactive element swept for the shared `.focus-ring` class;
      four missing instances found and fixed (Phase 9).
- [ ] Run Lighthouse (mobile) against the production deployment once
      real product/store images are in place — current pages have no
      images at all (text placeholders), so a Lighthouse run today would
      not reflect real-world performance.
- [ ] Run an automated accessibility audit (e.g. axe) against the
      production deployment — manual review covered focus states and
      semantic structure; a full automated pass has not been run.
- [ ] Screen-reader pass on: product filters, cart, checkout form, repair
      booking form (the most complex multi-field forms in the app).

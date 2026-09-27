# Privacy & Legal Review Checklist (India)

This platform is **not** claimed to be legally compliant, government-approved,
or certified. Every item below needs review by a qualified Indian legal/
compliance professional before public launch — this checklist tracks what
exists to review, not a compliance guarantee.

## Legal policy pages — all currently drafts

Every page under `/policies/[slug]` is seeded with honest placeholder text
and flagged `needsLegalReview: true` in the `ContentPage` table, which shows
a visible "this is a draft, not yet reviewed" banner to visitors. Before
launch, each of these needs real legal-reviewed content, and
`needsLegalReview` should be set to `false` only once that review is done:

- [ ] Shipping Policy (`/policies/shipping`)
- [ ] Return and Refund Policy (`/policies/returns`)
- [ ] Cancellation Policy (`/policies/cancellation`)
- [ ] Privacy Policy (`/policies/privacy`)
- [ ] Terms of Use (`/policies/terms`)
- [ ] Cookie Policy (`/policies/cookies`)
- [ ] Warranty Information (`/policies/warranty`)
- [ ] Repair Service Terms (`/policies/repair-terms`)

## Consent handling — implemented, verify it matches counsel's guidance

- [x] Marketing consent checkboxes are unchecked by default everywhere
      (newsletter, contact form, corporate enquiry) and are optional —
      submitting the surrounding form never requires checking them.
- [x] The repair-booking data-diagnostics consent is a separate, required
      checkbox (not marketing consent) recorded before any device
      diagnostic activity.
- [x] Every consent capture writes a `ConsentRecord` row with timestamp,
      purpose, policy version, source page, and (where available) the
      customer's email/phone as identifier.
- [ ] **Counsel review needed**: confirm the specific purposes tracked
      (`newsletter_marketing`, `repair_diagnostics`,
      `corporate_enquiry_follow_up`, `marketing`) and their wording match
      what's legally required to be disclosed at the point of collection.

## Data collected — verify against actual necessity

- [x] Repair booking forms never ask for device passwords, banking
      details, UPI PINs, or OTPs.
- [x] Checkout collects only what's needed to fulfil an order (name, phone,
      address; email only for guests).
- [ ] **Counsel review needed**: data retention periods for customer
      accounts, enquiries, repair bookings, orders, and consent records are
      not yet configured anywhere (no TTL/deletion job exists). Define
      retention periods and implement deletion before launch.
- [ ] **Counsel review needed**: process for a customer to request access,
      correction, or deletion of their data. Currently this would be a
      manual process via the Contact page — confirm that's acceptable or
      needs a self-service flow.

## Cookies

- [x] No analytics or marketing cookies are set anywhere in this codebase
      today — only the necessary session/cart cookies (`clkai_session`,
      `clkai_cart`), both HttpOnly and functionally required.
- [ ] If/when analytics or marketing tooling is added, implement the
      Necessary/Functional/Analytics/Marketing category split the original
      brief calls for, and gate non-essential categories behind consent
      before they activate.

## GSTIN / business credentials

- [x] `siteConfig.legal.gstin` is `null` and only renders in the footer if
      set — no placeholder GSTIN is displayed anywhere.
- [ ] Set once CLKAi confirms a valid GSTIN approved for public display.

## Repair-specific disclosures — implemented

- [x] "Back up your data before handing over your device" notice shown on
      `/repairs` before the booking form.
- [x] "Data recovery is best-effort, not guaranteed" disclaimer shown in
      the same place.
- [x] No device passwords requested or stored in any repair form.
- [x] Repair warranty defaults to "will be confirmed by the store after
      diagnosis" until a staff member fills in real warranty text for a
      specific booking.

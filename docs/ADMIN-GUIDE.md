# Admin User Guide

Sign in at `/login` with a staff account, then use the role-appropriate
links on `/admin` (only the sections your role can access are shown).

## Add a new store

Requires **Super Admin** or **Ops Admin**.

1. Go to **Manage Stores** → **+ New store**.
2. Fill in the address, contact details, opening hours, services offered,
   and whether pickup/repair/corporate support are available at this store.
3. Submit — the store is created as **Draft** and is not visible to
   customers yet.
4. Open the store from the list, review the details, and if you're
   confident the address/contact/hours are accurate, click **Mark details
   as verified** (this removes the "pending verification" notice customers
   would otherwise see).
5. Click **Publish** (**Super Admin only**). The store immediately appears
   in the Store Locator, its own `/stores/[slug]` page, the homepage store
   section, city/service filters, and the repair-booking store selector.

A **Store Manager** can edit only their own assigned store(s), and only
operational fields (contact info, hours, services, manager name) — not the
address, name, or store code, and they cannot publish/unpublish.

## Add a new product

Requires **Catalog Manager**, **Ops Admin**, or **Super Admin**.

1. Go to **Manage Products** → **+ New product**.
2. Fill in title, brand, category, SKU, condition (New/Refurbished — pick
   Refurbished only for genuinely refurbished units, and fill in the grade),
   price, and optional MRP.
3. Set **Status** to Draft while you're still working on it, or Published
   to make it visible in the shop immediately.
4. Save — the product now has one variant ("Standard") with the price you
   set. Creating additional variants (different storage/color/RAM
   combinations) currently requires a direct database edit — see the
   README's "not built yet" section.

To disable a brand (or re-enable one), go to **Manage Brands**. Dell is
seeded disabled by default per CLKAi policy — leave it disabled unless
CLKAi has explicitly authorized selling Dell products.

## Add an offer

Requires **Ops Admin** or **Super Admin**.

1. Go to **Manage Offers**.
2. Fill in the title, offer type, start/end date, and — this is required —
   the terms and conditions text. An offer without terms cannot be created.
3. The offer appears on the public `/offers` page automatically once its
   start date arrives, and disappears automatically once its end date
   passes. To end an offer early, click **Deactivate**.

## Add/manage a repair service booking

Repair bookings are created by customers on `/repairs`, not by admins. As a
**Repair Manager** (or a **Store Manager** for their own store's bookings):

1. Go to **Repair Bookings** and open the booking you need to update.
2. Update the status (this follows the fixed flow: Request Received →
   Awaiting Customer Response → Device Received → Diagnosis in Progress →
   Estimate Shared → Awaiting Approval → Repair in Progress → Ready for
   Pickup → Completed, or Cancelled at any point).
3. Fill in the diagnostic fee, estimate amount, and repair warranty text
   only once you actually know them — leave them blank otherwise. The
   public tracking page shows the store's standard "warranty terms will be
   confirmed after diagnosis" line until you fill in real warranty text.
4. Add an internal note if useful — notes are visible to staff only, never
   to the customer on the public tracking page.

## Everyone else

- **Sales Executive** / **Support Executive**: **Enquiries** — respond to
  general and corporate enquiries, update their status.
- **Finance / Order Manager**: **Orders** — update order status as it moves
  through fulfillment.
- **Super Admin only**: **Audit Log** — the last 100 sensitive actions
  (logins, publishes, price changes, status changes, etc.) with actor, IP,
  and timestamp.

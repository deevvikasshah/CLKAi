import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { createOffer, deactivateOffer } from "@/app/actions/adminOffers";

export const metadata = { title: "Manage Offers" };
export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, PERMISSIONS.MANAGE_OFFERS)) redirect("/admin");

  const offers = await prisma.offer.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Manage Offers</h1>
      <p className="mt-1 text-sm text-ink-500">
        Offers automatically stop showing on the public Offers page once their end date passes.
      </p>

      <form action={createOffer} className="mt-6 flex flex-col gap-4 rounded-lg border border-ink-100 p-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-ink-700">
            Title
          </label>
          <input id="title" name="title" required className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium text-ink-700">
            Description (optional)
          </label>
          <textarea id="description" name="description" rows={2} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scopeType" className="text-sm font-medium text-ink-700">
            Offer type
          </label>
          <select id="scopeType" name="scopeType" className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring sm:max-w-xs">
            <option value="seasonal">Seasonal</option>
            <option value="product">Product-specific</option>
            <option value="brand">Brand-specific</option>
            <option value="store">Store-specific</option>
            <option value="bank">Bank/card offer</option>
            <option value="exchange">Exchange/trade-in</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="startsAt" className="text-sm font-medium text-ink-700">
              Starts
            </label>
            <input id="startsAt" name="startsAt" type="datetime-local" required className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="endsAt" className="text-sm font-medium text-ink-700">
              Ends
            </label>
            <input id="endsAt" name="endsAt" type="datetime-local" required className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="termsText" className="text-sm font-medium text-ink-700">
            Terms and conditions
          </label>
          <textarea id="termsText" name="termsText" required rows={2} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <button type="submit" className="self-start rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring">
          Create offer
        </button>
      </form>

      <div className="mt-6 divide-y divide-ink-100 rounded-lg border border-ink-100">
        {offers.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">{o.title}</p>
              <p className="text-xs text-ink-500">
                {o.startsAt.toLocaleDateString("en-IN")} – {o.endsAt.toLocaleDateString("en-IN")} · {o.active ? "Active" : "Deactivated"}
              </p>
            </div>
            {o.active && (
              <form action={deactivateOffer}>
                <input type="hidden" name="offerId" value={o.id} />
                <button type="submit" className="text-xs font-semibold text-red-600 hover:text-red-500 focus-ring">
                  Deactivate
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

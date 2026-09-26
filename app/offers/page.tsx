import { prisma } from "@/lib/prisma";

export const metadata = { title: "Offers" };
export const revalidate = 30;

export default async function OffersPage() {
  const now = new Date();
  const offers = await prisma.offer.findMany({
    where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { startsAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Offers</h1>

      {offers.length === 0 ? (
        <p className="mt-6 rounded-lg border border-ink-100 bg-ink-50 px-6 py-12 text-center text-sm text-ink-500">
          There are no active offers right now. Check back soon, or ask your nearest store about current pricing.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-lg border border-ink-100 p-5">
              <h2 className="text-base font-semibold text-ink-900">{offer.title}</h2>
              {offer.description && <p className="mt-1 text-sm text-ink-700">{offer.description}</p>}
              <p className="mt-2 text-xs text-ink-500">
                Valid {offer.startsAt.toLocaleDateString("en-IN")} – {offer.endsAt.toLocaleDateString("en-IN")}
              </p>
              <p className="mt-2 text-xs text-ink-500">{offer.termsText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

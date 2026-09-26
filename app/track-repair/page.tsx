import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rateLimit";
import { repairStatusLabels, repairStatusFlow, type RepairStatus } from "@/lib/repairConstants";

export const metadata = { title: "Track Repair" };

interface TrackRepairPageProps {
  searchParams: { ref?: string; phone?: string; justBooked?: string };
}

export default async function TrackRepairPage({ searchParams }: TrackRepairPageProps) {
  const ref = searchParams.ref?.trim();
  const phone = searchParams.phone?.replace(/\D/g, "");
  const justBooked = searchParams.justBooked === "1";

  let booking: Awaited<ReturnType<typeof lookupBooking>> = null;
  let lookupError: string | null = null;

  if (ref && phone) {
    const ip = getClientIp(headers());
    const limited = rateLimit(`track-repair:${ip}`, RATE_LIMITS.DEFAULT_API.limit, RATE_LIMITS.DEFAULT_API.windowMs);
    if (!limited.allowed) {
      lookupError = "Too many lookups. Please wait a minute and try again.";
    } else {
      booking = await lookupBooking(ref, phone);
      if (!booking) lookupError = "We couldn't find a repair request matching those details.";
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Track Repair</h1>

      {justBooked && ref && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Your repair request reference number is <strong>{ref}</strong>. Enter your phone number below to view its
          status. Save this reference number for future reference.
        </div>
      )}

      <form method="get" className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ref" className="text-sm font-medium text-ink-700">
            Reference number
          </label>
          <input
            id="ref"
            name="ref"
            defaultValue={ref}
            required
            className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-ink-700">
            Phone number used at booking
          </label>
          <input
            id="phone"
            name="phone"
            inputMode="numeric"
            required
            className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
        >
          Track
        </button>
      </form>

      {lookupError && <p className="mt-4 text-sm text-red-600">{lookupError}</p>}

      {booking && (
        <div className="mt-8 rounded-lg border border-ink-100 p-5">
          <h2 className="text-sm font-semibold text-ink-900">
            {booking.referenceNumber} · {booking.store.storeName}
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            {booking.deviceType} {booking.brand ? `· ${booking.brand}` : ""} {booking.model ? `· ${booking.model}` : ""}
          </p>

          <ol className="mt-5 flex flex-col gap-3">
            {repairStatusFlow
              .filter((s) => s !== "cancelled")
              .map((status) => {
                const reached = booking.statusLog.some((h) => h.status === status);
                const isCurrent = booking.status === status;
                return (
                  <li key={status} className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isCurrent ? "bg-brand-600" : reached ? "bg-emerald-500" : "bg-ink-200"
                      }`}
                    />
                    <span className={`text-sm ${isCurrent ? "font-semibold text-ink-900" : "text-ink-500"}`}>
                      {repairStatusLabels[status as RepairStatus]}
                    </span>
                  </li>
                );
              })}
          </ol>

          {booking.status === "cancelled" && (
            <p className="mt-4 text-sm font-semibold text-red-600">This repair request was cancelled.</p>
          )}

          {booking.warrantyPeriodText && (
            <p className="mt-4 text-xs text-ink-500">Repair warranty: {booking.warrantyPeriodText}</p>
          )}
        </div>
      )}
    </div>
  );
}

async function lookupBooking(referenceNumber: string, phone: string) {
  return prisma.repairBooking.findFirst({
    where: { referenceNumber, customerPhone: phone },
    include: { store: true, statusLog: { orderBy: { createdAt: "asc" } } },
  });
}

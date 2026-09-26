import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAssignedStoreIds } from "@/lib/authz";
import { ROLES, canManageRepairs } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { updateRepairStatus } from "@/app/actions/adminRepairs";
import { repairStatusFlow, repairStatusLabels, type RepairStatus } from "@/lib/repairConstants";

export const metadata = { title: "Repair Booking" };

export default async function AdminRepairDetailPage({ params }: { params: { bookingId: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManageRepairs(session.role)) redirect("/admin");

  const booking = await prisma.repairBooking.findUnique({
    where: { id: params.bookingId },
    include: { store: true, statusLog: { orderBy: { createdAt: "desc" } } },
  });
  if (!booking) notFound();

  if (session.role === ROLES.STORE_MANAGER) {
    const assigned = await getAssignedStoreIds(session.userId);
    if (!assigned.includes(booking.storeId)) redirect("/admin/repairs");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">{booking.referenceNumber}</h1>
      <p className="mt-1 text-sm text-ink-500">
        {booking.store.storeName} · {booking.deviceType} {booking.brand ? `· ${booking.brand}` : ""} {booking.model ? `· ${booking.model}` : ""}
      </p>

      <div className="mt-4 rounded-lg border border-ink-100 p-4 text-sm text-ink-700">
        <p>
          <span className="font-semibold">Customer:</span> {booking.customerName} · {booking.customerPhone}
          {booking.customerEmail ? ` · ${booking.customerEmail}` : ""}
        </p>
        <p className="mt-1">
          <span className="font-semibold">Issue:</span> {booking.issueType}
          {booking.issueDescription ? ` — ${booking.issueDescription}` : ""}
        </p>
        <p className="mt-1">
          <span className="font-semibold">Service mode:</span> {booking.serviceMode}
        </p>
      </div>

      <form action={updateRepairStatus} className="mt-6 flex flex-col gap-4 rounded-lg border border-ink-100 p-5">
        <input type="hidden" name="bookingId" value={booking.id} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-ink-700">
            Update status
          </label>
          <select id="status" name="status" defaultValue={booking.status} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring sm:max-w-xs">
            {repairStatusFlow.map((s) => (
              <option key={s} value={s}>
                {repairStatusLabels[s as RepairStatus]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="diagnosticFee" className="text-sm font-medium text-ink-700">
              Diagnostic fee (₹, optional)
            </label>
            <input id="diagnosticFee" name="diagnosticFee" type="number" min={0} defaultValue={booking.diagnosticFee ?? ""} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="estimateAmount" className="text-sm font-medium text-ink-700">
              Estimate amount (₹, optional)
            </label>
            <input id="estimateAmount" name="estimateAmount" type="number" min={0} defaultValue={booking.estimateAmount ?? ""} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="warrantyPeriodText" className="text-sm font-medium text-ink-700">
            Repair warranty text (optional — only set once confirmed)
          </label>
          <input id="warrantyPeriodText" name="warrantyPeriodText" defaultValue={booking.warrantyPeriodText ?? ""} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="note" className="text-sm font-medium text-ink-700">
            Internal note (optional, visible to staff only)
          </label>
          <textarea id="note" name="note" rows={2} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>

        <button type="submit" className="self-start rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring">
          Save update
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-ink-900">Status history</h2>
        <ul className="mt-2 flex flex-col gap-2 text-sm text-ink-700">
          {booking.statusLog.map((h) => (
            <li key={h.id} className="rounded-md border border-ink-100 p-3">
              <span className="font-medium">{repairStatusLabels[h.status as RepairStatus] ?? h.status}</span>
              {h.note && <span className="text-ink-500"> — {h.note}</span>}
              <span className="ml-2 text-xs text-ink-500">{h.createdAt.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

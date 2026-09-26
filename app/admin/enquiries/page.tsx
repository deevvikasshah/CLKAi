import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { updateEnquiryStatus, updateCorporateEnquiryStatus } from "@/app/actions/adminEnquiries";

export const metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

const statusOptions = ["new", "in_progress", "closed"];

export default async function AdminEnquiriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, PERMISSIONS.RESPOND_ENQUIRIES)) redirect("/admin");

  const [enquiries, corporateEnquiries] = await Promise.all([
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.corporateEnquiry.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Enquiries</h1>

      <h2 className="mt-8 text-sm font-semibold text-ink-900">General enquiries</h2>
      <div className="mt-3 divide-y divide-ink-100 rounded-lg border border-ink-100">
        {enquiries.length === 0 && <p className="p-4 text-sm text-ink-500">No enquiries yet.</p>}
        {enquiries.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">
                {e.name} · {e.phone}
              </p>
              <p className="text-xs text-ink-500">
                {e.type} · {e.message ?? ""}
              </p>
            </div>
            <form action={updateEnquiryStatus} className="flex items-center gap-2">
              <input type="hidden" name="enquiryId" value={e.id} />
              <select name="status" defaultValue={e.status} className="rounded-md border border-ink-300 px-2 py-1.5 text-xs focus-ring">
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="submit" className="text-xs font-semibold text-brand-600 hover:text-brand-500 focus-ring">
                Update
              </button>
            </form>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-semibold text-ink-900">Corporate / bulk enquiries</h2>
      <div className="mt-3 divide-y divide-ink-100 rounded-lg border border-ink-100">
        {corporateEnquiries.length === 0 && <p className="p-4 text-sm text-ink-500">No corporate enquiries yet.</p>}
        {corporateEnquiries.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">
                {e.organisationName} · {e.contactPerson}
              </p>
              <p className="text-xs text-ink-500">
                {e.productCategory} · Qty: {e.approxQuantity ?? "—"} · {e.phone}
              </p>
            </div>
            <form action={updateCorporateEnquiryStatus} className="flex items-center gap-2">
              <input type="hidden" name="enquiryId" value={e.id} />
              <select name="status" defaultValue={e.status} className="rounded-md border border-ink-300 px-2 py-1.5 text-xs focus-ring">
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="submit" className="text-xs font-semibold text-brand-600 hover:text-brand-500 focus-ring">
                Update
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

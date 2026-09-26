import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Audit Log" };
export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, PERMISSIONS.VIEW_AUDIT_LOG)) redirect("/admin");

  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Audit Log</h1>
      <p className="mt-1 text-sm text-ink-500">Most recent 100 events. Restricted to Super Admin.</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-ink-100">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ink-50 text-xs uppercase text-ink-500">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Entity</th>
              <th className="px-3 py-2">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-3 py-2 text-xs text-ink-500">{log.createdAt.toLocaleString("en-IN")}</td>
                <td className="px-3 py-2">{log.actor?.name ?? "—"}</td>
                <td className="px-3 py-2 font-medium text-ink-900">{log.action}</td>
                <td className="px-3 py-2 text-ink-500">
                  {log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="px-3 py-2 text-ink-500">{log.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

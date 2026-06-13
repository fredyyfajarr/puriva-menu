import { FileClock } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { AuditLog } from "@/domain/order/types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function stringifyMetadata(metadata: Record<string, unknown>) {
  const entries = Object.entries(metadata).filter(([, value]) => value !== null && typeof value !== "undefined");
  if (!entries.length) return "-";

  return entries
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join(", ");
}

export function AuditLogPage({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="text-[#1f2f22]">
      <AdminPageHeader
        eyebrow="Security"
        title="Audit Log"
        description="Jejak perubahan penting untuk order, payment, QR meja, dan aktivitas customer order."
      />

      <section className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
        {logs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#ead8b7] text-xs font-black uppercase tracking-[0.12em] text-[#7a5d21]">
                  <th className="py-3 pr-4">Time</th>
                  <th className="py-3 pr-4">Action</th>
                  <th className="py-3 pr-4">Entity</th>
                  <th className="py-3 pr-4">Actor</th>
                  <th className="py-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3e5cd]">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap py-3 pr-4 font-bold text-[#233224]">{formatDateTime(log.createdAt)}</td>
                    <td className="py-3 pr-4 font-black uppercase text-[#173f2a]">{log.action.replaceAll("_", " ")}</td>
                    <td className="py-3 pr-4 text-[#65705e]">
                      {log.entityType}
                      {log.entityId ? <span className="block text-xs">{log.entityId}</span> : null}
                    </td>
                    <td className="py-3 pr-4 text-[#65705e]">
                      <span className="font-bold text-[#233224]">{log.actorType}</span>
                      {log.actorUserId ? <span className="block text-xs">{log.actorUserId}</span> : null}
                    </td>
                    <td className="max-w-md py-3 text-[#65705e]">
                      <span className="line-clamp-3 break-words">{stringifyMetadata(log.metadata)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FileClock className="mx-auto text-[#7a5d21]" size={32} />
            <h2 className="mt-3 text-2xl font-black text-[#173f2a]">Belum ada audit log</h2>
            <p className="mt-2 text-sm text-[#65705e]">Aktivitas baru akan tercatat setelah migration dijalankan.</p>
          </div>
        )}
      </section>
    </div>
  );
}

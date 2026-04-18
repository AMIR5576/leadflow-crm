// src/app/dashboard/activities/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

const ACTIVITY_ICONS: Record<string, string> = {
  LEAD_RECEIVED: "📥", WHATSAPP_SENT: "💬", CALL_MADE: "📞",
  SMS_SENT: "📱", EMAIL_SENT: "📧", CONTENT_SHARED: "📄",
  CONTENT_VIEWED: "👁️", STATUS_CHANGED: "🔄", NOTE_ADDED: "📝",
  FOLLOWUP_SET: "⏰", FOLLOWUP_COMPLETED: "✅", ASSIGNED: "👤",
};

function activityLabel(type: string): string {
  return type.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

export default async function ActivitiesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const activities = await prisma.activity.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      client: { select: { id: true, name: true, phone: true } },
      user: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Activities</h1>
        <p className="text-sm text-gray-500">Full log of all interactions with your leads</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3">Activity</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Notes</th>
                <th className="text-left px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-gray-400">
                    <div className="text-3xl mb-2">📋</div>
                    <div className="font-medium text-gray-600">No activities yet</div>
                    <div className="text-xs mt-1">Start reaching out to leads to see activity here</div>
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ACTIVITY_ICONS[act.type] ?? "📌"}</span>
                        <span className="font-medium text-gray-800">{activityLabel(act.type)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/clients/${act.client.id}`}
                        className="text-[#00B4C8] hover:underline font-medium"
                      >
                        {act.client.name}
                      </Link>
                      <div className="text-xs text-gray-400">{act.client.phone}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 max-w-xs truncate">
                      {act.notes ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDateTime(act.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

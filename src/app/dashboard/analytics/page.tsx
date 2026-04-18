// src/app/dashboard/analytics/page.tsx
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import { STATUS_LABELS } from "@/lib/utils";
import type { ClientStatus } from "@/types";

async function getAnalyticsData(userId: string) {
  const [byStatus, bySource, dailyTrend, totalLeads, totalConverted] = await Promise.all([
    prisma.client.groupBy({
      by: ["status"],
      where: { createdById: userId },
      _count: true,
    }),
    prisma.client.groupBy({
      by: ["leadSource"],
      where: { createdById: userId },
      _count: true,
      orderBy: { _count: { leadSource: "desc" } },
    }),
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE("createdAt")::text as date, COUNT(*)::bigint as count
      FROM "Client"
      WHERE "createdById" = ${userId}
        AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.client.count({ where: { createdById: userId } }),
    prisma.client.count({ where: { createdById: userId, status: "CONVERTED" } }),
  ]);

  return {
    byStatus: byStatus.map((s) => ({
      status: STATUS_LABELS[s.status as ClientStatus] || s.status,
      count: s._count,
    })),
    bySource: bySource.map((s) => ({
      source: s.leadSource || "Unknown",
      count: s._count,
    })),
    dailyTrend: dailyTrend.map((d) => ({
      date: d.date,
      count: Number(d.count),
    })),
    conversionRate: totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0,
    totalLeads,
    totalConverted,
  };
}

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const data = await getAnalyticsData(session.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="text-gray-500 text-sm">Your sales performance overview — last 30 days</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Leads", value: data.totalLeads.toLocaleString() },
          { label: "Converted", value: data.totalConverted.toLocaleString() },
          { label: "Conversion Rate", value: `${data.conversionRate}%` },
        ].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <div className="text-3xl font-bold text-[#00B4C8]">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <AnalyticsCharts
        byStatus={data.byStatus}
        bySource={data.bySource}
        dailyTrend={data.dailyTrend}
      />
    </div>
  );
}

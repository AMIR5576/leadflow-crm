// src/app/admin/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

async function getAdminStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const [totalUsers, usersToday, usersYesterday, totalLeads, totalUsage, recentUsers, popularActions] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
      prisma.client.count(),
      prisma.toolUsage.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true, name: true, email: true, plan: true, createdAt: true,
          _count: { select: { clients: true } },
        },
      }),
      prisma.toolUsage.groupBy({
        by: ["action"],
        _count: true,
        orderBy: { _count: { action: "desc" } },
        take: 10,
      }),
    ]);

  return { totalUsers, usersToday, usersYesterday, totalLeads, totalUsage, recentUsers, popularActions };
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const stats = await getAdminStats();

  const summaryCards = [
    { label: "Total Users", value: stats.totalUsers, sub: `+${stats.usersToday} today` },
    { label: "New Today", value: stats.usersToday, sub: `vs ${stats.usersYesterday} yesterday` },
    { label: "Total Leads", value: stats.totalLeads.toLocaleString(), sub: "across all users" },
    { label: "Total Actions", value: stats.totalUsage.toLocaleString(), sub: "tool usages logged" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Platform-wide analytics and user management</p>
          </div>
          <Link href="/api/admin/export-emails" className="btn-primary text-sm">
            Export Emails CSV
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm font-medium text-gray-500">{s.label}</div>
              <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Popular actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Popular Actions</h2>
          <div className="space-y-2">
            {stats.popularActions.map((a) => (
              <div key={a.action} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-mono text-gray-700">{a.action}</span>
                <span className="badge bg-[#E0F7FA] text-[#00B4C8]">{a._count} times</span>
              </div>
            ))}
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Plan</th>
                  <th className="text-left px-4 py-3">Leads</th>
                  <th className="text-left px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        u.plan === "FREE" ? "bg-gray-100 text-gray-600" :
                        u.plan === "PRO" ? "bg-purple-100 text-purple-700" :
                        "bg-teal-100 text-teal-700"
                      }`}>{u.plan}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u._count.clients}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

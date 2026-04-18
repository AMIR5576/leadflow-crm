// src/app/dashboard/page.tsx
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { redirect } from "next/navigation";
import StatsCards from "@/components/dashboard/StatsCards";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import RecentLeads from "@/components/dashboard/RecentLeads";
import LeadsChart from "@/components/dashboard/LeadsChart";

async function getDashboardData(userId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalLeads, leadsToday, leadsWeek, leadsMonth,
    uncontacted, followUpsDue, recentClients, onboarding,
    chartData
  ] = await Promise.all([
    prisma.client.count({ where: { createdById: userId } }),
    prisma.client.count({ where: { createdById: userId, createdAt: { gte: todayStart } } }),
    prisma.client.count({ where: { createdById: userId, createdAt: { gte: weekStart } } }),
    prisma.client.count({ where: { createdById: userId, createdAt: { gte: monthStart } } }),
    prisma.client.count({ where: { createdById: userId, status: "NEW" } }),
    prisma.client.count({ where: { createdById: userId, followUpAt: { lte: now }, status: { not: "CONVERTED" } } }),
    prisma.client.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true, name: true, phone: true, email: true,
        status: true, leadSource: true, createdAt: true,
        assignedTo: { select: { name: true, avatarUrl: true } }
      }
    }),
    prisma.onboardingProgress.findUnique({ where: { userId } }),
    // Get last 14 days chart data
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("createdAt")::text as date, COUNT(*)::bigint as count
      FROM "Client"
      WHERE "createdById" = ${userId}
        AND "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ]);

  const converted = await prisma.client.count({ where: { createdById: userId, status: "CONVERTED" } });
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

  return {
    stats: { totalLeads, leadsToday, leadsWeek, leadsMonth, uncontacted, followUpsDue, conversionRate },
    recentClients,
    onboarding,
    chartData: (chartData as Array<{date: string; count: bigint}>).map((d) => ({ date: d.date, count: Number(d.count) })),
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { stats, recentClients, onboarding, chartData } = await getDashboardData(session.id);

  // Onboarding steps
  const onboardingSteps = [
    { key: "downloadedApp", title: "Download the Mobile App", desc: "Get instant lead alerts on your phone", href: "/dashboard/settings/app", required: true },
    { key: "connectedFacebook", title: "Connect Facebook Lead Ads", desc: "Receive leads from your Facebook & Instagram ads", href: "/dashboard/settings/lead-sources", required: false },
    { key: "connectedLeadSources", title: "Connect Your Lead Sources", desc: "Website forms, Google Ads, and more", href: "/dashboard/settings/lead-sources", required: false },
    { key: "setDefaultSequence", title: "Set Your Default Sequence", desc: "Auto follow-up for every new lead", href: "/dashboard/automations", required: false },
    { key: "setAutoResponder", title: "WhatsApp Auto-Responder", desc: "Instantly message new leads via WhatsApp", href: "/dashboard/automations", required: false },
    { key: "addedCustomFields", title: "Add Custom Client Fields", desc: "Track Budget, Property Type, and more", href: "/dashboard/settings/custom-fields", required: false },
    { key: "invitedTeam", title: "Invite Team Members", desc: "Add your sales team and assign leads", href: "/dashboard/team", required: false },
    { key: "sentFirstMessage", title: "Send Your First Message", desc: "Test the system by contacting a lead", href: "/dashboard/clients", required: true },
  ];

  const completedSteps = onboarding
    ? onboardingSteps.filter(s => onboarding[s.key as keyof typeof onboarding] === true).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
          {session.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s what&apos;s happening with your leads today.
        </p>
      </div>

      {/* Onboarding checklist */}
      {completedSteps < onboardingSteps.length && (
        <OnboardingChecklist
          steps={onboardingSteps}
          onboarding={onboarding}
          completed={completedSteps}
          total={onboardingSteps.length}
        />
      )}

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Charts + Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LeadsChart data={chartData} />
        </div>
        <div>
          <RecentLeads clients={recentClients as never} />
        </div>
      </div>
    </div>
  );
}

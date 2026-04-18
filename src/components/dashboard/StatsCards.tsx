// src/components/dashboard/StatsCards.tsx
import { Users, UserPlus, AlertCircle, Clock, TrendingUp, Calendar } from "lucide-react";

interface Props {
  stats: {
    totalLeads: number;
    leadsToday: number;
    leadsWeek: number;
    leadsMonth: number;
    uncontacted: number;
    followUpsDue: number;
    conversionRate: number;
  };
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: "Total Leads",
      value: stats.totalLeads.toLocaleString(),
      sub: `${stats.leadsMonth} this month`,
      icon: Users,
      color: "text-[#00B4C8]",
      bg: "bg-[#E0F7FA]",
    },
    {
      label: "New Today",
      value: stats.leadsToday.toString(),
      sub: `${stats.leadsWeek} this week`,
      icon: UserPlus,
      color: "text-[#7B2FBE]",
      bg: "bg-[#F3E8FF]",
    },
    {
      label: "Uncontacted",
      value: stats.uncontacted.toString(),
      sub: "Need outreach",
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      urgent: stats.uncontacted > 5,
    },
    {
      label: "Follow-ups Due",
      value: stats.followUpsDue.toString(),
      sub: "Today or overdue",
      icon: Clock,
      color: "text-red-600",
      bg: "bg-red-50",
      urgent: stats.followUpsDue > 0,
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      sub: "All time",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "This Month",
      value: stats.leadsMonth.toString(),
      sub: "leads received",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`stat-card ${c.urgent ? "border-red-200 ring-1 ring-red-100" : ""}`}>
          <div className="flex items-start justify-between">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.bg}`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${c.urgent ? "text-red-600" : "text-gray-900"}`}>
            {c.value}
          </div>
          <div className="text-xs font-medium text-gray-500">{c.label}</div>
          <div className="text-xs text-gray-400">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

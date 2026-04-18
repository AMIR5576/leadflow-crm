"use client";
// src/components/dashboard/AnalyticsCharts.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { format, parseISO } from "date-fns";
import { STATUS_LABELS } from "@/lib/utils";

const COLORS = ["#00B4C8", "#7B2FBE", "#22C55E", "#F59E0B", "#EF4444", "#6366F1", "#EC4899", "#14B8A6"];

interface Props {
  byStatus: { status: string; count: number }[];
  bySource: { source: string; count: number }[];
  dailyTrend: { date: string; count: number }[];
}

export default function AnalyticsCharts({ byStatus, bySource, dailyTrend }: Props) {
  const statusData = byStatus.map(s => ({
    name: STATUS_LABELS[s.status as keyof typeof STATUS_LABELS] || s.status,
    value: s.count,
  }));

  const trendData = dailyTrend.map(d => ({
    ...d,
    label: format(parseISO(d.date), "dd MMM"),
  }));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Status breakdown */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Leads by Status</h2>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Source breakdown */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Leads by Source</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={bySource} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <YAxis dataKey="source" type="category" tick={{ fontSize: 11, fill: "#6B7280" }} width={80} />
            <Tooltip />
            <Bar dataKey="count" name="Leads" fill="#00B4C8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily trend */}
      <div className="card p-5 lg:col-span-2">
        <h2 className="section-title mb-4">Daily Lead Volume — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" name="Leads" stroke="#7B2FBE" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

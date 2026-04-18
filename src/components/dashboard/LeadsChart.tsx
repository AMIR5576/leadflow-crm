"use client";
// src/components/dashboard/LeadsChart.tsx
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { format, parseISO } from "date-fns";

interface Props {
  data: { date: string; count: number }[];
}

export default function LeadsChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "dd MMM"),
  }));

  // Fill missing days with 0
  const filled = fillMissingDays(formatted);

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Leads — Last 14 Days</h2>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#00B4C8]" />
          <span className="text-xs text-gray-500">New Leads</span>
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        {filled.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-sm font-medium text-gray-600">No data yet</div>
            <div className="text-xs text-gray-400 mt-1">Leads will appear here once you get started</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filled} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B4C8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00B4C8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: 12 }}
                labelStyle={{ fontWeight: 600, color: "#111827" }}
              />
              <Area type="monotone" dataKey="count" name="Leads" stroke="#00B4C8" strokeWidth={2} fill="url(#tealGrad)" dot={false} activeDot={{ r: 4, fill: "#00B4C8" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function fillMissingDays(data: { date: string; label: string; count: number }[]): { date: string; label: string; count: number }[] {
  if (data.length === 0) return [];
  const map = new Map(data.map((d) => [d.date, d]));
  const result: { date: string; label: string; count: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push(map.get(key) || { date: key, label: format(d, "dd MMM"), count: 0 });
  }
  return result;
}

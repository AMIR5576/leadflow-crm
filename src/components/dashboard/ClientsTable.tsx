"use client";
// src/components/dashboard/ClientsTable.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MessageCircle, Phone, Mail, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS, timeAgo, whatsappLink } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  status: string;
  leadSource?: string | null;
  followUpAt?: Date | null;
  createdAt: Date;
  lastActivityAt?: Date | null;
  tags: string[];
  assignedTo?: { name?: string | null; avatarUrl?: string | null } | null;
  _count?: { activities: number };
}

interface Props {
  clients: Client[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  tabCounts: { all: number; uncontacted: number; followups: number; viewed: number };
  currentParams: Record<string, string | undefined>;
}

const TABS = [
  { key: "all", label: "All Clients", countKey: "all" },
  { key: "uncontacted", label: "Uncontacted", countKey: "uncontacted" },
  { key: "followups", label: "Follow Ups", countKey: "followups" },
  { key: "viewed_content", label: "Viewed Content", countKey: "viewed" },
] as const;

const STATUSES = ["NEW", "CONTACTED", "INTERESTED", "FOLLOW_UP", "PROPOSAL_SENT", "NEGOTIATION", "CONVERTED", "LOST"];

export default function ClientsTable({ clients, total, page, totalPages, tabCounts, currentParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [search, setSearch] = useState(currentParams.search || "");

  const activeTab = currentParams.tab || "all";

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: search || undefined });
  }

  function goPage(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-100 px-4 flex items-center gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => navigate({ tab: t.key === "all" ? undefined : t.key })}
            className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? "border-[#00B4C8] text-[#00B4C8]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            <span className={`badge ${activeTab === t.key ? "bg-[#E0F7FA] text-[#00B4C8]" : "bg-gray-100 text-gray-500"}`}>
              {tabCounts[t.countKey]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="input pl-8 text-sm py-1.5"
            />
          </div>
        </form>
        <select
          className="input text-sm py-1.5 w-auto"
          value={currentParams.status || ""}
          onChange={(e) => navigate({ status: e.target.value || undefined })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s as keyof typeof STATUS_LABELS]}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Filter className="w-3.5 h-3.5" />
          {total.toLocaleString()} results
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Added</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="font-medium text-gray-600">No clients found</div>
                  <div className="text-xs mt-1">Try adjusting your search or filters</div>
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00B4C8] to-[#7B2FBE] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/dashboard/clients/${c.id}`} className="font-medium text-gray-900 hover:text-[#00B4C8]">
                          {c.name}
                        </Link>
                        {c.email && <div className="text-xs text-gray-400 truncate max-w-[160px]">{c.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.phone}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`badge ${STATUS_COLORS[c.status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[c.status as keyof typeof STATUS_LABELS] || c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">{c.leadSource || "Manual"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">{timeAgo(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={whatsappLink(c.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      <a href={`tel:${c.phone}`} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Call">
                        <Phone className="w-4 h-4" />
                      </a>
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors" title="Email">
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => goPage(page - 1)} disabled={page <= 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => goPage(page + 1)} disabled={page >= totalPages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

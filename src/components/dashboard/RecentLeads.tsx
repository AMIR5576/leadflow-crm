// src/components/dashboard/RecentLeads.tsx
import Link from "next/link";
import { timeAgo, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { MessageCircle, Phone } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  status: string;
  leadSource?: string | null;
  createdAt: Date;
}

export default function RecentLeads({ clients }: { clients: Client[] }) {
  return (
    <div className="card h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="section-title">Recent Leads</h2>
        <Link href="/dashboard/clients" className="text-xs text-[#00B4C8] hover:underline font-medium">
          View all
        </Link>
      </div>
      <div className="flex-1 overflow-auto divide-y divide-gray-50">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="text-3xl mb-2">📭</div>
            <div className="text-sm font-medium text-gray-700">No leads yet</div>
            <div className="text-xs text-gray-400 mt-1">Connect a lead source to get started</div>
            <Link href="/dashboard/settings/lead-sources" className="btn-primary text-xs mt-3 py-1.5 px-3">
              Connect Sources
            </Link>
          </div>
        ) : (
          clients.map((c) => (
            <div key={c.id} className="p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00B4C8] to-[#7B2FBE] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <Link href={`/dashboard/clients/${c.id}`} className="text-sm font-medium text-gray-900 hover:text-[#00B4C8] block truncate">
                      {c.name}
                    </Link>
                    <div className="text-xs text-gray-400">{timeAgo(c.createdAt)}</div>
                  </div>
                </div>
                <span className={`badge shrink-0 ${STATUS_COLORS[c.status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[c.status as keyof typeof STATUS_LABELS] || c.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 ml-10">
                <a
                  href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                {c.leadSource && (
                  <span className="text-xs text-gray-400 ml-auto">{c.leadSource}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

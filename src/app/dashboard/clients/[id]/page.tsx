// src/app/dashboard/clients/[id]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDateTime, STATUS_COLORS, STATUS_LABELS, whatsappLink } from "@/lib/utils";
import type { ClientStatus } from "@/types";
import { MessageCircle, Phone, Mail, Clock, Tag, Edit, Activity, FileText, User } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";

const ACTIVITY_ICONS: Record<string, string> = {
  LEAD_RECEIVED: "📥", WHATSAPP_SENT: "💬", CALL_MADE: "📞",
  SMS_SENT: "📱", EMAIL_SENT: "📧", CONTENT_SHARED: "📄",
  CONTENT_VIEWED: "👁️", STATUS_CHANGED: "🔄", NOTE_ADDED: "📝",
  FOLLOWUP_SET: "⏰", FOLLOWUP_COMPLETED: "✅", ASSIGNED: "👤",
};

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  let session = null;
  try {
    session = await getSession();
  } catch {
    session = null;
  }

  if (!session) {
    notFound();
  }

  const client = await prisma.client.findFirst({
    where: { id: params.id, createdById: session.id },
    include: {
      assignedTo: true,
      activities: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true, avatarUrl: true } } },
      },
      contentShares: {
        include: { contentFile: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  const customFields = client.customFields as Record<string, string> | null;
  const statusColor = STATUS_COLORS[client.status as ClientStatus] ?? "bg-gray-100 text-gray-600";
  const statusLabel = STATUS_LABELS[client.status as ClientStatus] ?? client.status;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00B4C8] to-[#7B2FBE] flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`badge ${statusColor}`}>{statusLabel}</span>
              {client.leadSource && (
                <span className="badge bg-gray-100 text-gray-600">{client.leadSource}</span>
              )}
              {client.tags.map((tag) => (
                <span key={tag} className="badge bg-purple-100 text-purple-700">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <Link href={`/dashboard/clients/${client.id}/edit`} className="btn-secondary text-sm flex items-center gap-1.5">
          <Edit className="w-4 h-4" /> Edit
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Contact info */}
          <div className="card p-5 space-y-3">
            <h2 className="section-title">Contact Info</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <a href={`tel:${client.phone}`} className="text-gray-700 hover:text-[#00B4C8]">{client.phone}</a>
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${client.email}`} className="text-gray-700 hover:text-[#00B4C8] truncate">{client.email}</a>
                </div>
              )}
              {client.followUpAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-orange-600">Follow up: {formatDateTime(client.followUpAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Added {formatDateTime(client.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Outreach */}
          <div className="card p-5 space-y-2">
            <h2 className="section-title">Quick Outreach</h2>
            <a
              href={whatsappLink(client.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Open WhatsApp
            </a>
            <a href={`tel:${client.phone}`} className="flex items-center gap-2.5 w-full btn-secondary text-sm">
              <Phone className="w-4 h-4" /> Call Now
            </a>
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-2.5 w-full btn-secondary text-sm">
                <Mail className="w-4 h-4" /> Send Email
              </a>
            )}
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="card p-5">
              <h2 className="section-title mb-2">Notes</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}

          {/* Custom Fields */}
          {customFields && Object.keys(customFields).length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-3">Details</h2>
              <div className="space-y-2">
                {Object.entries(customFields).map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2 text-sm">
                    <Tag className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-400 capitalize">{k.replace(/_/g, " ")}: </span>
                      <span className="text-gray-700">{v}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Shares */}
          {client.contentShares.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Shared Content
              </h2>
              <div className="space-y-2">
                {client.contentShares.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 truncate flex-1">{s.contentFile.name}</span>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{s.viewCount} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="card p-5 h-full flex flex-col">
            <h2 className="section-title mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Activity Timeline
            </h2>
            {client.activities.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-sm font-medium text-gray-600">No activities yet</div>
                  <div className="text-xs text-gray-400 mt-1">Start by reaching out via WhatsApp or phone</div>
                </div>
              </div>
            ) : (
              <div className="space-y-1 overflow-auto flex-1">
                {client.activities.map((act, i) => (
                  <div key={act.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base shrink-0">
                        {ACTIVITY_ICONS[act.type] ?? "📌"}
                      </div>
                      {i < client.activities.length - 1 && (
                        <div className="w-px bg-gray-200 flex-1 my-1" />
                      )}
                    </div>
                    <div className="pb-4 flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-gray-800">
                          {act.type.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase())}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">{formatDateTime(act.createdAt)}</span>
                      </div>
                      {act.notes && <p className="text-sm text-gray-500 mt-0.5">{act.notes}</p>}
                      <div className="text-xs text-gray-400 mt-0.5">by {act.user.name ?? "System"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

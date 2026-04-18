// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClientStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function timeAgo(date: Date | string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

// ─── WhatsApp ────────────────────────────────────────────────────────────────

export function whatsappLink(phone: string, message?: string): string {
  const clean = phone.replace(/\D/g, "");
  const msg = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${clean}${msg}`;
}

export function personalizeTemplate(template: string, tokens: Record<string, string>): string {
  return Object.entries(tokens).reduce(
    (t, [k, v]) => t.replaceAll(`{{${k}}}`, v),
    template
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<ClientStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  INTERESTED: "bg-orange-100 text-orange-800",
  FOLLOW_UP: "bg-purple-100 text-purple-800",
  PROPOSAL_SENT: "bg-indigo-100 text-indigo-800",
  NEGOTIATION: "bg-pink-100 text-pink-800",
  CONVERTED: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
};

export const STATUS_LABELS: Record<ClientStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow Up",
  PROPOSAL_SENT: "Proposal Sent",
  NEGOTIATION: "Negotiation",
  CONVERTED: "Converted",
  LOST: "Lost",
};

// ─── Plan limits ──────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  FREE:    { templates: 5,        sequences: 0,        contentStorageMB: 0,     customFields: 0,  teamMembers: 1,  contentTracking: false, bulkMessaging: false, whatsappAutoResponder: false },
  STARTER: { templates: Infinity, sequences: 3,        contentStorageMB: 500,   customFields: 5,  teamMembers: 1,  contentTracking: true,  bulkMessaging: false, whatsappAutoResponder: false },
  PRO:     { templates: Infinity, sequences: Infinity, contentStorageMB: 5120,  customFields: 20, teamMembers: 1,  contentTracking: true,  bulkMessaging: true,  whatsappAutoResponder: true  },
  TEAM:    { templates: Infinity, sequences: Infinity, contentStorageMB: 20480, customFields: 20, teamMembers: 10, contentTracking: true,  bulkMessaging: true,  whatsappAutoResponder: true  },
};

// ─── CSV export ───────────────────────────────────────────────────────────────

export function objectsToCsv(objects: Record<string, unknown>[]): string {
  if (objects.length === 0) return "";
  const headers = Object.keys(objects[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...objects.map(o => headers.map(h => escape(o[h])).join(","))].join("\n");
}

// ─── Webhook URL ──────────────────────────────────────────────────────────────

export function generateWebhookUrl(userId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.vercel.app";
  return `${base}/api/webhook/${userId}`;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function getPaginationMeta(total: number, page: number, pageSize: number) {
  return {
    total, page, pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page < Math.ceil(total / pageSize),
    hasPrevPage: page > 1,
  };
}

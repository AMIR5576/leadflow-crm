// src/types/index.ts
// NOTE: Prisma types are re-exported here once Prisma client is generated.
// The re-exports from @prisma/client only work after running `npm run db:generate`.
// For Vercel, the build runs `prisma generate` automatically via postinstall.

// ─── Enums (defined locally to avoid Prisma client dependency at type-check time) ───

export type UserRole = "OWNER" | "MANAGER" | "AGENT" | "ADMIN";
export type Plan = "FREE" | "STARTER" | "PRO" | "TEAM";
export type ClientStatus =
  | "NEW" | "CONTACTED" | "INTERESTED" | "FOLLOW_UP"
  | "PROPOSAL_SENT" | "NEGOTIATION" | "CONVERTED" | "LOST";
export type ActivityType =
  | "LEAD_RECEIVED" | "WHATSAPP_SENT" | "CALL_MADE" | "SMS_SENT"
  | "EMAIL_SENT" | "CONTENT_SHARED" | "CONTENT_VIEWED" | "STATUS_CHANGED"
  | "NOTE_ADDED" | "FOLLOWUP_SET" | "FOLLOWUP_COMPLETED" | "ASSIGNED"
  | "SEQUENCE_STARTED" | "SEQUENCE_STEP_COMPLETED";
export type TemplateChannel = "WHATSAPP" | "SMS" | "EMAIL";
export type TemplateCategory =
  | "INTRODUCTION" | "FOLLOWUP" | "REMINDER" | "CLOSING" | "AFTER_SALE";
export type LeadSourceType =
  | "FACEBOOK_ADS" | "INSTAGRAM_ADS" | "GOOGLE_ADS" | "TIKTOK_ADS"
  | "WEBSITE_FORM" | "WORDPRESS" | "ZAPIER" | "INDIAMART" | "MANUAL"
  | "CSV_IMPORT" | "API";
export type NotificationType =
  | "NEW_LEAD" | "FOLLOWUP_DUE" | "CONTENT_VIEWED" | "TEAM_ASSIGNMENT"
  | "SEQUENCE_STEP" | "SYSTEM";
export type SequenceStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELLED" | "TRIALING";

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  uncontacted: number;
  followUpsDue: number;
  conversionRate: number;
  avgResponseTimeMinutes: number;
}

// ─── Client Types ─────────────────────────────────────────────────────────────

export interface ClientWithRelations {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  status: ClientStatus;
  leadSource?: string | null;
  notes?: string | null;
  followUpAt?: Date | null;
  tags: string[];
  customFields?: Record<string, unknown> | null;
  contentViews: number;
  lastActivityAt?: Date | null;
  createdAt: Date;
  assignedTo?: {
    id: string;
    name?: string | null;
    email: string;
    avatarUrl?: string | null;
  } | null;
  activities?: ActivityWithUser[];
}

export interface ActivityWithUser {
  id: string;
  type: ActivityType;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  user: {
    id: string;
    name?: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  plan: Plan;
  teamId?: string | null;
  avatarUrl?: string | null;
  companyName?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

// ─── Onboarding Types ─────────────────────────────────────────────────────────

export interface OnboardingStepKeys {
  downloadedApp: boolean;
  connectedFacebook: boolean;
  connectedLeadSources: boolean;
  setDefaultSequence: boolean;
  setAutoResponder: boolean;
  addedCustomFields: boolean;
  invitedTeam: boolean;
  sentFirstMessage: boolean;
}

export interface OnboardingStep {
  key: keyof OnboardingStepKeys;
  title: string;
  description: string;
  href: string;
  required: boolean;
}

// ─── Filter/Query Types ───────────────────────────────────────────────────────

export interface ClientFilters {
  search?: string;
  status?: string;
  leadSource?: string;
  assignedToId?: string;
  tags?: string[];
  followUpFrom?: string;
  followUpTo?: string;
  tab?: "all" | "uncontacted" | "followups" | "viewed_content";
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "lastActivityAt" | "name" | "followUpAt";
  sortOrder?: "asc" | "desc";
}

// ─── Webhook Lead Payload ─────────────────────────────────────────────────────

export interface IncomingLeadPayload {
  name?: string;
  phone?: string;
  email?: string;
  source?: string;
  notes?: string;
  customFields?: Record<string, string>;
  // Facebook-specific
  full_name?: string;
  phone_number?: string;
  email_address?: string;
  first_name?: string;
  last_name?: string;
  mobile?: string;
  [key: string]: unknown;
}

// ─── AI Generate Types ────────────────────────────────────────────────────────

export interface GenerateSequenceInput {
  businessType: string;
  productOrService: string;
  tone: "professional" | "friendly" | "urgent";
  steps: number;
}

export interface GeneratedSequenceStep {
  order: number;
  channel: TemplateChannel;
  delayMinutes: number;
  templateBody: string;
  stepName: string;
}

export interface GenerateSequenceOutput {
  sequenceName: string;
  description: string;
  steps: GeneratedSequenceStep[];
}

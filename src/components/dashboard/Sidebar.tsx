"use client";
// src/components/dashboard/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap, LayoutDashboard, Users, FileText, Activity,
  UserCircle2, BarChart3, Zap as Auto, Settings, LogOut, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/activities", label: "Activities", icon: Activity },
  { href: "/dashboard/team", label: "Team", icon: UserCircle2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/automations", label: "Automations", icon: Auto },
];

const SETTINGS_NAV = [
  { href: "/dashboard/settings/lead-sources", label: "Lead Sources" },
  { href: "/dashboard/settings/templates", label: "Templates" },
  { href: "/dashboard/settings/custom-fields", label: "Custom Fields" },
  { href: "/dashboard/settings/account", label: "Account & Billing" },
];

export default function Sidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-[#00B4C8] flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-gray-900">LeadFlow</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("sidebar-link", isActive(item.href, item.exact) && "sidebar-link-active")}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ))}

        {/* Settings section */}
        <div className="pt-4 pb-1">
          <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Settings
          </div>
        </div>
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("sidebar-link text-sm", isActive(item.href) && "sidebar-link-active")}
          >
            <ChevronRight className="w-3 h-3 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#00B4C8] flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user.name || "User"}</div>
            <div className="text-xs text-gray-400 truncate">{user.plan} plan</div>
          </div>
        </div>
        <Link href="/api/auth/logout" className="sidebar-link mt-1 text-red-500 hover:text-red-700 hover:bg-red-50">
          <LogOut className="w-4 h-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}

"use client";
// src/components/dashboard/TopBar.tsx
import { Bell, Search, Plus } from "lucide-react";
import Link from "next/link";
import type { AuthUser } from "@/types";

export default function TopBar({ user }: { user: AuthUser }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search clients..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00B4C8] focus:bg-white"
        />
      </div>
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clients/new" className="btn-primary text-sm flex items-center gap-1.5 py-2">
          <Plus className="w-4 h-4" /> Add Lead
        </Link>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#7B2FBE] flex items-center justify-center text-white text-sm font-semibold">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}

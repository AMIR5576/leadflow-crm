// src/app/dashboard/team/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Users, UserPlus, Crown, Shield, User } from "lucide-react";

const ROLE_ICONS = { OWNER: Crown, MANAGER: Shield, AGENT: User };
const ROLE_COLORS = {
  OWNER: "bg-yellow-100 text-yellow-700",
  MANAGER: "bg-blue-100 text-blue-700",
  AGENT: "bg-gray-100 text-gray-600",
};

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const team = session.teamId
    ? await prisma.team.findUnique({
        where: { id: session.teamId },
        include: {
          members: {
            select: {
              id: true, name: true, email: true, role: true, plan: true,
              createdAt: true, avatarUrl: true,
              _count: { select: { clients: true } },
            },
          },
        },
      })
    : null;

  const isOwner = session.role === "OWNER" || session.role === "ADMIN";

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="text-sm text-gray-500">
            {team ? `${team.members.length} member${team.members.length !== 1 ? "s" : ""}` : "No team yet"}
          </p>
        </div>
        {isOwner && (
          <button className="btn-primary text-sm flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        )}
      </div>

      {!team ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E0F7FA] flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#00B4C8]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Create Your Team</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Invite your sales team, assign leads to agents, and track everyone&apos;s performance
            from one dashboard. Available on the Team plan.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="/dashboard/settings/account" className="btn-primary text-sm">
              Upgrade to Team Plan
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Roles guide */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { role: "OWNER", label: "Owner", desc: "Full access to everything including billing" },
              { role: "MANAGER", label: "Manager", desc: "View all team leads, analytics, assign leads" },
              { role: "AGENT", label: "Agent", desc: "Access only their assigned leads and content" },
            ].map((r) => {
              const Icon = ROLE_ICONS[r.role as keyof typeof ROLE_ICONS];
              return (
                <div key={r.role} className="card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">{r.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{r.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Members table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="section-title">Team Members</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3">Member</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Leads</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Joined</th>
                  {isOwner && <th className="text-left px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {team.members.map((m: {
                    id: string; name: string | null; email: string; role: string;
                    createdAt: Date; avatarUrl: string | null;
                    _count: { clients: number };
                  }) => {
                  const Icon = ROLE_ICONS[m.role as keyof typeof ROLE_ICONS] || User;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00B4C8] to-[#7B2FBE] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(m.name || m.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{m.name || "—"}</div>
                            <div className="text-xs text-gray-400">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge flex items-center gap-1 w-fit ${ROLE_COLORS[m.role as keyof typeof ROLE_COLORS] || "bg-gray-100 text-gray-600"}`}>
                          <Icon className="w-3 h-3" />
                          {m.role.charAt(0) + m.role.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">{m._count.clients}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">{formatDate(m.createdAt)}</td>
                      {isOwner && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="btn-secondary text-xs py-1 px-2">Change Role</button>
                            {m.id !== session.id && (
                              <button className="text-xs text-red-500 hover:text-red-700">Remove</button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

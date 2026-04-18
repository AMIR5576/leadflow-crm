// src/app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={session} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={session} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

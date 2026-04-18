// src/app/dashboard/clients/page.tsx
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientsTable from "@/components/dashboard/ClientsTable";


interface SearchParams {
  tab?: string;
  search?: string;
  status?: string;
  source?: string;
  page?: string;
  [key: string]: string | undefined;
}

async function getClients(userId: string, params: SearchParams) {
  const page = parseInt(params.page || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { createdById: userId };

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { phone: { contains: params.search } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.status) where.status = params.status;
  if (params.source) where.leadSource = params.source;

  const now = new Date();
  if (params.tab === "uncontacted") {
    where.status = "NEW";
  } else if (params.tab === "followups") {
    where.followUpAt = { lte: now };
    where.status = { not: "CONVERTED" };
  } else if (params.tab === "viewed_content") {
    where.contentViews = { gt: 0 };
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: { select: { name: true, avatarUrl: true } },
        _count: { select: { activities: true } },
      },
    }),
    prisma.client.count({ where }),
  ]);

  // Tab counts
  const [allCount, uncontactedCount, followupCount, viewedCount] = await Promise.all([
    prisma.client.count({ where: { createdById: userId } }),
    prisma.client.count({ where: { createdById: userId, status: "NEW" } }),
    prisma.client.count({ where: { createdById: userId, followUpAt: { lte: now }, status: { not: "CONVERTED" } } }),
    prisma.client.count({ where: { createdById: userId, contentViews: { gt: 0 } } }),
  ]);

  return {
    clients,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    tabCounts: { all: allCount, uncontacted: uncontactedCount, followups: followupCount, viewed: viewedCount },
  };
}

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const data = await getClients(session.id, searchParams);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-sm text-gray-500">{data.total.toLocaleString()} total leads</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/clients/export" className="btn-secondary text-sm py-2">Export CSV</a>
          <a href="/dashboard/clients/new" className="btn-primary text-sm py-2">+ Add Lead</a>
        </div>
      </div>
      <ClientsTable {...data} currentParams={searchParams} />
    </div>
  );
}

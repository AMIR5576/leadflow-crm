// src/app/api/admin/export-emails/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { objectsToCsv, formatDateTime } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      name: true, email: true, plan: true, companyName: true,
      createdAt: true,
      _count: { select: { clients: true, toolUsages: true } },
    },
  });

  const rows: Record<string, unknown>[] = users.map((u) => ({
    Name: u.name ?? "",
    Email: u.email,
    Plan: u.plan,
    Company: u.companyName ?? "",
    "Total Leads": u._count.clients,
    "Total Actions": u._count.toolUsages,
    "Joined At": formatDateTime(u.createdAt),
  }));

  const csv = objectsToCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leadflow-users-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

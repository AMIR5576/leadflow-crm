// src/app/api/clients/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { objectsToCsv, STATUS_LABELS, formatDateTime } from "@/lib/utils";
import type { ClientStatus } from "@/types";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { createdById: session.id },
    orderBy: { createdAt: "desc" },
    select: {
      name: true, phone: true, email: true, status: true,
      leadSource: true, notes: true, followUpAt: true,
      tags: true, createdAt: true, lastActivityAt: true,
    },
  });

  const rows: Record<string, unknown>[] = clients.map((c) => ({
    Name: c.name,
    Phone: c.phone,
    Email: c.email ?? "",
    Status: STATUS_LABELS[c.status as ClientStatus] ?? c.status,
    "Lead Source": c.leadSource ?? "",
    Notes: c.notes ?? "",
    Tags: c.tags.join(", "),
    "Follow Up At": c.followUpAt ? formatDateTime(c.followUpAt) : "",
    "Date Added": formatDateTime(c.createdAt),
    "Last Activity": c.lastActivityAt ? formatDateTime(c.lastActivityAt) : "",
  }));

  const csv = objectsToCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leadflow-clients-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

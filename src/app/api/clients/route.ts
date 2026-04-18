// src/app/api/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { objectsToCsv } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal("")),
  leadSource: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
  followUpAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.string()).optional(),
  assignedToId: z.string().optional(),
});

// GET /api/clients — list with pagination + filters
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const source = searchParams.get("source");

  const where: Record<string, unknown> = { createdById: session.id };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (source) where.leadSource = source;

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { assignedTo: { select: { name: true, email: true } } },
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } });
}

// POST /api/clients — create new client
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    // Deduplication check
    const existing = await prisma.client.findFirst({
      where: { phone: data.phone, createdById: session.id },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: "A client with this phone number already exists",
        data: { existingId: existing.id },
      }, { status: 409 });
    }

    const client = await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        leadSource: data.leadSource || "Manual",
        notes: data.notes,
        status: (data.status as never) || "NEW",
        followUpAt: data.followUpAt ? new Date(data.followUpAt) : null,
        tags: data.tags || [],
        customFields: data.customFields || undefined,
        assignedToId: data.assignedToId || null,
        createdById: session.id,
        teamId: session.teamId || null,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "LEAD_RECEIVED",
        clientId: client.id,
        userId: session.id,
        notes: `Lead created manually`,
        metadata: { source: "manual" } as Record<string, unknown>,
      },
    });

    // Update tool usage
    await prisma.toolUsage.create({ data: { userId: session.id, action: "create_lead" } });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

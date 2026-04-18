// src/app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(5).optional(),
  email: z.string().email().optional().nullable(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  followUpAt: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.string()).optional(),
  assignedToId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const client = await prisma.client.findFirst({
    where: { id: params.id, createdById: session.id },
    include: {
      assignedTo: true,
      activities: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true, avatarUrl: true } } },
      },
      contentShares: { include: { contentFile: true } },
    },
  });

  if (!client) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: client });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Check old status for change detection
    const old = await prisma.client.findFirst({ where: { id: params.id, createdById: session.id } });
    if (!old) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Build update object explicitly to avoid Prisma type conflicts with assignedToId null
    const updateData: {
      name?: string;
      phone?: string;
      email?: string | null;
      status?: string;
      notes?: string | null;
      tags?: string[];
      customFields?: Record<string, string>;
      followUpAt?: Date | null;
      lastActivityAt: Date;
      assignedTo?: { connect: { id: string } } | { disconnect: true };
    } = { lastActivityAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.customFields !== undefined) updateData.customFields = data.customFields;
    if (data.followUpAt === null) updateData.followUpAt = null;
    else if (data.followUpAt !== undefined) updateData.followUpAt = new Date(data.followUpAt);
    if (data.assignedToId === null) updateData.assignedTo = { disconnect: true };
    else if (data.assignedToId !== undefined) updateData.assignedTo = { connect: { id: data.assignedToId } };

    const client = await prisma.client.update({
      where: { id: params.id },
      data: updateData,
    });

    // Log status change activity
    if (data.status && data.status !== old.status) {
      await prisma.activity.create({
        data: {
          type: "STATUS_CHANGED",
          clientId: client.id,
          userId: session.id,
          notes: `Status changed from ${old.status} to ${data.status}`,
        },
      });
    }

    // Log note added
    if (data.notes && data.notes !== old.notes) {
      await prisma.activity.create({
        data: { type: "NOTE_ADDED", clientId: client.id, userId: session.id, notes: data.notes },
      });
    }

    return NextResponse.json({ success: true, data: client });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const client = await prisma.client.findFirst({ where: { id: params.id, createdById: session.id } });
  if (!client) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  await prisma.client.delete({ where: { id: params.id } });

  await prisma.toolUsage.create({ data: { userId: session.id, action: "delete_lead" } });

  return NextResponse.json({ success: true, message: "Client deleted" });
}

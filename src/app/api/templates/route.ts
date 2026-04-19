import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  body: z.string().min(1),
  channel: z.enum(["WHATSAPP", "SMS", "EMAIL"]),
  category: z.enum(["INTRODUCTION", "FOLLOWUP", "REMINDER", "CLOSING", "AFTER_SALE"]),
  isGlobal: z.boolean().optional(),
});

async function getSession(req: NextRequest) {
  const token = req.cookies.get("leadflow_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const templates = await prisma.template.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: templates });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const data = schema.parse(await req.json());
    const template = await prisma.template.create({ data: { ...data, userId: session.id } });
    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, error: e.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
  await prisma.template.deleteMany({ where: { id, userId: session.id } });
  return NextResponse.json({ success: true });
}

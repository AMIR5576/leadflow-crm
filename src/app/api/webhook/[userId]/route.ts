import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!user) return NextResponse.json({ error: "Invalid webhook URL" }, { status: 404 });

    const body = await req.json();

    const name = body.name || body.full_name || "Unknown";
    const phone = body.phone || body.phone_number || body.mobile || "";
    const email = body.email || body.email_address || "";
    const source = body.source || req.headers.get("x-lead-source") || "Webhook";
    const notes = body.notes || "";

    if (!phone && !email) {
      return NextResponse.json({ error: "Lead must have phone or email" }, { status: 400 });
    }

    const existing = phone
      ? await prisma.client.findFirst({ where: { phone, createdById: user.id } })
      : null;

    if (existing) {
      await prisma.client.update({ where: { id: existing.id }, data: { lastActivityAt: new Date() } });
      await prisma.activity.create({
        data: {
          type: "LEAD_RECEIVED",
          clientId: existing.id,
          userId: user.id,
          notes: `Duplicate lead from ${source}`,
          metadata: { source, duplicate: true },
        },
      });
      return NextResponse.json({ success: true, action: "duplicate_detected", clientId: existing.id });
    }

    const client = await prisma.client.create({
      data: {
        name,
        phone: phone || `email:${email}`,
        email: email || null,
        leadSource: source,
        notes,
        status: "NEW",
        createdById: user.id,
        teamId: user.teamId || null,
      },
    });

    await prisma.activity.create({
      data: {
        type: "LEAD_RECEIVED",
        clientId: client.id,
        userId: user.id,
        notes: `Lead received from ${source}`,
        metadata: { source },
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        clientId: client.id,
        type: "NEW_LEAD",
        title: "New Lead Received!",
        body: `${name} from ${source}${phone ? ` — ${phone}` : ""}`,
        metadata: { source, phone, email },
      },
    });

    await prisma.leadSource.updateMany({
      where: { userId: user.id, name: source },
      data: { leadCount: { increment: 1 } },
    }).catch(() => {});

    await prisma.toolUsage.create({
      data: { userId: user.id, action: "webhook_lead_received" },
    });

    return NextResponse.json({ success: true, action: "created", clientId: client.id }, { status: 201 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

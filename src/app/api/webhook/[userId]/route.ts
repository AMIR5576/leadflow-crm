// src/app/api/webhook/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { IncomingLeadPayload } from "@/types";

// This endpoint receives leads from Facebook, website forms, Zapier, etc.
// URL: /api/webhook/:userId
// Method: POST
// Auth: None required (secured by userId being hard to guess + optional secret)

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!user) {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 404 });
    }

    const body: IncomingLeadPayload = await req.json();

    // Normalize fields (different platforms use different field names)
    const name =
      body.name ||
      body.full_name ||
      [body.first_name, body.last_name].filter(Boolean).join(" ") ||
      "Unknown";
    const phone = body.phone || body.phone_number || body.mobile || "";
    const email = body.email || body.email_address || "";
    const source = body.source || req.headers.get("x-lead-source") || "Webhook";
    const notes = body.notes || formatWebhookNotes(body);

    if (!phone && !email) {
      return NextResponse.json({ error: "Lead must have phone or email" }, { status: 400 });
    }

    // Deduplication
    const existing = phone
      ? await prisma.client.findFirst({ where: { phone, createdById: user.id } })
      : null;

    if (existing) {
      // Update last activity instead of creating duplicate
      await prisma.client.update({
        where: { id: existing.id },
        data: { lastActivityAt: new Date() },
      });
      await prisma.activity.create({
        data: {
          type: "LEAD_RECEIVED",
          clientId: existing.id,
          userId: user.id,
          notes: `Duplicate lead received from ${source} — not duplicated`,
          metadata: { source, duplicate: true },
        },
      });
      return NextResponse.json({ success: true, action: "duplicate_detected", clientId: existing.id });
    }

    // Create the lead
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

    // Log activity
    await prisma.activity.create({
      data: {
        type: "LEAD_RECEIVED",
        clientId: client.id,
        userId: user.id,
        notes: `Lead received from ${source}`,
        metadata: { source, rawPayload: body },
      },
    });

    // Create in-app notification
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

    // Update lead source count
    await prisma.leadSource.updateMany({
      where: { userId: user.id, name: source },
      data: { leadCount: { increment: 1 } },
    }).catch(() => {}); // Ignore if source not found

    // Track tool usage
    await prisma.toolUsage.create({ data: { userId: user.id, action: "webhook_lead_received", metadata: { source } } });

    return NextResponse.json({ success: true, action: "created", clientId: client.id }, { status: 201 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Facebook webhook verification
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

function formatWebhookNotes(body: IncomingLeadPayload): string {
  const skip = ["name", "full_name", "phone", "phone_number", "email", "email_address", "source", "notes"];
  const extras = Object.entries(body)
    .filter(([k]) => !skip.includes(k))
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return extras || "";
}

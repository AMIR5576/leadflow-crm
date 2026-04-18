// src/app/api/generate/sequence/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, checkRateLimit } from "@/lib/auth";
import { generateFollowUpSequence } from "@/lib/openai";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  businessType: z.string().min(2).max(100),
  productOrService: z.string().min(2).max(200),
  tone: z.enum(["professional", "friendly", "urgent"]),
  steps: z.number().min(2).max(7),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(`ai_gen:${session.id}`, 5, 60_000)) {
    return NextResponse.json({ success: false, error: "Rate limit: 5 AI generations per minute" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const input = schema.parse(body);

    const result = await generateFollowUpSequence(input);

    // Optionally save to DB
    if (body.save) {
      const sequence = await prisma.sequence.create({
        data: {
          name: result.sequenceName,
          description: result.description,
          userId: session.id,
          steps: {
            create: result.steps.map((s) => ({
              order: s.order,
              channel: s.channel as never,
              delayMinutes: s.delayMinutes,
              customBody: s.templateBody,
            })),
          },
        },
        include: { steps: true },
      });
      await prisma.toolUsage.create({ data: { userId: session.id, action: "ai_generate_sequence" } });
      return NextResponse.json({ success: true, data: { ...result, savedSequence: sequence } });
    }

    await prisma.toolUsage.create({ data: { userId: session.id, action: "ai_generate_sequence_preview" } });
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: e.errors[0].message }, { status: 400 });
    }
    console.error("AI generation error:", e);
    return NextResponse.json({ success: false, error: "AI generation failed" }, { status: 500 });
  }
}

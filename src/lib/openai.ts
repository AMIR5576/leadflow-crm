// src/lib/openai.ts
import OpenAI from "openai";
import type {
  GenerateSequenceInput,
  GenerateSequenceOutput,
} from "@/types";

// Server-side only — never expose API key to client
if (typeof window !== "undefined") {
  throw new Error("openai.ts must only be imported server-side");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ─── Generate AI Follow-up Sequence ──────────────────────────────────────────

export async function generateFollowUpSequence(
  input: GenerateSequenceInput
): Promise<GenerateSequenceOutput> {
  const prompt = `You are a sales automation expert. Generate a WhatsApp/SMS follow-up sequence for a B2C sales professional.

Business Type: ${input.businessType}
Product/Service: ${input.productOrService}
Tone: ${input.tone}
Number of Steps: ${input.steps}

Generate a ${input.steps}-step follow-up sequence. Each message should be personalized with {{name}} token.

Return ONLY valid JSON matching this structure exactly:
{
  "sequenceName": "string",
  "description": "string",
  "steps": [
    {
      "order": 1,
      "channel": "WHATSAPP",
      "delayMinutes": 0,
      "stepName": "string",
      "templateBody": "string with {{name}} token"
    }
  ]
}

Rules:
- Step 1 always delayMinutes: 0 (immediate)
- Subsequent steps: 1440 (1 day), 4320 (3 days), 7200 (5 days), etc.
- Keep messages under 200 characters for WhatsApp
- Include {{name}} for personalization
- Be conversational and non-spammy
- Channel options: WHATSAPP, SMS, EMAIL`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const parsed = JSON.parse(content) as GenerateSequenceOutput;
  return parsed;
}

// ─── Generate AI Message Template ────────────────────────────────────────────

export async function generateMessageTemplate(
  businessType: string,
  purpose: string,
  channel: "WHATSAPP" | "SMS" | "EMAIL"
): Promise<{ name: string; body: string }> {
  const prompt = `Generate a ${channel} message template for a ${businessType} business.
Purpose: ${purpose}
Use {{name}} for recipient name and {{agent_name}} for sender name.
Return ONLY JSON: { "name": "template name", "body": "message body" }
Keep it under 160 characters for SMS, 250 for WhatsApp.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content);
}

// ─── AI Lead Quality Score ────────────────────────────────────────────────────

export async function scoreLeadQuality(leadData: {
  name: string;
  source: string;
  notes?: string;
  interactions: number;
  contentViews: number;
  daysSinceCreated: number;
}): Promise<{ score: number; reason: string; recommendation: string }> {
  const prompt = `Score this sales lead from 1-100 based on the data below.
Lead: ${JSON.stringify(leadData)}
Return ONLY JSON: { "score": number, "reason": "brief reason", "recommendation": "what to do next" }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 200,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return { score: 50, reason: "Insufficient data", recommendation: "Follow up" };

  return JSON.parse(content);
}

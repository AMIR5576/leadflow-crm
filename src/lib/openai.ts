import OpenAI from "openai";
import type { GenerateSequenceInput, GenerateSequenceOutput } from "@/types";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set in environment variables.");
  return new OpenAI({ apiKey });
}

export async function generateFollowUpSequence(input: GenerateSequenceInput): Promise<GenerateSequenceOutput> {
  const openai = getClient();
  const prompt = `Generate a WhatsApp follow-up sequence for a ${input.businessType} business selling ${input.productOrService}. Tone: ${input.tone}. Steps: ${input.steps}.
Return ONLY valid JSON: { "sequenceName": "string", "description": "string", "steps": [{ "order": 1, "channel": "WHATSAPP", "delayMinutes": 0, "stepName": "string", "templateBody": "string with {{name}}" }] }`;
  const response = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, max_tokens: 1500 });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");
  return JSON.parse(content) as GenerateSequenceOutput;
}

export async function generateMessageTemplate(businessType: string, purpose: string, channel: "WHATSAPP" | "SMS" | "EMAIL"): Promise<{ name: string; body: string }> {
  const openai = getClient();
  const response = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: "user", content: `Generate a ${channel} template for ${businessType}, purpose: ${purpose}. Return JSON: { "name": "string", "body": "string with {{name}}" }` }], response_format: { type: "json_object" }, max_tokens: 300 });
  return JSON.parse(response.choices[0]?.message?.content || "{}");
}

export async function scoreLeadQuality(leadData: { name: string; source: string; interactions: number; contentViews: number; daysSinceCreated: number }): Promise<{ score: number; reason: string; recommendation: string }> {
  const openai = getClient();
  const response = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: "user", content: `Score this lead 1-100: ${JSON.stringify(leadData)}. Return JSON: { "score": number, "reason": "string", "recommendation": "string" }` }], response_format: { type: "json_object" }, max_tokens: 200 });
  return JSON.parse(response.choices[0]?.message?.content || '{"score":50,"reason":"No data","recommendation":"Follow up"}');
}

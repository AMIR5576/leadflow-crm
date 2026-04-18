// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { registerUser, setSessionCookie, checkRateLimit } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  companyName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`register:${ip}`, 5, 60_000)) {
    return NextResponse.json({ success: false, error: "Too many registration attempts." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);
    const result = await registerUser(data.email, data.password, data.name, data.companyName);
    setSessionCookie(result.token);
    return NextResponse.json({ success: true, data: { user: result.user } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: e.errors[0].message }, { status: 400 });
    }
    if (e instanceof Error && e.message.includes("already registered")) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loginUser, setSessionCookie, checkRateLimit } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json({ success: false, error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);
    const result = await loginUser(email, password);
    if (!result) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }
    setSessionCookie(result.token);
    return NextResponse.json({ success: true, data: { user: result.user } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

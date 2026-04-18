// src/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import type { AuthUser } from "@/types";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "leadflow-secret-change-in-production-32chars"
);

const COOKIE_NAME = "leadflow_session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

// ─── Token ────────────────────────────────────────────────────────────────────

export async function signToken(payload: AuthUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

// ─── Cookie session ───────────────────────────────────────────────────────────

export async function getSession(): Promise<AuthUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<AuthUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setSessionCookie(token: string): void {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export function clearSessionCookie(): void {
  cookies().delete(COOKIE_NAME);
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Login / Register ─────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    plan: user.plan,
    teamId: user.teamId,
    avatarUrl: user.avatarUrl,
    companyName: user.companyName,
  };

  const token = await signToken(authUser);
  return { user: authUser, token };
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  companyName?: string
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      companyName,
      role: "OWNER",
      plan: "FREE",
      onboarding: { create: {} },
    },
  });

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    plan: user.plan,
    teamId: user.teamId,
    avatarUrl: user.avatarUrl,
    companyName: user.companyName,
  };

  const token = await signToken(authUser);

  // Log tool usage
  await prisma.toolUsage.create({
    data: { userId: user.id, action: "register" },
  });

  return { user: authUser, token };
}

// ─── Rate Limiting (simple in-memory, use Redis in production) ────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests = 10,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}

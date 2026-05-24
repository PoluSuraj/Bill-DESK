import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { SessionUser } from "@/types";

export const AUTH_COOKIE_NAME = "billdesk_session";
const AUTH_DURATION_SECONDS = 60 * 60 * 12;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const shouldUseSecureCookie = appUrl.startsWith("https://");

function getJwtSecret() {
  return process.env.JWT_SECRET || "billdesk-local-dev-secret-change-me";
}

export function createSessionToken(user: SessionUser) {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    getJwtSecret(),
    {
      algorithm: "HS256",
      expiresIn: AUTH_DURATION_SECONDS
    }
  );
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
    if (!payload.sub || !payload.email || !payload.role || !payload.name) {
      return null;
    }

    return {
      id: String(payload.sub),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as SessionUser["role"]
    };
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export function applySessionCookie(response: NextResponse, user: SessionUser) {
  response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    secure: shouldUseSecureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_DURATION_SECONDS
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: shouldUseSecureCookie,
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}

export async function requireApiSessionUser() {
  return getSessionUser();
}

export function unauthorizedResponse() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

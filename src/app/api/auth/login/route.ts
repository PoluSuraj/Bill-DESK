import { applySessionCookie } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { verifyAuthCredentials } from "@/lib/auth-user-store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    return jsonError("Email and password are required.", 400);
  }

  const result = await verifyAuthCredentials(email, password);
  if (!result) {
    return jsonError("Invalid email or password.", 401);
  }

  const response = jsonSuccess({ user: result.sessionUser }, "Login successful");
  applySessionCookie(response, result.sessionUser);
  return response;
}

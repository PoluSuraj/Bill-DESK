import { applySessionCookie } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { resetPasswordWithToken } from "@/lib/auth-user-store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim();
  const token = body?.token?.trim();
  const password = body?.password;

  if (!email || !token || !password) {
    return jsonError("Email, reset token, and new password are required.", 400);
  }

  if (String(password).length < 8) {
    return jsonError("Password must be at least 8 characters long.", 400);
  }

  const result = await resetPasswordWithToken(email, token, password);
  if (!result) {
    return jsonError("Reset token is invalid or expired.", 400);
  }

  const response = jsonSuccess({ user: result.sessionUser }, "Password reset successfully.");
  applySessionCookie(response, result.sessionUser);
  return response;
}

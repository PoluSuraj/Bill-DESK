import { createPasswordResetToken } from "@/lib/auth-user-store";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim();

  if (!email) {
    return jsonError("Registered email is required.", 400);
  }

  const reset = await createPasswordResetToken(email);

  if (!reset) {
    return jsonSuccess(
      { delivered: true },
      "If this email is registered, a password reset link has been prepared."
    );
  }

  return jsonSuccess(
    {
      delivered: true,
      email: reset.email,
      resetToken: reset.token,
      expiresAt: reset.expiresAt
    },
    "Password reset token generated."
  );
}

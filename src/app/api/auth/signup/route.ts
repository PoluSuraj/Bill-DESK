import { applySessionCookie } from "@/lib/auth";
import { createAuthUser } from "@/lib/auth-user-store";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const businessName = body?.businessName?.trim();
  const ownerName = body?.ownerName?.trim();
  const email = body?.email?.trim();
  const mobile = body?.mobile?.trim();
  const businessType = body?.businessType?.trim();
  const password = body?.password;

  if (!businessName || !ownerName || !email || !mobile || !businessType || !password) {
    return jsonError("All signup fields are required.", 400);
  }

  if (String(password).length < 8) {
    return jsonError("Password must be at least 8 characters long.", 400);
  }

  try {
    const result = await createAuthUser({
      name: ownerName,
      email,
      password,
      role: "OWNER",
      businessName,
      phone: mobile,
      businessType
    });

    const response = jsonSuccess(
      {
        user: result.sessionUser,
        shop: {
          name: businessName,
          phone: mobile,
          email,
          businessType
        }
      },
      "Workspace created"
    );
    applySessionCookie(response, result.sessionUser);
    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create account.", 400);
  }
}

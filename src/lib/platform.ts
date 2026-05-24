import { UserRole } from "@/types";

export const SOFTWARE_ADMIN_EMAIL = "21a91a0547@gmail.com";
export const SOFTWARE_ADMIN_NAME = "Software Administrator";

export function isSoftwareAdminEmail(email: string) {
  return email.trim().toLowerCase() === SOFTWARE_ADMIN_EMAIL.toLowerCase();
}

export function resolveUserRole(email: string, requestedRole: UserRole): UserRole {
  return isSoftwareAdminEmail(email) ? "ADMIN" : requestedRole;
}

export function resolveUserName(email: string, providedName?: string) {
  if (isSoftwareAdminEmail(email)) {
    return SOFTWARE_ADMIN_NAME;
  }

  return providedName || email.split("@")[0];
}

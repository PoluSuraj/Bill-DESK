import "server-only";

import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

import { resolveUserName, resolveUserRole, SOFTWARE_ADMIN_EMAIL, SOFTWARE_ADMIN_NAME } from "@/lib/platform";
import { SessionUser, UserRole } from "@/types";

type PasswordResetToken = {
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
};

type AuthUserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
  businessName?: string;
  phone?: string;
  businessType?: string;
  resetToken?: PasswordResetToken;
};

const configuredAuthDataDir = process.env.AUTH_DATA_DIR;
export const DEFAULT_ADMIN_PASSWORD = "ChangeMe@123";

let resolvedUsersFile: string | null = null;

async function resolveUsersFile() {
  if (resolvedUsersFile) {
    return resolvedUsersFile;
  }

  const candidates = [
    configuredAuthDataDir,
    path.join("/tmp", "billdesk-auth"),
    path.join(process.cwd(), "data")
  ].filter(Boolean) as string[];

  for (const directory of candidates) {
    const usersFile = path.join(directory, "auth-users.json");
    try {
      await fs.mkdir(directory, { recursive: true });
      await fs.access(usersFile).catch(() => fs.writeFile(usersFile, "[]\n", "utf8"));
      resolvedUsersFile = usersFile;
      return usersFile;
    } catch {
      // Try the next writable location. Render requires a disk before /var/data is writable.
    }
  }

  throw new Error("Unable to initialize authentication storage. Please configure a writable AUTH_DATA_DIR.");
}

async function ensureUserStore() {
  await resolveUsersFile();

  const users = await readUsers();
  const adminEmail = SOFTWARE_ADMIN_EMAIL.toLowerCase();
  const existingAdmin = users.find((user) => user.email.toLowerCase() === adminEmail);

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.SOFTWARE_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD, 12);
    users.unshift({
      id: "user-admin-1",
      name: SOFTWARE_ADMIN_NAME,
      email: SOFTWARE_ADMIN_EMAIL,
      role: "ADMIN",
      passwordHash,
      createdAt: new Date().toISOString()
    });
    await writeUsers(users);
  }
}

async function readUsers() {
  const usersFile = await resolveUsersFile();
  const content = await fs.readFile(usersFile, "utf8");

  try {
    return JSON.parse(content) as AuthUserRecord[];
  } catch {
    await fs.writeFile(usersFile, "[]\n", "utf8");
    return [];
  }
}

async function writeUsers(users: AuthUserRecord[]) {
  const usersFile = await resolveUsersFile();
  await fs.writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}


export async function findAuthUserByEmail(email: string) {
  await ensureUserStore();
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

export async function verifyAuthCredentials(email: string, password: string) {
  const user = await findAuthUserByEmail(email);
  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return null;
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: resolveUserRole(user.email, user.role)
  };

  return { user, sessionUser };
}

export async function createAuthUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  businessName?: string;
  phone?: string;
  businessType?: string;
}) {
  await ensureUserStore();
  const users = await readUsers();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const role = resolveUserRole(normalizedEmail, input.role);
  const user: AuthUserRecord = {
    id: `user-${Date.now()}`,
    name: resolveUserName(normalizedEmail, input.name.trim()),
    email: normalizedEmail,
    role,
    passwordHash: await bcrypt.hash(input.password, 12),
    createdAt: new Date().toISOString(),
    businessName: input.businessName?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    businessType: input.businessType?.trim() || undefined
  };

  users.unshift(user);
  await writeUsers(users);

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  return { user, sessionUser };
}


export async function createPasswordResetToken(email: string) {
  const user = await findAuthUserByEmail(email);
  if (!user) {
    return null;
  }

  const users = await readUsers();
  const token = randomBytes(24).toString("hex");
  const tokenHash = await bcrypt.hash(token, 12);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await writeUsers(
    users.map((record) =>
      record.email.toLowerCase() === user.email.toLowerCase()
        ? {
            ...record,
            resetToken: {
              tokenHash,
              expiresAt,
              createdAt: new Date().toISOString()
            }
          }
        : record
    )
  );

  return {
    email: user.email,
    name: user.name,
    token,
    expiresAt
  };
}

export async function resetPasswordWithToken(email: string, token: string, password: string) {
  await ensureUserStore();
  const users = await readUsers();
  const user = users.find((record) => record.email.toLowerCase() === email.trim().toLowerCase());

  if (!user?.resetToken) {
    return null;
  }

  if (new Date(user.resetToken.expiresAt).getTime() < Date.now()) {
    return null;
  }

  const tokenMatches = await bcrypt.compare(token, user.resetToken.tokenHash);
  if (!tokenMatches) {
    return null;
  }

  const nextUsers = await Promise.all(
    users.map(async (record) =>
      record.email.toLowerCase() === user.email.toLowerCase()
        ? {
            ...record,
            passwordHash: await bcrypt.hash(password, 12),
            resetToken: undefined
          }
        : record
    )
  );

  await writeUsers(nextUsers);

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: resolveUserRole(user.email, user.role)
  };

  return { user, sessionUser };
}

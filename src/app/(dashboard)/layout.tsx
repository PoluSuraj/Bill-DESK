import { AppShell } from "@/components/layout/app-shell";
import { requireSessionUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSessionUser();
  return <AppShell initialUser={user}>{children}</AppShell>;
}

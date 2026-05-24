import { redirect } from "next/navigation";

import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { requireSessionUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await requireSessionUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AdminWorkspace />;
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return <AdminConsole />;
}

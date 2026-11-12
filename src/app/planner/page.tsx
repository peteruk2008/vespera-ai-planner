import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { PlannerWorkspace } from "@/components/planner/PlannerWorkspace";

export default async function PlannerPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <PlannerWorkspace />;
}

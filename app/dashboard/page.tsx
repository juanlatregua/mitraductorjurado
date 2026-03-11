import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await getSession();

  if (!session) redirect("/auth/login");

  switch (session.user.role) {
    case "admin":
      redirect("/dashboard/admin");
    case "translator":
      redirect("/dashboard/translator");
    case "client":
      redirect("/dashboard/client");
    default:
      redirect("/auth/login");
  }
}

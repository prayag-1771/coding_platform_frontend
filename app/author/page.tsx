import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthorDashboardClient from "./AuthorDashboardClient";

export default async function AuthorPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "author") {
    redirect("/");
  }

  return <AuthorDashboardClient />;
}

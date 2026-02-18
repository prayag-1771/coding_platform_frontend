import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import TeacherDashboardClient from "./TeacherDashboardClient";

export default async function TeacherPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    redirect("/");
  }

  return <TeacherDashboardClient />;
}

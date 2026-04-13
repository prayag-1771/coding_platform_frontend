import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ProblemsClient from "./ProblemsClient";

export default async function ProblemsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    redirect("/");
  }

  return <ProblemsClient />;
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import EditProblemClient from "./EditProblemClient";

export default async function EditProblemPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    redirect("/");
  }

  return <EditProblemClient />;
}

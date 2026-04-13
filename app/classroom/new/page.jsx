import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import NewAssignmentClient from "./NewAssignmentClient";

export default async function NewAssignmentPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    redirect("/");
  }

  return <NewAssignmentClient />;
}

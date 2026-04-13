import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import NewAuthorProblemClient from "./NewAuthorProblemClient";

export default async function NewAuthorProblemPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "author") {
    redirect("/");
  }

  return <NewAuthorProblemClient />;
}

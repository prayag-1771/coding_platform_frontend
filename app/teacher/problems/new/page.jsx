import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import NewProblemForm from "./NewProblemForm";

export default async function NewProblemPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    redirect("/");
  }

  return <NewProblemForm />;
}

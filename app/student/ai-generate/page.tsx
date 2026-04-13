import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AIGenerateClient from "./AIGenerateClient";

export default async function StudentAIGeneratePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "student") {
    redirect("/");
  }

  return <AIGenerateClient />;
}

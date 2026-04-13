import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import MyProblemsClient from "./MyProblemsClient";

export default async function MyProblemsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <MyProblemsClient />;
}

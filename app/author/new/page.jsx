import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthorNewClient from "./AuthorNewClient";

export default async function AuthorNewPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "author") {
    redirect("/");
  }

  return <AuthorNewClient />;
}

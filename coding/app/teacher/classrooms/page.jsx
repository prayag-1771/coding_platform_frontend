import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ClassroomsClient from "./ClassroomsClient";

export default async function ClassroomsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    redirect("/");
  }

  return <ClassroomsClient />;
}

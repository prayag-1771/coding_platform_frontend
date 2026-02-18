import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ClassroomClient from "./ClassroomClient";

export default async function ClassroomPage({ params }: any) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    redirect("/");
  }

  return <ClassroomClient classroomId={params.id} />;
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import StudentClassroomClient from "./StudentClassroomClient";

export default async function Page({ params }: any) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/");

  return <StudentClassroomClient classroomId={params.id} />;
}
    
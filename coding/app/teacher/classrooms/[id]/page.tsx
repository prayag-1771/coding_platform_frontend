import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ClassroomClient from "./ClassroomClient";

export default async function Page(props: any) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/");

  const { id } = await props.params;

  return <ClassroomClient classroomId={id} />;
}

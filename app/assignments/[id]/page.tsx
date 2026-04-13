import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AssignmentClient from "./AssignmentClient";

export default async function Page(props: any) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await props.params;

  return <AssignmentClient assignmentId={id} />;
}

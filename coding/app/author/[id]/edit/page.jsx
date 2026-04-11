import {connectDB} from "@/lib/mongodb";
import Problem from "@/models/Problem";
import ProblemForm from "@/components/author/ProblemForm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function EditProblemPage({ params }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "author") {
    redirect("/");
  }

  await connectDB();
  const problem = await Problem.findById(params.id).lean();

  return <ProblemForm initialData={problem} isEdit />;
}
    
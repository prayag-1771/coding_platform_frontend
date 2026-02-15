import connectDB from "@/lib/db";
import Problem from "@/models/Problem";
import ProblemForm from "@/components/author/ProblemForm";

export default async function EditProblemPage({ params }) {
  await connectDB();
  const problem = await Problem.findById(params.id).lean();

  return <ProblemForm initialData={problem} isEdit />;
}

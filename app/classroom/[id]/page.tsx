import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";

export default async function AssignmentPage({
  params,
}: {
  params: { id: string };
}) {
  await connectDB();

  const assignment = await Assignment.findById(params.id)
    .populate("problems")
    .lean();

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>{assignment.title}</h1>
      <p>{assignment.description}</p>
      <p>
        Deadline:{" "}
        {new Date(assignment.deadline).toLocaleString()}
      </p>

      <h2>Problems</h2>

      <ul>
        {assignment.problems.map((p: any) => (
          <li key={p._id}>
            {p.title} ({p.difficulty})
          </li>
        ))}
      </ul>
    </div>
  );
}

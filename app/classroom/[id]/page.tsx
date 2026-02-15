import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import Link from "next/link";

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectDB();

  const { id } = await params;

  const assignment = await Assignment.findById(id)
    .populate("problems")
    .lean();

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  const userId = "demo-user";

  const submissions = await AssignmentSubmission.find({
    assignmentId: assignment._id,
    userId,
  }).lean();

  const bestScores: Record<string, number> = {};

  for (const sub of submissions) {
    const pid = sub.problemId.toString();
    if (!bestScores[pid] || sub.score > bestScores[pid]) {
      bestScores[pid] = sub.score;
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>{assignment.title}</h1>

      {assignment.description && <p>{assignment.description}</p>}

      {assignment.deadline && (
        <p>
          Deadline:{" "}
          {new Date(assignment.deadline).toLocaleString()}
        </p>
      )}

      <h2>Problems</h2>

      <ul>
        {assignment.problems.map((p: any) => {
          const score = bestScores[p._id.toString()] || 0;

          return (
            <li key={p._id} style={{ marginBottom: 10 }}>
              <Link
              href={`/?problemId=${p._id}&assignmentId=${assignment._id}`}
                style={{
                  color: "blue",
                  textDecoration: "underline",
                }}
              >
                {p.title} ({p.difficulty})
              </Link>

              <span style={{ marginLeft: 10 }}>
                Score: {score}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

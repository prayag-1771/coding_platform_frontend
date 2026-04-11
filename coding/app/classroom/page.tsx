import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function ClassroomPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    redirect("/");
  }

  await connectDB();
  let assignments: any[] = [];
  let loadError = false;

  try {
    assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .lean();
  } catch {
    loadError = true;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Assignments</h1>

      <br />

      <Link
        href="/classroom/new"
        style={{
          display: "inline-block",
          marginBottom: 20,
          padding: "8px 12px",
          background: "black",
          color: "white",
          textDecoration: "none"
        }}
      >
        + Create Assignment
      </Link>

      <ul>
        {loadError && (
          <li style={{ color: "red" }}>
            Failed to load assignments. Please refresh and try again.
          </li>
        )}

        {!loadError && assignments.length === 0 && (
          <li style={{ color: "gray" }}>No assignments found.</li>
        )}

        {assignments.map((a: any) => (
          <li key={a._id} style={{ marginBottom: 10 }}>
            <Link
              href={`/classroom/${a._id}`}
              style={{
                color: "blue",
                textDecoration: "underline"
              }}
            >
              {a.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import Link from "next/link";

export default async function ClassroomPage() {
  await connectDB();

  const assignments = await Assignment.find()
    .sort({ createdAt: -1 })
    .lean();

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

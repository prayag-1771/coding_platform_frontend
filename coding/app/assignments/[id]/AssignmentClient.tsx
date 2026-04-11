"use client";

import { useEffect, useState } from "react";

export default function AssignmentClient({ assignmentId }: any) {
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssignment() {
      try {
        setError(null);
        const res = await fetch(`/api/assignments/${assignmentId}`);

        if (!res.ok) {
          throw new Error("Failed to load assignment");
        }

        const data = await res.json();
        setAssignment(data);
      } catch {
        setError("Unable to load assignment right now.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssignment();
  }, [assignmentId]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#05060f] text-white p-8">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#05060f] text-white p-8">
        <p className="text-red-400">{error}</p>
      </div>
    );

  if (!assignment)
    return (
      <div className="min-h-screen bg-[#05060f] text-white p-8">
        Assignment not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#05060f] text-white p-8 space-y-8">
      <h1 className="text-3xl font-bold">
        {assignment.title}
      </h1>

      <div className="text-sm text-gray-400">
        Deadline: {new Date(assignment.deadline).toLocaleString()}
      </div>

      <div className="space-y-6">
        {assignment.problems.map((p: any) => (
          <div
            key={p._id}
            onClick={() =>
              window.location.href =
                `/?problemId=${p._id}&assignmentId=${assignment._id}`
            }
            className="border border-white/10 bg-white/5 p-4 rounded cursor-pointer hover:bg-white/10 transition"
          >
            <div className="font-semibold">
              {p.title}
            </div>
            <div className="text-sm text-gray-400">
              {p.difficulty}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
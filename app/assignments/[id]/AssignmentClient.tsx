"use client";

import { useEffect, useState } from "react";

export default function AssignmentClient({ assignmentId }: any) {
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/assignments/${assignmentId}`)
      .then(res => res.json())
      .then(data => setAssignment(data));
  }, [assignmentId]);

  if (!assignment)
    return (
      <div className="min-h-screen bg-[#05060f] text-white p-8">
        Loading...
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
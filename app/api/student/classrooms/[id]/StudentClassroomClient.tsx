"use client";

import { useEffect, useState } from "react";

export default function StudentClassroomClient({ classroomId }: any) {
  const [classroom, setClassroom] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/classroom/${classroomId}`)
      .then(res => res.json())
      .then(data => setClassroom(data));
  }, [classroomId]);

  if (!classroom) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">{classroom.name}</h1>

      <h2 className="text-xl font-semibold">Assignments</h2>

      {classroom.assignments.map((a: any) => (
        <div
          key={a._id}
          onClick={() => window.location.href = `/assignment/${a._id}`}
          className="border p-4 rounded cursor-pointer"
        >
          <div className="font-semibold">{a.title}</div>
          <div className="text-sm text-gray-500">
            Deadline: {new Date(a.deadline).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

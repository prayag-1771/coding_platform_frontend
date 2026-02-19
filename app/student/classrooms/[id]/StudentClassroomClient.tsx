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

      {classroom.assignments?.map((a: any) => {
  const isExpired = new Date(a.deadline) < new Date();

  return (
    <div
      key={a._id}
      onClick={() =>
        window.location.href = `/assignments/${a._id}`
      }
      className="border p-5 rounded-lg cursor-pointer hover:bg-gray-100 transition"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {a.title}
        </h3>

        <span
          className={`text-xs px-3 py-1 rounded-full ${
            isExpired
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {isExpired ? "Expired" : "Active"}
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Deadline: {new Date(a.deadline).toLocaleString()}
      </p>

      <p className="text-sm text-gray-500">
        Problems: {a.problems?.length || 0}
      </p>
    </div>
  );
})}

    </div>
  );
}

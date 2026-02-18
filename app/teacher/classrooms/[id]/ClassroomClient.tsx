"use client";

import { useEffect, useState } from "react";

export default function ClassroomClient({ classroomId }: any) {
  const [classroom, setClassroom] = useState<any>(null);
  const [studentEmail, setStudentEmail] = useState("");


  useEffect(() => {
    fetch(`/api/classroom/${classroomId}`)
      .then(res => res.json())
      .then(data => setClassroom(data));
  }, [classroomId]);

  if (!classroom) return <div className="p-8">Loading...</div>;

  async function addStudent() {
  if (!studentEmail) return;

  await fetch(`/api/classroom/${classroomId}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: studentEmail }),
  });

  setStudentEmail("");

  fetch(`/api/classroom/${classroomId}`)
    .then(res => res.json())
    .then(data => setClassroom(data));
}


  return (
    <div className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        {classroom.name}
      </h1>

      <div>
        <h2 className="text-xl font-semibold mb-2">
          Students
        </h2>
        <p>{classroom.students.length} students enrolled</p>
      </div>

      <div>
  <h2 className="text-xl font-semibold mb-2">
    Students
  </h2>

  <div className="flex gap-3 mb-4">
    <input
      className="border p-2 rounded"
      placeholder="Student email"
      value={studentEmail}
      onChange={(e) => setStudentEmail(e.target.value)}
    />
    <button
      onClick={addStudent}
      className="bg-black text-white px-4 py-2 rounded"
    >
      Add Student
    </button>
  </div>

  <ul className="space-y-2">
    {classroom.students.map((s: any, index: number) => (
      <li key={index} className="border p-2 rounded">
        {s}
      </li>
    ))}
  </ul>
</div>

    </div>
  );
}

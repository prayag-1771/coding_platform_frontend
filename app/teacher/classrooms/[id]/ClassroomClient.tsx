"use client";

import { useEffect, useState } from "react";

export default function ClassroomClient({ classroomId }: any) {
  const [classroom, setClassroom] = useState<any>(null);

  const [studentEmail, setStudentEmail] = useState("");

  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  useEffect(() => {
    fetch(`/api/problems`)
      .then(res => res.json())
      .then(data => setProblems(data));
  }, []);

  async function fetchClassroom() {
    const res = await fetch(`/api/classroom/${classroomId}`);
    const data = await res.json();
    setClassroom(data);
  }

  if (!classroom) return <div className="p-8">Loading...</div>;

  async function addStudent() {
    if (!studentEmail) return;

    await fetch(`/api/classroom/${classroomId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: studentEmail }),
    });

    setStudentEmail("");
    fetchClassroom();
  }
  console.log("ClassroomId:", classroomId);

  async function createAssignment() {
    if (!assignmentTitle || !deadline || selectedProblems.length === 0) {
      alert("Fill all fields");
      return;
    }

    await fetch(`/api/classroom/${classroomId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: assignmentTitle,
        description: "",
        deadline,
        problems: selectedProblems,
      }),
    });

    setAssignmentTitle("");
    setDeadline("");
    setSelectedProblems([]);
    fetchClassroom();
  }

  return (
    <div className="min-h-screen p-8 space-y-10">
      <h1 className="text-3xl font-bold">{classroom.name}</h1>

      <div>
        <h2 className="text-xl font-semibold mb-4">Students</h2>

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
          {classroom.students?.map((s: any) => (
            <li key={s._id} className="border p-2 rounded">
              {s.name} ({s.email})
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Create Assignment</h2>

        <input
          className="border p-2 rounded mb-3 w-full"
          placeholder="Assignment Title"
          value={assignmentTitle}
          onChange={(e) => setAssignmentTitle(e.target.value)}
        />

        <input
          type="datetime-local"
          className="border p-2 rounded mb-3 w-full"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div className="mb-4">
          <p className="font-semibold mb-2">Select Problems:</p>

          {problems.map((p: any) => (
            <div key={p._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProblems.includes(p._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProblems([...selectedProblems, p._id]);
                  } else {
                    setSelectedProblems(
                      selectedProblems.filter(id => id !== p._id)
                    );
                  }
                }}
              />
              <span>
                {p.title} ({p.difficulty})
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={createAssignment}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Create Assignment
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Assignments</h2>

        <ul className="space-y-3">
          {classroom.assignments?.map((a: any) => (
            <li key={a._id} className="border p-3 rounded">
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-gray-500">
                Deadline: {new Date(a.deadline).toLocaleString()}
              </div>
              <div className="text-sm">
                Problems: {a.problems?.length || 0}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

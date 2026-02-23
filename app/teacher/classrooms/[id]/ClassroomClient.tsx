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
    fetch(`/api/problems?scope=assignable`)
      .then(res => res.json())
      .then(data => setProblems(data));
  }, []);

  async function fetchClassroom() {
    const res = await fetch(`/api/classroom/${classroomId}`);
    const data = await res.json();
    setClassroom(data);
  }

  if (!classroom)
    return (
      <div className="min-h-screen bg-[#05060f] text-white p-8">
        Loading...
      </div>
    );

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
    <div className="min-h-screen w-full bg-[#05060f] text-white p-8 space-y-10">
      <h1 className="text-3xl font-bold">{classroom.name}</h1>

      <div className="bg-[#0b0e14] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Students</h2>

        <div className="flex gap-3">
          <input
            className="bg-black/40 border border-white/10 p-2 rounded focus:outline-none focus:border-white/30"
            placeholder="Student email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
          />
          <button
            onClick={addStudent}
            className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded transition"
          >
            Add Student
          </button>
        </div>

        <ul className="space-y-2">
          {classroom.students?.map((s: any) => (
            <li
              key={s._id}
              className="bg-black/40 border border-white/10 p-2 rounded"
            >
              {s.name} ({s.email})
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[#0b0e14] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Create Assignment</h2>

        <input
          className="bg-black/40 border border-white/10 p-2 rounded w-full focus:outline-none focus:border-white/30"
          placeholder="Assignment Title"
          value={assignmentTitle}
          onChange={(e) => setAssignmentTitle(e.target.value)}
        />

        <input
          type="datetime-local"
          className="bg-black/40 border border-white/10 p-2 rounded w-full focus:outline-none focus:border-white/30"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div>
          <p className="font-semibold mb-2">Select Problems:</p>

          <div className="space-y-2">
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
                  className="accent-violet-400"
                />
                <span className="text-gray-300">
                  {p.title} ({p.difficulty})
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={createAssignment}
          className="bg-violet-400 text-black px-6 py-2 rounded font-semibold"
        >
          Create Assignment
        </button>
      </div>

      <div className="bg-[#0b0e14] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Assignments</h2>

        <ul className="space-y-3">
          {classroom.assignments?.map((a: any) => (
            <li
              key={a._id}
              className="bg-black/40 border border-white/10 p-3 rounded"
            >
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-gray-400">
                Deadline: {new Date(a.deadline).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                Problems: {a.problems?.length || 0}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
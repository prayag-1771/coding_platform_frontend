"use client";

import { useEffect, useState } from "react";

export default function ClassroomsClient() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchClassrooms();
  }, []);

  async function fetchClassrooms() {
    const res = await fetch("/api/classroom");
    const data = await res.json();
    setClassrooms(data);
  }

  async function createClassroom() {
    if (!name) return;

    await fetch("/api/classroom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setName("");
    fetchClassrooms();
  }

  return (
    <div className="min-h-screen w-full bg-[#05060f] text-white p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        Manage Classrooms
      </h1>

      <div className="flex gap-4">
        <input
          className="bg-black/40 border border-white/10 p-2 rounded focus:outline-none focus:border-white/30"
          placeholder="Classroom name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={createClassroom}
          className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded transition"
        >
          Create
        </button>
      </div>

      <div className="space-y-3">
        {classrooms.map((c: any) => (
          <div
            key={c._id}
            onClick={() =>
              window.location.href = `/teacher/classrooms/${c._id}`
            }
            className="bg-[#0b0e14] border border-white/10 p-4 rounded cursor-pointer hover:bg-[#121622] transition"
          >
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

export default function ClassroomsClient() {
  const [classrooms, setClassrooms] = useState([]);
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
    <div className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        Manage Classrooms
      </h1>

      <div className="flex gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Classroom name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={createClassroom}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      <div className="space-y-3">
        {classrooms.map((c: any) => (
          <div key={c._id} className="border p-4 rounded">
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}

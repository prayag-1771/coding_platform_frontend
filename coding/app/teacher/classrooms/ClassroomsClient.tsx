"use client";

import { useEffect, useState } from "react";

export default function ClassroomsClient() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  async function fetchClassrooms() {
    try {
      setError(null);
      const res = await fetch("/api/classroom");

      if (!res.ok) {
        throw new Error("Failed to load classrooms");
      }

      const data = await res.json();
      setClassrooms(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load classrooms right now.");
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  }

  async function createClassroom() {
    if (!name) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error("Failed to create classroom");
      }

      setName("");
      await fetchClassrooms();
    } catch {
      setError("Could not create classroom. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
          disabled={submitting}
          className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded transition"
        >
          {submitting ? "Creating..." : "Create"}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <div className="space-y-3">
        {loading && (
          <p className="text-gray-400">Loading classrooms...</p>
        )}

        {!loading && !error && classrooms.length === 0 && (
          <p className="text-gray-400">No classrooms found.</p>
        )}

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
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProblemsPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  async function fetchProblems() {
    try {
      const res = await fetch("/api/problems?scope=private");
      const data = await res.json();
      setProblems(data);
    } catch (err) {
      console.error("Failed to fetch problems", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Are you sure?");
    if (!confirmDelete) return;

    await fetch(`/api/problems/${id}`, {
      method: "DELETE",
    });

    fetchProblems();
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#05060f] text-white p-8">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#05060f] text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Problems</h1>
        <button
          onClick={() => router.push("/teacher/problems/new")}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded transition"
        >
          + Create Problem
        </button>
      </div>

      <div className="space-y-4">
        {problems.map((problem: any) => (
          <div
            key={problem._id}
            className="p-4 bg-[#0b0e14] border border-white/10 rounded-lg flex justify-between items-center hover:bg-[#121622] transition"
          >
            <div>
              <h2 className="text-lg font-semibold">{problem.title}</h2>
              <p className="text-sm text-gray-400">
                Difficulty: {problem.difficulty}
              </p>
            </div>

            <div className="space-x-3">
              <button
                onClick={() =>
                  router.push(`/teacher/problems/${problem._id}/edit`)
                }
                className="px-3 py-1 border border-white/10 rounded hover:bg-white/10 transition"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(problem._id)}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
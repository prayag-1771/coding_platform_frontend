"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProblemsPage() {
  const router = useRouter();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  async function fetchProblems() {
    try {
      const res = await fetch("/api/problems");
      const data = await res.json();
      setProblems(data);
    } catch (err) {
      console.error("Failed to fetch problems", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmDelete = confirm("Are you sure?");
    if (!confirmDelete) return;

    await fetch(`/api/problems/${id}`, {
      method: "DELETE",
    });

    fetchProblems();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Problems</h1>
        <button
          onClick={() => router.push("/teacher/problems/new")}
          className="px-4 py-2 bg-black text-white rounded"
        >
          + Create Problem
        </button>
      </div>

      <div className="space-y-4">
        {problems.map((problem) => (
          <div
            key={problem._id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">{problem.title}</h2>
              <p className="text-sm text-gray-500">
                Difficulty: {problem.difficulty}
              </p>
            </div>

            <div className="space-x-3">
              <button
                onClick={() =>
                  router.push(`/teacher/problems/${problem._id}/edit`)
                }
                className="px-3 py-1 border rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(problem._id)}
                className="px-3 py-1 bg-red-500 text-white rounded"
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

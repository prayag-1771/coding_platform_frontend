"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  createdAt: string;
}

export default function AuthorDashboardClient() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await fetch("/api/problems?visibility=public", {
          credentials: "include",
        });

        const data = await res.json();
        setProblems(data);
      } catch (err) {
        console.error("Failed to fetch problems", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Author Dashboard</h1>

        <button
          onClick={() => router.push("/author/problems/new")}
          className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          + Create Problem
        </button>
      </div>

      {loading ? (
        <p>Loading problems...</p>
      ) : problems.length === 0 ? (
        <p className="text-gray-500">No public problems yet.</p>
      ) : (
        <div className="space-y-4">
          {problems.map((problem) => (
            <div
              key={problem._id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/problems/${problem._id}`)}
            >
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">{problem.title}</h2>
                <span className="text-sm px-2 py-1 bg-gray-200 rounded">
                  {problem.difficulty}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Created on {new Date(problem.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
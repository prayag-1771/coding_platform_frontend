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
    <div className="min-h-screen bg-[#05060f] text-white p-8">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Author Dashboard
        </h1>

        <button
          onClick={() => router.push("/author/problems/new")}
          className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition"
        >
          + Create Problem
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-white/10 rounded-lg bg-[#0b0e14]">
              <div className="flex justify-between items-center">
                <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
                <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-3 w-32 bg-white/10 rounded animate-pulse mt-3" />
            </div>
          ))}
        </div>
      ) : problems.length === 0 ? (
        <p className="text-gray-500">
          No public problems yet.
        </p>
      ) : (
        <div className="space-y-4">
          {problems.map((problem) => (
            <div
              key={problem._id}
              className="p-4 border border-white/10 rounded-lg bg-[#0b0e14] hover:bg-[#121622] transition cursor-pointer"
              onClick={() =>
                router.push(`/problems/${problem._id}`)
              }
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {problem.title}
                </h2>
                <span className="text-sm px-2 py-1 bg-white/10 rounded border border-white/10">
                  {problem.difficulty}
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Created on{" "}
                {new Date(problem.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

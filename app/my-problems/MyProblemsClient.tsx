"use client";

import { useEffect, useState } from "react";

export default function MyProblemsClient() {
  const [problems, setProblems] = useState<any[]>([]);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch("/api/problems/my");
        const data = await res.json();

        if (Array.isArray(data.problems)) {
          setProblems(data.problems);
          setRole(data.role);
        } else {
          setProblems([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-[#05060f] text-white p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        My Problems
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-white/10 bg-white/5 p-4 rounded">
              <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-32 bg-white/10 rounded animate-pulse mt-2" />
              <div className="flex gap-3 mt-3">
                <div className="h-4 w-12 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-10 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : problems.length === 0 ? (
        <p className="text-gray-400">
          No problems found.
        </p>
      ) : (
        <div className="space-y-3">
          {problems.map((p) => (
            <div
              key={p._id}
              className="border border-white/10 bg-white/5 p-4 rounded hover:bg-white/10 transition"
            >
              <h3 className="font-semibold text-lg">
                {p.title}
              </h3>

              <p className="text-sm text-gray-400">
                Difficulty: {p.difficulty}
              </p>

              <div className="mt-3 flex gap-3 text-sm">

                <button
                  onClick={() =>
                    window.location.href = `/?problemId=${p._id}`
                  }
                  className="text-violet-400 hover:text-violet-300"
                >
                  Open
                </button>

                {(role === "teacher" || role === "author") && (
                  <button
                    onClick={() =>
                      window.location.href = `/teacher/problems/${p._id}/edit`
                    }
                    className="text-green-400 hover:text-green-300"
                  >
                    Edit
                  </button>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

export default function MyProblemsPage() {
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
        <p className="text-gray-400">Loading...</p>
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
                      window.location.href = `/teacher/problems/edit/${p._id}`
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
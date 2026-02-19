"use client";

import { useEffect, useState } from "react";

export default function PracticePage() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    fetch("/api/problems?visibility=public")
      .then(res => res.json())
      .then(data => setProblems(data || []));
  }, []);

  return (
    <div className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        Public Problems
      </h1>

      {problems.length === 0 ? (
        <p className="text-gray-500">
          No public problems available.
        </p>
      ) : (
        <div className="space-y-3">
          {problems.map((p) => (
            <div
              key={p._id}
              onClick={() =>
                window.location.href =
                  `/?problemId=${p._id}`
              }
              className="border p-4 rounded cursor-pointer hover:bg-gray-100 transition"
            >
              <div className="font-semibold">
                {p.title}
              </div>
              <div className="text-sm text-gray-500">
                Difficulty: {p.difficulty || "N/A"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, use } from "react";

export default function ProblemPage({ params }) {

  const { id } = use(params);

  const [problem, setProblem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/problems/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load problem");
          return;
        }

        setProblem(data);
      } catch {
        setError("Network error");
      }
    }

    load();
  }, [id]);

  if (error) return <div style={{ padding: 20 }}>{error}</div>;
  if (!problem)
    return (
      <div className="min-h-screen bg-[#05060f] text-white p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-10 w-72 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-11/12 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-24 w-full bg-white/5 border border-white/10 rounded animate-pulse" />
        <div className="h-24 w-full bg-white/5 border border-white/10 rounded animate-pulse" />
      </div>
    );

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2>{problem.title}</h2>

      <p>
        <b>Difficulty:</b> {problem.difficulty}
      </p>

      <pre style={{ whiteSpace: "pre-wrap" }}>
        {problem.statement}
      </pre>

      <h4>Sample testcases</h4>
        
      {problem.testcases
  .filter(tc => tc.visibility === "sample")
  .map((tc, index) => (
    <div
      key={tc._id || index}
      style={{
        border: "1px solid #ccc",
        padding: 10,
        marginBottom: 10,
      }}
    >
      <div>
        <strong>Input:</strong>
        <pre>{tc.stdin}</pre>
      </div>
      <div>
        <strong>Output:</strong>
        <pre>{tc.expected}</pre>
      </div>
    </div>
))}
    </div>
  );
}

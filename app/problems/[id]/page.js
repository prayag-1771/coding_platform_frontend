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
  if (!problem) return <div style={{ padding: 20 }}>Loading...</div>;

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

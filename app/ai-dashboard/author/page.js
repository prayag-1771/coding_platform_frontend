"use client";

import { useState } from "react";

export default function AuthorProblemPage() {
  const [text, setText] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState("cpp");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setSaveMsg("");

    try {
      const res = await fetch("/api/ai/author-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          difficulty,
          language
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed");
        setLoading(false);
        return;
      }

      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setError("Network error");
    }

    setLoading(false);
  }

  async function saveProblem() {
    setError("");
    setSaveMsg("");

    let obj;
    try {
      obj = JSON.parse(result);
    } catch {
      setError("JSON is invalid. Fix it before saving.");
      return;
    }

    try {
      const res = await fetch("/api/problems/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }

      setSaveMsg("Saved successfully.");
    } catch {
      setError("Network error while saving.");
    }
  }

  function exportJSON() {
    const blob = new Blob([result], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "problem.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h2>AI Problem Author</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Difficulty: </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>

        <span style={{ marginLeft: 12 }}>Language: </span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
      </div>

      <textarea
        rows={8}
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Paste your own problem idea or your own question text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button disabled={loading || !text} onClick={generate}>
        {loading ? "Generating..." : "Generate problem JSON"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: 10 }}>
          {error}
        </div>
      )}

      {saveMsg && (
        <div style={{ color: "green", marginTop: 10 }}>
          {saveMsg}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h4>Generated / Editable JSON</h4>

        <textarea
          rows={20}
          style={{ width: "100%" }}
          value={result}
          onChange={(e) => setResult(e.target.value)}
        />

        {result && (
          <div style={{ marginTop: 10 }}>
            <button onClick={exportJSON}>
              Export problem.json
            </button>

            <button
              style={{ marginLeft: 10 }}
              onClick={saveProblem}
            >
              Save to library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

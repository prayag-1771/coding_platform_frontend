"use client";

import { useState } from "react";

export default function AuthorPage() {
  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [compareMode, setCompareMode] = useState("trimmed");
  const [saving, setSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [testcases, setTestcases] = useState([
    { stdin: "", expected: "", visibility: "sample", weight: 1 }
  ]);

  // 🔥 AI GENERATION
  async function handleAIGenerate() {
    if (!idea.trim()) {
      alert("Enter an idea first.");
      return;
    }

    try {
      setIsGenerating(true);

      const res = await fetch("/api/ai/author-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: idea,
          difficulty,
          language: "javascript"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "AI generation failed");
        return;
      }

      // Autofill safely
      setTitle(data.title || "");
      setStatement(data.statement || "");
      setDifficulty(data.difficulty || "medium");
      setCompareMode(data.compareMode || "trimmed");

      setTestcases(
        Array.isArray(data.testcases) && data.testcases.length > 0
          ? data.testcases
          : [{ stdin: "", expected: "", visibility: "sample", weight: 1 }]
      );

    } catch (err) {
      console.error(err);
      alert("AI generation error");
    } finally {
      setIsGenerating(false);
    }
  }

  // 🔥 SAVE FUNCTION
  async function handleSave() {
    try {
      setSaving(true);

      const cleanedTestcases = testcases.filter(
        (tc) =>
          tc.stdin.trim() !== "" &&
          tc.expected.trim() !== ""
      );

      if (cleanedTestcases.length === 0) {
        alert("At least one valid testcase required.");
        return;
      }

      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          statement,
          difficulty,
          compareMode,
          testcases: cleanedTestcases,
          timeLimitMs: 1000,
          memoryLimitMb: 64,
          tags: [],
          starterCode: {}
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save");
        return;
      }

      alert("Saved: " + data._id);

      // Reset
      setIdea("");
      setTitle("");
      setStatement("");
      setDifficulty("medium");
      setCompareMode("trimmed");
      setTestcases([
        { stdin: "", expected: "", visibility: "sample", weight: 1 }
      ]);

    } catch (err) {
      console.error(err);
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  }

  function addTestcase() {
    setTestcases([
      ...testcases,
      { stdin: "", expected: "", visibility: "hidden", weight: 1 }
    ]);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Create Problem</h1>

      {/* IDEA INPUT */}
      <textarea
        placeholder="Enter problem idea (e.g., longest subarray with sum K)"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={3}
        cols={60}
      />

      <br /><br />

      {/* AI BUTTON */}
      <button
        onClick={handleAIGenerate}
        disabled={isGenerating}
        style={{ marginBottom: 15, marginRight: 10 }}
      >
        {isGenerating ? "Generating..." : "Generate with AI"}
      </button>

      <br />

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Statement"
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        rows={6}
        cols={60}
      />

      <br /><br />

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option value="easy">easy</option>
        <option value="medium">medium</option>
        <option value="hard">hard</option>
      </select>

      <select
        value={compareMode}
        onChange={(e) => setCompareMode(e.target.value)}
      >
        <option value="strict">strict</option>
        <option value="trimmed">trimmed</option>
        <option value="ignore-whitespace">ignore-whitespace</option>
      </select>

      <h3>Testcases</h3>

      {testcases.map((tc, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <textarea
            placeholder="stdin"
            value={tc.stdin}
            onChange={(e) => {
              const copy = [...testcases];
              copy[i].stdin = e.target.value;
              setTestcases(copy);
            }}
          />

          <textarea
            placeholder="expected"
            value={tc.expected}
            onChange={(e) => {
              const copy = [...testcases];
              copy[i].expected = e.target.value;
              setTestcases(copy);
            }}
          />

          <select
            value={tc.visibility}
            onChange={(e) => {
              const copy = [...testcases];
              copy[i].visibility = e.target.value;
              setTestcases(copy);
            }}
          >
            <option value="sample">sample</option>
            <option value="hidden">hidden</option>
          </select>

          <input
            type="number"
            value={tc.weight}
            onChange={(e) => {
              const copy = [...testcases];
              copy[i].weight = Number(e.target.value);
              setTestcases(copy);
            }}
          />
        </div>
      ))}

      <button onClick={addTestcase}>Add Testcase</button>

      <br /><br />

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Problem"}
      </button>
    </div>
  );
}

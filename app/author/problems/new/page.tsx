"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAuthorProblemPage() {
  const router = useRouter();

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
        credentials: "include",
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

      alert("Saved successfully!");
      router.push("/author");

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
    <div className="min-h-screen p-10 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Create Public Problem</h1>

      <div className="space-y-3">
        <textarea
          placeholder="Enter problem idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="w-full border p-3 rounded-lg"
          rows={3}
        />

        <button
          onClick={handleAIGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          {isGenerating ? "Generating..." : "Generate with AI"}
        </button>
      </div>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-3 rounded-lg"
      />

      <textarea
        placeholder="Problem Statement"
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        className="w-full border p-3 rounded-lg"
        rows={6}
      />

      <div className="flex gap-4">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>

        <select
          value={compareMode}
          onChange={(e) => setCompareMode(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="strict">strict</option>
          <option value="trimmed">trimmed</option>
          <option value="ignore-whitespace">ignore-whitespace</option>
        </select>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Testcases</h2>

        {testcases.map((tc, i) => (
          <div key={i} className="border p-4 rounded-lg space-y-2">
            <textarea
              placeholder="stdin"
              value={tc.stdin}
              onChange={(e) => {
                const copy = [...testcases];
                copy[i].stdin = e.target.value;
                setTestcases(copy);
              }}
              className="w-full border p-2 rounded"
            />

            <textarea
              placeholder="expected output"
              value={tc.expected}
              onChange={(e) => {
                const copy = [...testcases];
                copy[i].expected = e.target.value;
                setTestcases(copy);
              }}
              className="w-full border p-2 rounded"
            />

            <div className="flex gap-4 items-center">
              <select
                value={tc.visibility}
                onChange={(e) => {
                  const copy = [...testcases];
                  copy[i].visibility = e.target.value;
                  setTestcases(copy);
                }}
                className="border p-2 rounded"
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
                className="border p-2 rounded w-24"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addTestcase}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg"
        >
          Add Testcase
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        {saving ? "Saving..." : "Save Problem"}
      </button>
    </div>
  );
}
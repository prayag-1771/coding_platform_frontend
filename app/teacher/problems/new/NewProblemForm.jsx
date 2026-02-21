"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProblemForm() {
  const router = useRouter();

  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [compareMode, setCompareMode] = useState("trimmed");

  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [testcases, setTestcases] = useState([
    { stdin: "", expected: "", visibility: "sample", weight: 1 }
  ]);

  async function handleAIGenerate() {
    if (!idea.trim()) {
      alert("Enter idea first");
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
          context: "assignment"
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
      alert("AI error");
    } finally {
      setIsGenerating(false);
    }
  }

  function addTestcase() {
    setTestcases([
      ...testcases,
      { stdin: "", expected: "", visibility: "hidden", weight: 1 }
    ]);
  }

  function updateTestcase(index, field, value) {
    const copy = [...testcases];
    copy[index][field] = value;
    setTestcases(copy);
  }

  function removeTestcase(index) {
    setTestcases(testcases.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!title.trim() || !statement.trim()) {
      alert("Title and statement required");
      return;
    }

    const cleaned = testcases.filter(
      (tc) => tc.stdin.trim() && tc.expected.trim()
    );

    if (cleaned.length === 0) {
      alert("At least one valid testcase required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          statement,
          difficulty,
          compareMode,
          testcases: cleaned,
          timeLimitMs: 1000,
          memoryLimitMb: 64,
          tags: [],
          starterCode: {},
          visibility: "private"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Save failed");
        return;
      }

      alert("Problem saved");

      router.push("/teacher/problems");

    } catch (err) {
      console.error(err);
      alert("Save error");
    } finally {
      setSaving(false);
    }
  }

  return (
  <div className="min-h-screen bg-gray-50 py-10">
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Teacher Problem Studio
        </h1>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          {saving ? "Saving..." : "Save Problem"}
        </button>
      </div>

      <div className="border rounded-xl p-6 space-y-4 bg-gray-50">
        <h2 className="text-lg font-semibold">AI Generator</h2>

        <textarea
          placeholder="Enter problem idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleAIGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {isGenerating ? "Generating..." : "Generate with AI"}
        </button>
      </div>

      <div className="border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Problem Details</h2>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />

        <textarea
          placeholder="Statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          className="w-full border p-3 rounded-lg h-48 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <div className="flex gap-4">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={compareMode}
            onChange={(e) => setCompareMode(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="strict">Strict</option>
            <option value="trimmed">Trimmed</option>
            <option value="ignore-whitespace">Ignore Whitespace</option>
          </select>
        </div>
      </div>

      <div className="border rounded-xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Testcases</h2>

          <button
            onClick={addTestcase}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Add Testcase
          </button>
        </div>

        {testcases.map((tc, i) => (
          <div
            key={i}
            className="border rounded-xl p-4 space-y-3 bg-gray-50"
          >
            <div className="grid grid-cols-2 gap-4">
              <textarea
                placeholder="Input (stdin)"
                value={tc.stdin}
                onChange={(e) =>
                  updateTestcase(i, "stdin", e.target.value)
                }
                className="border p-2 rounded-lg"
              />

              <textarea
                placeholder="Expected Output"
                value={tc.expected}
                onChange={(e) =>
                  updateTestcase(i, "expected", e.target.value)
                }
                className="border p-2 rounded-lg"
              />
            </div>

            <div className="flex gap-4 items-center">
              <select
                value={tc.visibility}
                onChange={(e) =>
                  updateTestcase(i, "visibility", e.target.value)
                }
                className="border p-2 rounded-lg"
              >
                <option value="sample">Sample</option>
                <option value="hidden">Hidden</option>
              </select>

              <input
                type="number"
                value={tc.weight}
                onChange={(e) =>
                  updateTestcase(i, "weight", Number(e.target.value))
                }
                className="border p-2 rounded-lg w-24"
              />

              <button
                onClick={() => removeTestcase(i)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
);
}
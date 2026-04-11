"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function createTestcaseId() {
  return `tc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTestcase(testcase = {}) {
  return {
    id: testcase.id || createTestcaseId(),
    stdin: testcase.stdin || "",
    expected: testcase.expected || "",
    visibility: testcase.visibility || "hidden",
    weight: testcase.weight ?? 1,
  };
}

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
    normalizeTestcase({ visibility: "sample" })
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
          ? data.testcases.map(normalizeTestcase)
          : [normalizeTestcase({ visibility: "sample" })]
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
      normalizeTestcase()
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
    <div className="min-h-screen bg-[#05060f] py-10 text-white">
      <div className="max-w-5xl mx-auto bg-[#0b0e14] border border-white/10 p-8 rounded-2xl space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Teacher Problem Studio
          </h1>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-violet-400 text-black rounded-lg font-semibold"
          >
            {saving ? "Saving..." : "Save Problem"}
          </button>
        </div>

        <div className="border border-white/10 rounded-xl p-6 space-y-4 bg-black/30">
          <h2 className="text-lg font-semibold">AI Generator</h2>

          <textarea
            placeholder="Enter problem idea..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-white/30"
          />

          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition"
          >
            {isGenerating ? "Generating..." : "Generate with AI"}
          </button>
        </div>

        <div className="border border-white/10 rounded-xl p-6 space-y-4 bg-black/30">
          <h2 className="text-lg font-semibold">Problem Details</h2>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-white/30"
          />

          <textarea
            placeholder="Statement"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg h-48 focus:outline-none focus:border-white/30"
          />

          <div className="flex gap-4">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-black/40 border border-white/10 p-2 rounded-lg"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={compareMode}
              onChange={(e) => setCompareMode(e.target.value)}
              className="bg-black/40 border border-white/10 p-2 rounded-lg"
            >
              <option value="strict">Strict</option>
              <option value="trimmed">Trimmed</option>
              <option value="ignore-whitespace">Ignore Whitespace</option>
            </select>
          </div>
        </div>

        <div className="border border-white/10 rounded-xl p-6 space-y-6 bg-black/30">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Testcases</h2>

            <button
              onClick={addTestcase}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition"
            >
              Add Testcase
            </button>
          </div>

          {testcases.map((tc, i) => (
            <div
              key={tc.id}
              className="border border-white/10 rounded-xl p-4 space-y-3 bg-black/40"
            >
              <div className="grid grid-cols-2 gap-4">
                <textarea
                  placeholder="Input (stdin)"
                  value={tc.stdin}
                  onChange={(e) =>
                    updateTestcase(i, "stdin", e.target.value)
                  }
                  className="bg-black/50 border border-white/10 p-2 rounded-lg"
                />

                <textarea
                  placeholder="Expected Output"
                  value={tc.expected}
                  onChange={(e) =>
                    updateTestcase(i, "expected", e.target.value)
                  }
                  className="bg-black/50 border border-white/10 p-2 rounded-lg"
                />
              </div>

              <div className="flex gap-4 items-center">
                <select
                  value={tc.visibility}
                  onChange={(e) =>
                    updateTestcase(i, "visibility", e.target.value)
                  }
                  className="bg-black/50 border border-white/10 p-2 rounded-lg"
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
                  className="bg-black/50 border border-white/10 p-2 rounded-lg w-24"
                />

                <button
                  onClick={() => removeTestcase(i)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
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
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function createTestcaseId() {
  return `tc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTestcase(testcase: Record<string, unknown> = {}) {
  return {
    id: typeof testcase.id === "string" && testcase.id ? testcase.id : createTestcaseId(),
    stdin: typeof testcase.stdin === "string" ? testcase.stdin : "",
    expected: typeof testcase.expected === "string" ? testcase.expected : "",
    visibility:
      testcase.visibility === "sample" ? "sample" : "hidden",
    weight:
      typeof testcase.weight === "number" && Number.isFinite(testcase.weight)
        ? testcase.weight
        : 1,
  };
}

export default function NewAuthorProblemClient() {
  const router = useRouter();

  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [compareMode, setCompareMode] = useState("trimmed");
  const [visibility, setVisibility] = useState("public");
  const [saving, setSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  const [testcases, setTestcases] = useState([
    normalizeTestcase({ visibility: "sample" }),
  ]);

  async function handleAIGenerate() {
    if (!idea.trim()) {
      setMessage("Enter an idea first.");
      setMessageType("error");
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
          language: "javascript",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "AI generation failed");
        setMessageType("error");
        return;
      }

      setMessage("Problem generated successfully.");
      setMessageType("success");

      setTitle(data.title || "");
      setStatement(data.statement || "");
      setDifficulty(data.difficulty || "medium");
      setCompareMode(data.compareMode || "trimmed");

      setTestcases(
        Array.isArray(data.testcases) && data.testcases.length > 0
          ? data.testcases.map((tc: Record<string, unknown>) => normalizeTestcase(tc))
          : [normalizeTestcase({ visibility: "sample" })]
      );
    } catch (err) {
      console.error(err);
      setMessage("AI generation error");
      setMessageType("error");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const cleanedTestcases = testcases.filter(
        (tc) => tc.stdin.trim() !== "" && tc.expected.trim() !== ""
      );

      if (cleanedTestcases.length === 0) {
        setMessage("At least one valid testcase required.");
        setMessageType("error");
        setSaving(false);
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
          visibility,
          testcases: cleanedTestcases,
          timeLimitMs: 1000,
          memoryLimitMb: 64,
          tags: [],
          starterCode: {},
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to save");
        setMessageType("error");
        return;
      }

      setMessage("Saved successfully!");
      setMessageType("success");
      router.push("/author");
    } catch (err) {
      console.error(err);
      setMessage("Error saving");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  function addTestcase() {
    setTestcases([
      ...testcases,
      normalizeTestcase(),
    ]);
  }

  return (
    <div className="min-h-screen w-full bg-[#05060f] text-white">
      <div className="p-10 max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Create Public Problem</h1>

        {message && (
          <p className={messageType === "error" ? "text-red-400" : "text-green-400"}>
            {message}
          </p>
        )}

        <div className="space-y-3 bg-[#0b0e14] border border-white/10 p-6 rounded-xl">
          <textarea
            placeholder="Enter problem idea..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-white/30"
            rows={3}
          />

          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition"
          >
            {isGenerating ? "Generating..." : "Generate with AI"}
          </button>
        </div>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-white/30"
        />

        <textarea
          placeholder="Problem Statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-white/30"
          rows={6}
        />

        <div className="flex gap-4">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-black/40 border border-white/10 p-2 rounded focus:outline-none focus:border-white/30"
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>

          <select
            value={compareMode}
            onChange={(e) => setCompareMode(e.target.value)}
            className="bg-black/40 border border-white/10 p-2 rounded focus:outline-none focus:border-white/30"
          >
            <option value="strict">strict</option>
            <option value="trimmed">trimmed</option>
            <option value="ignore-whitespace">ignore-whitespace</option>
          </select>

          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="bg-black/40 border border-white/10 p-2 rounded focus:outline-none focus:border-white/30"
          >
            <option value="public">public</option>
            <option value="private">private</option>
          </select>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Testcases</h2>

          {testcases.map((tc, i) => (
            <div key={tc.id} className="bg-[#0b0e14] border border-white/10 p-4 rounded-xl space-y-3">
              <textarea
                placeholder="stdin"
                value={tc.stdin}
                onChange={(e) => {
                  const copy = [...testcases];
                  copy[i].stdin = e.target.value;
                  setTestcases(copy);
                }}
                className="w-full bg-black/40 border border-white/10 p-2 rounded focus:outline-none focus:border-white/30"
              />

              <textarea
                placeholder="expected output"
                value={tc.expected}
                onChange={(e) => {
                  const copy = [...testcases];
                  copy[i].expected = e.target.value;
                  setTestcases(copy);
                }}
                className="w-full bg-black/40 border border-white/10 p-2 rounded focus:outline-none focus:border-white/30"
              />

              <div className="flex gap-4 items-center">
                <select
                  value={tc.visibility}
                  onChange={(e) => {
                    const copy = [...testcases];
                    copy[i].visibility = e.target.value;
                    setTestcases(copy);
                  }}
                  className="bg-black/40 border border-white/10 p-2 rounded focus:outline-none focus:border-white/30"
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
                  className="bg-black/40 border border-white/10 p-2 rounded w-24 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addTestcase}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition"
          >
            Add Testcase
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-violet-400 text-black rounded-lg font-semibold"
        >
          {saving ? "Saving..." : "Save Problem"}
        </button>
      </div>
    </div>
  );
}
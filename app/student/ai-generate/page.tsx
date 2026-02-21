"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Testcase = {
  stdin: string;
  expected: string;
  visibility: "sample" | "hidden";
  weight: number;
};

export default function StudentAIGeneratePage() {
  const router = useRouter();

  const [idea, setIdea] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [statement, setStatement] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [compareMode, setCompareMode] = useState<
    "strict" | "trimmed" | "ignore-whitespace"
  >("trimmed");

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [testcases, setTestcases] = useState<Testcase[]>([
    { stdin: "", expected: "", visibility: "sample", weight: 1 },
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
          context: "practice",
        }),
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

      if (Array.isArray(data.testcases) && data.testcases.length > 0) {
        setTestcases(data.testcases as Testcase[]);
      } else {
        setTestcases([
          { stdin: "", expected: "", visibility: "sample", weight: 1 },
        ]);
      }
    } catch (err) {
      console.error(err);
      alert("AI error");
    } finally {
      setIsGenerating(false);
    }
  }

  function addTestcase() {
    setTestcases((prev) => [
      ...prev,
      { stdin: "", expected: "", visibility: "hidden", weight: 1 },
    ]);
  }

  function updateTestcase(
    index: number,
    field: keyof Testcase,
    value: string | number
  ) {
    setTestcases((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      } as Testcase;
      return copy;
    });
  }

  function removeTestcase(index: number) {
    setTestcases((prev) => prev.filter((_, i) => i !== index));
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
          visibility: "private",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Save failed");
        return;
      }

      alert("Problem saved for practice");
      router.push("/student/dashboard");
    } catch (err) {
      console.error(err);
      alert("Save error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">AI Practice Generator</h1>

      <textarea
        placeholder="Enter idea (e.g., sliding window max sum)"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button
        onClick={handleAIGenerate}
        disabled={isGenerating}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isGenerating ? "Generating..." : "Generate with AI"}
      </button>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <textarea
        placeholder="Statement"
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        className="w-full border p-2 rounded h-40"
      />

      <div className="flex gap-4">
        <select
          value={difficulty}
          onChange={(e) =>
            setDifficulty(e.target.value as "easy" | "medium" | "hard")
          }
          className="border p-2 rounded"
        >
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>

        <select
          value={compareMode}
          onChange={(e) =>
            setCompareMode(
              e.target.value as "strict" | "trimmed" | "ignore-whitespace"
            )
          }
          className="border p-2 rounded"
        >
          <option value="strict">strict</option>
          <option value="trimmed">trimmed</option>
          <option value="ignore-whitespace">ignore-whitespace</option>
        </select>
      </div>

      <h3 className="font-semibold">Testcases</h3>

      {testcases.map((tc: Testcase, i: number) => (
        <div key={i} className="border p-3 rounded space-y-2">
          <textarea
            placeholder="stdin"
            value={tc.stdin}
            onChange={(e) =>
              updateTestcase(i, "stdin", e.target.value)
            }
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="expected"
            value={tc.expected}
            onChange={(e) =>
              updateTestcase(i, "expected", e.target.value)
            }
            className="w-full border p-2 rounded"
          />

          <div className="flex gap-3">
            <select
              value={tc.visibility}
              onChange={(e) =>
                updateTestcase(
                  i,
                  "visibility",
                  e.target.value as "sample" | "hidden"
                )
              }
              className="border p-2 rounded"
            >
              <option value="sample">sample</option>
              <option value="hidden">hidden</option>
            </select>

            <input
              type="number"
              value={tc.weight}
              onChange={(e) =>
                updateTestcase(i, "weight", Number(e.target.value))
              }
              className="border p-2 rounded w-24"
            />

            <button
              onClick={() => removeTestcase(i)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addTestcase}
        className="px-4 py-2 bg-gray-600 text-white rounded"
      >
        Add Testcase
      </button>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 bg-black text-white rounded"
      >
        {saving ? "Saving..." : "Save for Practice"}
      </button>
    </div>
  );
}
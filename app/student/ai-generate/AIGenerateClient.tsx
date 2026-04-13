"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Testcase = {
  stdin: string;
  expected: string;
  visibility: "sample" | "hidden";
  weight: number;
};

export default function AIGenerateClient() {
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
          starterCode: {
            javascript: "",
            python: "",
            cpp: "",
          },
          visibility: "private",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Save failed");
        return;
      }

      alert("Problem saved for practice");
      router.push("/my-problems");
    } catch (err) {
      console.error(err);
      alert("Save error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#05060f] text-white py-10">
      <div className="max-w-5xl mx-auto bg-[#0b0e14] border border-white/10 p-8 rounded-2xl shadow-xl space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            AI Practice Generator
          </h1>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-violet-500 text-black rounded-lg hover:bg-violet-400 transition"
          >
            {saving ? "Saving..." : "Save for Practice"}
          </button>
        </div>

        <div className="border border-white/10 rounded-xl p-6 bg-white/5 space-y-4">
          <h2 className="text-lg font-semibold">Generate with AI</h2>

          <textarea
            placeholder="Enter idea (e.g., sliding window max sum)"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full bg-[#05060f] border border-white/10 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-violet-600 text-black rounded-lg hover:bg-violet-500 transition"
          >
            {isGenerating ? "Generating..." : "Generate with AI"}
          </button>
        </div>

        <div className="border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Problem Details</h2>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#05060f] border border-white/10 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <textarea
            placeholder="Statement"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className="w-full bg-[#05060f] border border-white/10 p-3 rounded-lg h-48 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <div className="flex gap-4">
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as "easy" | "medium" | "hard")
              }
              className="bg-[#05060f] border border-white/10 p-2 rounded-lg"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={compareMode}
              onChange={(e) =>
                setCompareMode(
                  e.target.value as "strict" | "trimmed" | "ignore-whitespace"
                )
              }
              className="bg-[#05060f] border border-white/10 p-2 rounded-lg"
            >
              <option value="strict">Strict</option>
              <option value="trimmed">Trimmed</option>
              <option value="ignore-whitespace">Ignore Whitespace</option>
            </select>
          </div>
        </div>

        <div className="border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Testcases</h2>

            <button
              onClick={addTestcase}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
            >
              Add Testcase
            </button>
          </div>

          {testcases.map((tc: Testcase, i: number) => (
            <div
              key={i}
              className="border border-white/10 rounded-xl p-4 bg-white/5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <textarea
                  placeholder="Input (stdin)"
                  value={tc.stdin}
                  onChange={(e) =>
                    updateTestcase(i, "stdin", e.target.value)
                  }
                  className="bg-[#05060f] border border-white/10 p-2 rounded-lg"
                />

                <textarea
                  placeholder="Expected Output"
                  value={tc.expected}
                  onChange={(e) =>
                    updateTestcase(i, "expected", e.target.value)
                  }
                  className="bg-[#05060f] border border-white/10 p-2 rounded-lg"
                />
              </div>

              <div className="flex gap-4 items-center">
                <select
                  value={tc.visibility}
                  onChange={(e) =>
                    updateTestcase(
                      i,
                      "visibility",
                      e.target.value as "sample" | "hidden"
                    )
                  }
                  className="bg-[#05060f] border border-white/10 p-2 rounded-lg"
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
                  className="bg-[#05060f] border border-white/10 p-2 rounded-lg w-24"
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
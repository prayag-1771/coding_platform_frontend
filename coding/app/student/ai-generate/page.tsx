"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Testcase = {
  id: string;
  stdin: string;
  expected: string;
  visibility: "sample" | "hidden";
  weight: number;
};

function createTestcaseId() {
  return `tc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTestcase(testcase: Partial<Testcase> = {}): Testcase {
  return {
    id: testcase.id || createTestcaseId(),
    stdin: testcase.stdin || "",
    expected: testcase.expected || "",
    visibility: testcase.visibility || "hidden",
    weight: testcase.weight ?? 1,
  };
}

export default function StudentAIGeneratePage() {
  const router = useRouter();

  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [compareMode, setCompareMode] = useState<
    "strict" | "trimmed" | "ignore-whitespace"
  >("trimmed");
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [testcases, setTestcases] = useState<Testcase[]>([
    normalizeTestcase({ visibility: "sample" }),
  ]);

  async function handleAIGenerate() {
    if (!idea.trim()) {
      setMessage("Enter idea first");
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
          context: "practice",
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

      if (Array.isArray(data.testcases) && data.testcases.length > 0) {
        setTestcases(
          data.testcases.map((tc: Partial<Testcase>) => normalizeTestcase(tc))
        );
      } else {
        setTestcases([normalizeTestcase({ visibility: "sample" })]);
      }
    } catch (err) {
      console.error(err);
      setMessage("AI error");
      setMessageType("error");
    } finally {
      setIsGenerating(false);
    }
  }

  function addTestcase() {
    setTestcases((prev) => [...prev, normalizeTestcase()]);
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
      setMessage("Title and statement required");
      setMessageType("error");
      return;
    }

    const cleaned = testcases.filter(
      (tc) => tc.stdin.trim() && tc.expected.trim()
    );

    if (cleaned.length === 0) {
      setMessage("At least one valid testcase required");
      setMessageType("error");
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
        setMessage(data.error || "Save failed");
        setMessageType("error");
        return;
      }

      setMessage("Problem saved for practice");
      setMessageType("success");
      router.push("/my-problems");
    } catch (err) {
      console.error(err);
      setMessage("Save error");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#05060f] text-white py-10">
      <div className="max-w-5xl mx-auto bg-[#0b0e14] border border-white/10 p-8 rounded-2xl shadow-xl space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">AI Practice Generator</h1>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-violet-500 text-black rounded-lg hover:bg-violet-400 transition"
          >
            {saving ? "Saving..." : "Save for Practice"}
          </button>
        </div>

        {message && (
          <p className={messageType === "error" ? "text-red-400" : "text-green-400"}>
            {message}
          </p>
        )}

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

          {testcases.map((tc, i) => (
            <div
              key={tc.id}
              className="border border-white/10 rounded-xl p-4 bg-white/5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <textarea
                  placeholder="Input (stdin)"
                  value={tc.stdin}
                  onChange={(e) => updateTestcase(i, "stdin", e.target.value)}
                  className="bg-[#05060f] border border-white/10 p-2 rounded-lg"
                />

                <textarea
                  placeholder="Expected Output"
                  value={tc.expected}
                  onChange={(e) => updateTestcase(i, "expected", e.target.value)}
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

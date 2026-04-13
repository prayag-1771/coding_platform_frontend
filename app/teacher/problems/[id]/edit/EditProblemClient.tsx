"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProblemClient() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<any>({
    title: "",
    statement: "",
    difficulty: "medium",
    tags: "",
    timeLimitMs: 1000,
    memoryLimitMb: 64,
    compareMode: "trimmed",
    starterCode: {
      javascript: "",
      python: "",
      cpp: "",
    },
    testcases: [],
  });

  useEffect(() => {
    async function fetchProblem() {
      const res = await fetch(`/api/problems/${id}`);
      const data = await res.json();

      setForm({
        ...data,
        tags: data.tags?.join(", ") || "",
      });

      setLoading(false);
    }

    fetchProblem();
  }, [id]);

  function handleChange(e: any) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function addTestcase() {
    setForm({
      ...form,
      testcases: [
        ...form.testcases,
        {
          stdin: "",
          expected: "",
          visibility: "hidden",
          weight: 1,
        },
      ],
    });
  }

  function updateTestcase(index: number, field: string, value: any) {
    const updated = [...form.testcases];
    updated[index][field] = value;
    setForm({ ...form, testcases: updated });
  }

  function removeTestcase(index: number) {
    const updated = form.testcases.filter((_: any, i: number) => i !== index);
    setForm({ ...form, testcases: updated });
  }

  async function handleUpdate() {
    const payload = {
      ...form,
      tags: form.tags
        ? form.tags.split(",").map((t: string) => t.trim())
        : [],
    };

    const res = await fetch(`/api/problems/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/teacher/problems");
    } else {
      alert("Failed to update problem");
    }
  }

  if (loading)
    return (
      <div className="fixed inset-0 bg-[#05060f] text-white overflow-y-auto">
        <div className="min-h-screen p-8 space-y-8 max-w-4xl mx-auto">
          <div className="h-10 w-56 bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-40 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-40 bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-full bg-white/10 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-10 w-40 bg-white/10 rounded animate-pulse" />
            <div className="h-10 w-40 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-32 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-44 bg-white/10 rounded animate-pulse" />
          <div className="h-12 w-48 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-[#05060f] text-white overflow-y-auto">
      <div className="min-h-screen p-8 space-y-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Edit Problem</h1>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full bg-black/40 border border-white/10 p-2 rounded focus:outline-none focus:border-white/30"
        />

        <textarea
          name="statement"
          value={form.statement}
          onChange={handleChange}
          className="w-full bg-black/40 border border-white/10 p-2 rounded h-40 focus:outline-none focus:border-white/30"
        />

        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          className="bg-black/40 border border-white/10 p-2 rounded"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          name="compareMode"
          value={form.compareMode}
          onChange={handleChange}
          className="bg-black/40 border border-white/10 p-2 rounded"
        >
          <option value="strict">Strict</option>
          <option value="trimmed">Trimmed</option>
          <option value="ignore-whitespace">
            Ignore Whitespace
          </option>
        </select>

        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          className="w-full bg-black/40 border border-white/10 p-2 rounded"
        />

        <div className="flex gap-4">
          <input
            type="number"
            name="timeLimitMs"
            value={form.timeLimitMs}
            onChange={handleChange}
            className="bg-black/40 border border-white/10 p-2 rounded"
          />

          <input
            type="number"
            name="memoryLimitMb"
            value={form.memoryLimitMb}
            onChange={handleChange}
            className="bg-black/40 border border-white/10 p-2 rounded"
          />
        </div>

        <textarea
          value={form.starterCode.javascript}
          onChange={(e) =>
            setForm({
              ...form,
              starterCode: {
                ...form.starterCode,
                javascript: e.target.value,
              },
            })
          }
          className="w-full bg-black/40 border border-white/10 p-2 rounded h-32 font-mono"
          placeholder="JavaScript Starter Code"
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Testcases</h2>

          {form.testcases.map((tc: any, index: number) => (
            <div
              key={index}
              className="bg-[#0b0e14] border border-white/10 p-4 rounded space-y-3"
            >
              <textarea
                value={tc.stdin}
                onChange={(e) =>
                  updateTestcase(index, "stdin", e.target.value)
                }
                className="w-full bg-black/40 border border-white/10 p-2 rounded"
              />

              <textarea
                value={tc.expected}
                onChange={(e) =>
                  updateTestcase(index, "expected", e.target.value)
                }
                className="w-full bg-black/40 border border-white/10 p-2 rounded"
              />

              <button
                type="button"
                onClick={() => removeTestcase(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addTestcase}
            className="px-4 py-2 border border-white/10 rounded hover:bg-white/10 transition"
          >
            + Add Testcase
          </button>
        </div>

        <button
          onClick={handleUpdate}
          className="px-6 py-3 bg-violet-400 text-black rounded-lg font-semibold"
        >
          Update Problem
        </button>
      </div>
    </div>
  );
}
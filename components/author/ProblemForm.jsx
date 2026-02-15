"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProblemForm({ initialData = {}, isEdit = false }) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: initialData.title || "",
    statement: initialData.statement || "",
    difficulty: initialData.difficulty || "easy",
    tags: initialData.tags?.join(", ") || "",
    compareMode: initialData.compareMode || "trimmed",
    timeLimit: initialData.timeLimit || 2000,
    memoryLimit: initialData.memoryLimit || 256,
    starterCode: initialData.starterCode || {
      javascript: "",
      python: "",
      cpp: "",
    },
    testcases: initialData.testcases || [],
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addTestcase() {
    setForm({
      ...form,
      testcases: [
        ...form.testcases,
        { input: "", expectedOutput: "", isSample: false, weight: 1 },
      ],
    });
  }

  function updateTestcase(index, field, value) {
    const updated = [...form.testcases];
    updated[index][field] = value;
    setForm({ ...form, testcases: updated });
  }

  function removeTestcase(index) {
    const updated = form.testcases.filter((_, i) => i !== index);
    setForm({ ...form, testcases: updated });
  }

  async function handleSubmit() {
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()),
    };

    const url = isEdit
      ? `/api/problems/${initialData._id}`
      : "/api/problems";

    const method = isEdit ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    router.push("/author");
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        className="w-full border p-2"
      />

      <textarea
        name="statement"
        placeholder="Problem Statement (Markdown supported)"
        value={form.statement}
        onChange={handleChange}
        className="w-full border p-2 h-40"
      />

      <select
        name="difficulty"
        value={form.difficulty}
        onChange={handleChange}
        className="border p-2"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <input
        name="tags"
        placeholder="Tags (comma separated)"
        value={form.tags}
        onChange={handleChange}
        className="w-full border p-2"
      />

      <div className="flex gap-4">
        <input
          name="timeLimit"
          type="number"
          value={form.timeLimit}
          onChange={handleChange}
          className="border p-2"
          placeholder="Time Limit (ms)"
        />
        <input
          name="memoryLimit"
          type="number"
          value={form.memoryLimit}
          onChange={handleChange}
          className="border p-2"
          placeholder="Memory Limit (MB)"
        />
      </div>

      <button
        onClick={addTestcase}
        className="bg-blue-500 text-white px-4 py-2"
      >
        Add Testcase
      </button>

      {form.testcases.map((tc, i) => (
        <div key={i} className="border p-4 space-y-2">
          <textarea
            placeholder="Input"
            value={tc.input}
            onChange={(e) =>
              updateTestcase(i, "input", e.target.value)
            }
            className="w-full border p-2"
          />
          <textarea
            placeholder="Expected Output"
            value={tc.expectedOutput}
            onChange={(e) =>
              updateTestcase(i, "expectedOutput", e.target.value)
            }
            className="w-full border p-2"
          />
          <div className="flex gap-4">
            <label>
              Sample:
              <input
                type="checkbox"
                checked={tc.isSample}
                onChange={(e) =>
                  updateTestcase(i, "isSample", e.target.checked)
                }
              />
            </label>
            <input
              type="number"
              value={tc.weight}
              onChange={(e) =>
                updateTestcase(i, "weight", Number(e.target.value))
              }
              className="border p-1"
            />
          </div>
          <button
            onClick={() => removeTestcase(i)}
            className="text-red-500"
          >
            Delete
          </button>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-6 py-2"
      >
        {isEdit ? "Update Problem" : "Create Problem"}
      </button>
    </div>
  );
}

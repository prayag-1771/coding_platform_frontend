"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProblemForm() {
  const router = useRouter();

  const [form, setForm] = useState({
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

  function handleChange(e) {
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
  if (!form.title.trim() || !form.statement.trim()) {
    alert("Title and statement are required");
    return;
  }

  const payload = {
    ...form,
    tags: form.tags.split(",").map(t => t.trim()),
  };

  const res = await fetch("/api/problems", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    router.push("/teacher/problems");
  } else {
    alert("Failed to create problem");
  }
}
async function handleSubmit() {
  if (!form.title.trim() || !form.statement.trim()) {
    alert("Title and statement are required");
    return;
  }

  const payload = {
    ...form,
    tags: form.tags.split(",").map(t => t.trim()),
  };

  const res = await fetch("/api/problems", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    router.push("/teacher/problems");
  } else {
    alert("Failed to create problem");
  }
}


  return (
    <div className="min-h-screen p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Create New Problem</h1>

      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <textarea
        name="statement"
        placeholder="Problem Statement"
        value={form.statement}
        onChange={handleChange}
        className="w-full border p-2 rounded h-40"
      />

      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-black text-white rounded"
      >
        Save Problem
      </button>
    </div>
  );
}

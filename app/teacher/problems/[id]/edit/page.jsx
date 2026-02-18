
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProblemPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);

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


  async function handleUpdate() {
    const payload = {
      ...form,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim())
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Edit Problem</h1>

      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <textarea
        name="statement"
        value={form.statement}
        onChange={handleChange}
        className="w-full border p-2 rounded h-40"
      />

      <select
        name="difficulty"
        value={form.difficulty}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <select
        name="compareMode"
        value={form.compareMode}
        onChange={handleChange}
        className="border p-2 rounded"
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
        className="w-full border p-2 rounded"
      />

      <div className="flex gap-4">
        <input
          type="number"
          name="timeLimitMs"
          value={form.timeLimitMs}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="memoryLimitMb"
          value={form.memoryLimitMb}
          onChange={handleChange}
          className="border p-2 rounded"
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
        className="w-full border p-2 rounded h-32 font-mono"
        placeholder="JavaScript Starter Code"
      />
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Testcases</h2>

        {form.testcases.map((tc, index) => (
          <div key={index} className="border p-4 rounded">
            <textarea
              value={tc.stdin}
              onChange={(e) =>
                updateTestcase(index, "stdin", e.target.value)
              }
              className="w-full border p-2 rounded"
            />

            <textarea
              value={tc.expected}
              onChange={(e) =>
                updateTestcase(index, "expected", e.target.value)
              }
              className="w-full border p-2 rounded"
            />

            <button
              type="button"
              onClick={() => removeTestcase(index)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addTestcase}
          className="px-4 py-2 border rounded"
        >
          + Add Testcase
        </button>
      </div>

      <button
        onClick={handleUpdate}
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        Update Problem
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function NewAssignmentPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);

  useEffect(() => {
    async function loadProblems() {
      const res = await fetch("/api/problems");
      const data = await res.json();
      setProblems(data);
    }

    loadProblems();
  }, []);

  function toggleProblem(id) {
    setSelectedProblems((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  }

  async function handleCreate() {
    if (!title || !deadline || selectedProblems.length === 0) {
      alert("Fill all fields");
      return;
    }

    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        description,
        deadline,
        problems: selectedProblems
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed");
      return;
    }

    alert("Assignment Created");
    setTitle("");
    setDescription("");
    setDeadline("");
    setSelectedProblems([]);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Create Assignment</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <input
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />

      <h3>Select Problems</h3>

      {problems.map((p) => (
        <div key={p._id}>
          <label>
            <input
              type="checkbox"
              checked={selectedProblems.includes(p._id)}
              onChange={() => toggleProblem(p._id)}
            />
            {p.title} ({p.difficulty})
          </label>
        </div>
      ))}

      <br /><br />

      <button onClick={handleCreate}>
        Create Assignment
      </button>
    </div>
  );
}

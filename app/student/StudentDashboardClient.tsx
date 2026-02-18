"use client";

import { useEffect, useState } from "react";

export default function StudentDashboardClient() {
  const [classrooms, setClassrooms] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/student/classrooms")
      .then(res => res.json())
      .then(data => setClassrooms(data));
  }, []);

  return (
    <div className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">My Classrooms</h1>

      {classrooms.map((c) => (
        <div
          key={c._id}
          onClick={() => window.location.href = `/student/classrooms/${c._id}`}
          className="border p-4 rounded cursor-pointer"
        >
          {c.name}
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function StudentDashboardClient() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await fetch("/api/student/classrooms");
        const data = await res.json();

        // 🔐 Defensive shape handling
        if (Array.isArray(data)) {
          setClassrooms(data);
        } else if (Array.isArray(data.classrooms)) {
          setClassrooms(data.classrooms);
        } else if (Array.isArray(data.data)) {
          setClassrooms(data.data);
        } else {
          setClassrooms([]);
        }
      } catch (err) {
        console.error("Failed to fetch classrooms:", err);
        setClassrooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  return (
    <div className="min-h-screen p-8 space-y-12">
      <h1 className="text-3xl font-bold">
        Student Dashboard
      </h1>

      {/* Practice Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Practice
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div
            onClick={() => window.location.href = "/practice"}
            className="border p-6 rounded-lg hover:bg-gray-50 cursor-pointer transition"
          >
            <h3 className="font-semibold text-lg">
              Public Problems
            </h3>
            <p className="text-sm text-gray-500">
              Solve curated global problems.
            </p>
          </div>

          <div
            onClick={() => window.location.href = "/my-problems"}
            className="border p-6 rounded-lg hover:bg-gray-50 cursor-pointer transition"
          >
            <h3 className="font-semibold text-lg">
              My Private Problems
            </h3>
            <p className="text-sm text-gray-500">
              Practice your saved questions.
            </p>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          AI Generation
        </h2>

        <div
          onClick={() => window.location.href = "/student/ai-generate"}
          className="border p-6 rounded-lg hover:bg-gray-50 cursor-pointer transition"
        >
          <h3 className="font-semibold text-lg">
            Generate New Problem
          </h3>
          <p className="text-sm text-gray-500">
            Create a new practice question using AI.
          </p>
        </div>
      </section>

      {/* Classrooms Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Classrooms
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading classrooms...</p>
        ) : classrooms.length === 0 ? (
          <p className="text-gray-500">
            You are not enrolled in any classrooms.
          </p>
        ) : (
          <div className="space-y-3">
            {classrooms.map((c) => (
              <div
                key={c._id}
                onClick={() =>
                  window.location.href = `/student/classrooms/${c._id}`
                }
                className="border p-4 rounded cursor-pointer hover:bg-gray-50 transition"
              >
                {c.name}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TeacherDashboardClient() {
  const router = useRouter();
  const [problems, setProblems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/problems?scope=all")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProblems(data);
        } else {
          setProblems([]);
        }
      });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#05060f] text-white p-8">
      <h1 className="text-3xl font-bold mb-8">
        Teacher Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        <div
          onClick={() => router.push("/teacher/problems")}
          className="p-6 bg-[#0b0e14] border border-white/10 rounded-xl cursor-pointer hover:bg-[#121622] transition"
        >
          <h2 className="text-xl font-semibold">
            Manage Problems
          </h2>
        </div>

        <div
          onClick={() => router.push("/teacher/classrooms")}
          className="p-6 bg-[#0b0e14] border border-white/10 rounded-xl cursor-pointer hover:bg-[#121622] transition"
        >
          <h2 className="text-xl font-semibold">
            Manage Classrooms
          </h2>
        </div>

      </div>

      <h2 className="text-2xl font-semibold mb-4">
        All Problems
      </h2>

      <div className="space-y-3">
        {problems.map((p: any) => (
          <div
            key={p._id}
            onClick={() => router.push(`/?problemId=${p._id}`)}
            className="p-4 bg-[#0b0e14] border border-white/10 rounded-lg cursor-pointer hover:bg-[#121622] transition"
          >
            <div className="font-medium text-white">
              {p.title}
            </div>
            <div className="text-sm text-gray-400">
              Visibility: {p.visibility}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
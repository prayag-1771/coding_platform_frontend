"use client";

import { useRouter } from "next/navigation";

export default function TeacherDashboardClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">
        Teacher Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div
          onClick={() => router.push("/teacher/problems")}
          className="p-6 border rounded-xl cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold">
            Manage Problems
          </h2>
        </div>

        <div
          onClick={() => router.push("/teacher/classrooms")}
          className="p-6 border rounded-xl cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold">
            Manage Classrooms
          </h2>
        </div>

      </div>
    </div>
  );
}

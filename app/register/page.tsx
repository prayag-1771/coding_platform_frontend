"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0f172a_35%,_#020617_100%)] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-950/85 backdrop-blur-xl border border-cyan-300/20 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.55)] p-8 space-y-6"
      >
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-cyan-100">
            Create Account
          </h1>
          <p className="text-sm text-slate-300">
            Join the coding platform
          </p>
        </div>

        <div className="space-y-4">
          <input
            required
            placeholder="Full Name"
            className="w-full bg-slate-900 border border-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40 outline-none p-3 rounded-lg text-slate-100 placeholder-slate-400 transition"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            required
            type="email"
            placeholder="Email Address"
            className="w-full bg-slate-900 border border-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40 outline-none p-3 rounded-lg text-slate-100 placeholder-slate-400 transition"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            required
            type="password"
            placeholder="Password"
            className="w-full bg-slate-900 border border-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40 outline-none p-3 rounded-lg text-slate-100 placeholder-slate-400 transition"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <select
            className="w-full bg-slate-900 border border-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40 outline-none p-3 rounded-lg text-slate-100 transition"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="author">Author</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-rose-300 text-center bg-rose-500/10 border border-rose-400/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-cyan-300 text-slate-950 font-semibold p-3 rounded-lg hover:bg-cyan-200 transition-all duration-200"
        >
          Register
        </button>

        <p className="text-sm text-center text-slate-300">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-cyan-300 hover:text-cyan-200 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
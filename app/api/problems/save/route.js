export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const problem = await req.json();

    if (
      !problem ||
      !problem.id ||
      !problem.title ||
      !problem.statement ||
      !problem.starterCode ||
      !Array.isArray(problem.testcases)
    ) {
      return NextResponse.json(
        { error: "Invalid problem structure" },
        { status: 400 }
      );
    }

    problem.problemType = "io";
    problem.timeLimit = problem.timeLimit ?? 1000;
    problem.memoryLimit = problem.memoryLimit ?? 256;
    problem.difficulty = problem.difficulty ?? "easy";
    problem.topic = problem.topic ?? [];

    problem.testcases = problem.testcases.map((tc, index) => ({
      id: tc.id ?? `t${index + 1}`,
      input: tc.input ?? tc.stdin ?? "",
      expectedOutput: tc.expectedOutput ?? tc.expected ?? "",
      visibility: tc.visibility ?? "hidden",
      weight: tc.weight ?? 1
    }));

    const problemsDir = path.join(process.cwd(), "problems");
    const filePath = path.join(problemsDir, `${problem.id}.json`);

    await fs.mkdir(problemsDir, { recursive: true });

    await fs.writeFile(
      filePath,
      JSON.stringify(problem, null, 2),
      "utf-8"
    );

    return NextResponse.json({ ok: true });

  } catch (e) {
    return NextResponse.json(
      { error: "Failed to save problem" },
      { status: 500 }
    );
  }
}

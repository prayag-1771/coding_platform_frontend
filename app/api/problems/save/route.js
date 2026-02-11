export const runtime = "nodejs";


import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const problem = await req.json();

    if (!problem || !problem.id) {
      return NextResponse.json(
        { error: "problem.id is required" },
        { status: 400 }
      );
    }

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
    console.error(e);
    return NextResponse.json(
      { error: "Failed to save problem" },
      { status: 500 }
    );
  }
}

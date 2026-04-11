export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const problemsDir = path.join(process.cwd(), "problems");

    let files = [];
    try {
      files = await fs.readdir(problemsDir);
    } catch {
      return NextResponse.json([]);
    }

    const result = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const fullPath = path.join(problemsDir, file);
      const raw = await fs.readFile(fullPath, "utf-8");

      try {
        const obj = JSON.parse(raw);
        result.push({
          id: obj.id,
          title: obj.title,
          difficulty: obj.difficulty,
          topic: obj.topic || []

        });
      } catch {
      }
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list problems" },
      { status: 500 }
    );
  }
}

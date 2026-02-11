export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");

    // /api/problems/<id>
    const id = parts[parts.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      "problems",
      `${id}.json`
    );

    let raw;
    try {
      raw = await fs.readFile(filePath, "utf-8");
    } catch {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    let obj;
    try {
      obj = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Corrupted problem file" },
        { status: 500 }
      );
    }

    return NextResponse.json(obj);

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load problem" },
      { status: 500 }
    );
  }
}

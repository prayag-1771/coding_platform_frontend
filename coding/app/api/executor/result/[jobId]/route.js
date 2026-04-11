export const runtime = "nodejs";

import { NextResponse } from "next/server";

const BASE_URL = process.env.EXECUTOR_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(_req, context) {
  const API_KEY = process.env.EXECUTOR_API_KEY;
  
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Executor service is not configured" },
      { status: 503 }
    );
  }

  try {
    if (!BASE_URL) {
      return NextResponse.json(
        { error: "Executor is not configured" },
        { status: 500 }
      );
    }

    const { jobId } = await context.params;

    const res = await fetch(`${BASE_URL}/result/${jobId}`, {
      headers: {
        "X-API-Key": API_KEY,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Result fetch failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Executor result lookup failed" },
      { status: 500 }
    );
  }
}

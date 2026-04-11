export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getCsrfError } from "@/lib/csrf";

const BASE_URL = process.env.EXECUTOR_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.EXECUTOR_API_KEY || process.env.NEXT_PUBLIC_API_KEY;

export async function POST(req) {
  const csrfError = getCsrfError(req);

  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  try {
    if (!BASE_URL || !API_KEY) {
      return NextResponse.json(
        { error: "Executor is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const res = await fetch(`${BASE_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Submit failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Executor submit failed" },
      { status: 500 }
    );
  }
}

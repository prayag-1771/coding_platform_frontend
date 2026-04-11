export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getCsrfError } from "@/lib/csrf";

export async function POST(req) {
  const csrfError = getCsrfError(req);

  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}

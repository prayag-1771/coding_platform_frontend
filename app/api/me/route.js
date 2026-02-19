export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    let user;
    try {
      user = verifyToken(token);
    } catch {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });

  } catch {
    return NextResponse.json({ user: null });
  }
}

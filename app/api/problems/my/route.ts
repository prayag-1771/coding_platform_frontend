export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import "@/models/register"; // STAR_PROBLEM prevention
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json([], { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json([], { status: 403 });
    }

    let filter: any = {};

    if (user.role === "student") {
      filter = {
        ownerId: user._id,
        visibility: "private",
      };
    }

    if (user.role === "teacher") {
      filter = {
        ownerId: user._id,
      };
    }

    if (user.role === "author") {
      filter = {
        ownerId: user._id,
      };
    }

    const problems = await Problem.find({})
  .sort({ createdAt: -1 })
  .lean();

    return NextResponse.json({
      role: user.role,
      problems,
    });

  } catch (err) {
    console.error("My problems error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
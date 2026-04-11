export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import "@/models/register";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 403 }
      );
    }

    // 🔥 Cast string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(user._id);

    interface ProblemFilter {
      ownerId: mongoose.Types.ObjectId;
      visibility?: string;
    }

    let filter: ProblemFilter = {
      ownerId: userId,
    };

    // Student → only private problems
    if (user.role === "student") {
      filter.visibility = "private";
    }

    // Teacher & Author → all owned problems

    const problems = await Problem.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      role: user.role,
      problems,
    });

  } catch (err) {
    console.error("My problems error:", err);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}
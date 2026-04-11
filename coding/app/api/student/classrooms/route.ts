export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Classroom from "@/models/Classroom";
import "@/models/register";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

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

    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const studentId = user._id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { error: "Invalid student ID" },
        { status: 400 }
      );
    }

    const classrooms = await Classroom.find({
      students: new mongoose.Types.ObjectId(studentId),
    })
      .populate("assignments")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(classrooms);

  } catch (err) {
    console.error("Student classrooms error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
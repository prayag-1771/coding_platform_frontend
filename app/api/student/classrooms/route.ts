export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Classroom from "@/models/Classroom";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

type TokenPayload = {
  id: string;
  role: "student" | "teacher" | "author";
};

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json([], { status: 401 });
    }

    const user = verifyToken(token) as TokenPayload;

    if (!user || user.role !== "student") {
      return NextResponse.json([], { status: 403 });
    }

    console.log("JWT USER:", user.userId);

    const classrooms = await Classroom.find({
      students: {
  $in: [new mongoose.Types.ObjectId(user.id)],
},
    })
      .populate("assignments")
      .sort({ createdAt: -1 });

    console.log("FOUND CLASSROOMS:", classrooms);

    return NextResponse.json(classrooms);

  } catch (err) {
    console.error("Student classrooms error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
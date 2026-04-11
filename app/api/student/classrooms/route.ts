export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Classroom from "@/models/Classroom";
import Assignment from "@/models/Assignment";
import Problem from "@/models/Problem";      
import User from "@/models/User";             
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
  try {
    await connectDB();

void Assignment;
void Problem;
void User;

    mongoose.model("Assignment");
    mongoose.model("Classroom");
    mongoose.model("Problem");
    mongoose.model("User");

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json([], { status: 401 });
    }

    const user = verifyToken(token);

    if (!user || user.role !== "student") {
      return NextResponse.json([], { status: 403 });
    }

    const studentId = user._id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json([], { status: 400 });
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
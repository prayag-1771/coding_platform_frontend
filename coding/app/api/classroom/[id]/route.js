export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Classroom from "@/models/Classroom";
import Assignment from "@/models/Assignment";
import User from "@/models/User"; // ADD THIS
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";


export async function GET(req, context) {
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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const classroom = await Classroom.findById(id)
      .populate("students", "name email")
      .populate({
        path: "assignments",
        populate: {
          path: "problems",
          select: "title difficulty"
        }
      });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    const userId = user._id;
    const isTeacher = classroom.teachers?.some(
      (t) => t.toString() === userId
    );
    const isStudent = classroom.students?.some(
      (s) => s.toString() === userId
    );

    if (!isTeacher && !isStudent) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(classroom);

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

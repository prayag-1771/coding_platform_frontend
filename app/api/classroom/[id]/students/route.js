export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Classroom from "@/models/Classroom";
import User from "@/models/User";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

export async function POST(req, context) {
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

    if (!user || user.role !== "teacher") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const { email } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid classroom ID" },
        { status: 400 }
      );
    }

    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    const student = await User.findOne({ email });

    if (!student || student.role !== "student") {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const alreadyEnrolled = classroom.students.some(
  (id) => id.toString() === student._id.toString()
);

if (alreadyEnrolled) {
  return NextResponse.json(
    { error: "Student already enrolled" },
    { status: 400 }
  );
}

classroom.students.push(
  new mongoose.Types.ObjectId(student._id)
);

await classroom.save();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to add student" },
      { status: 500 }
    );
  }
}

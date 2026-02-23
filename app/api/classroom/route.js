export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Classroom from "@/models/Classroom";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

export async function POST(req) {
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

    const teacherId = user._id;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return NextResponse.json(
        { error: "Invalid teacher ID" },
        { status: 400 }
      );
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Classroom name required" },
        { status: 400 }
      );
    }

    const classroom = await Classroom.create({
      name,
      teachers: [new mongoose.Types.ObjectId(teacherId)],
      students: [],
      assignments: [],
    });

    return NextResponse.json(classroom, { status: 201 });

  } catch (err) {
    console.error("Create classroom error:", err);
    return NextResponse.json(
      { error: "Failed to create classroom" },
      { status: 500 }
    );
  }
}
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

    if (!user || user.role !== "teacher") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const teacherId = user._id;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return NextResponse.json(
        { error: "Invalid teacher ID" },
        { status: 400 }
      );
    }

    const classrooms = await Classroom.find({
      teachers: new mongoose.Types.ObjectId(teacherId),
    })
      .populate("assignments")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(classrooms);

  } catch (err) {
    console.error("Fetch classrooms error:", err);
    return NextResponse.json(
      { error: "Failed to fetch classrooms" },
      { status: 500 }
    );
  }
}
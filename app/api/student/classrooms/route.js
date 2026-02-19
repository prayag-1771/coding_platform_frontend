export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Classroom from "@/models/Classroom";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import Assignment from "@/models/Assignment";


export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json([], { status: 401 });
    }

    let user;
    try {
      user = verifyToken(token);
    } catch (err) {
      return NextResponse.json([], { status: 401 });
    }

    if (!user || user.role !== "student") {
      return NextResponse.json([], { status: 403 });
    }

    const classrooms = await Classroom.find({
      students: user.userId,
    }).populate("assignments");

    return NextResponse.json(classrooms);

  } catch (err) {
    console.error("Student classrooms error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

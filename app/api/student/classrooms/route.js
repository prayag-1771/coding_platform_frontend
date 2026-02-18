export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Classroom from "@/models/Classroom";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json([], { status: 401 });
  }

  const user = verifyToken(token);

  if (!user || user.role !== "student") {
    return NextResponse.json([], { status: 403 });
  }

  const classrooms = await Classroom.find({
    students: user.userId,
  }).populate("assignments");

  return NextResponse.json(classrooms);
}

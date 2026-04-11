export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import Classroom from "@/models/Classroom";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

export async function POST(req, context) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
    }

    const { title, description, deadline, problems } = await req.json();

    const assignment = await Assignment.create({
      title,
      description,
      deadline,
      classroomId: id,
      problems,
      createdBy: new mongoose.Types.ObjectId(user._id),
    });

    classroom.assignments.push(assignment._id);
    await classroom.save();

    return NextResponse.json(assignment, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
